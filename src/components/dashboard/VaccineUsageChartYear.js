import { useEffect, useMemo, useState } from "react";
import Chart from "react-apexcharts";
import axiosInstance from "../../api/axiosInstance.ts";
import { Syringe, Layers, Percent, Download, PieChart, ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import "../../views/ui/IdentityInfo.css";
import { useLanguage } from "../../context/LanguageContext.js";

  const monthNames = [
    "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
    "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık",
  ];

  const VaccineUsageChartYear = () => {
    const { t, lang } = useLanguage();
    const [series, setSeries] = useState([]);
    const [vaccineNames, setVaccineNames] = useState([]);
    const [selectedVaccines, setSelectedVaccines] = useState([]);
    const [windowStart, setWindowStart] = useState(0);
    const [windowSize, setWindowSize] = useState(12);
    const [stacked, setStacked] = useState(false);
    const [normalized, setNormalized] = useState(false);
    const [grandTotal, setGrandTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [isMobile, setIsMobile] = useState(false);
    const [vaccineFilter, setVaccineFilter] = useState("");

    const clampWindow = (start, size) => {
      const s = Math.max(0, Math.min(12 - size, start));
      const e = Math.min(11, s + size - 1);
      return { min: s, max: e };
    };

    const windowRange = useMemo(() => clampWindow(windowStart, windowSize), [windowStart, windowSize]);

    const baseColors = ["#667eea", "#10b981", "#f59e0b", "#ef4444", "#7c3aed", "#0ea5e9"];

    useEffect(() => {
      const mq = window.matchMedia("(max-width: 1024px)");
      const handler = () => setIsMobile(mq.matches);
      handler();
      mq.addEventListener("change", handler);
      return () => mq.removeEventListener("change", handler);
    }, []);

    useEffect(() => {
      setLoading(true);
      setError("");
      axiosInstance.get("/simple-vaccine-usage").then((res) => {
        const raw = res.data || [];
        const map = {};
        for (const item of raw) {
          const m = (item.month || 1) - 1;
          const name = item.vaccine_name || t('Unknown');
          if (!map[name]) map[name] = new Array(12).fill(0);
          map[name][m] = Number(item.usage || 0);
        }
        const names = Object.keys(map);
        const allSeries = names.map((n) => ({ name: n, data: map[n] }));
        const total = allSeries.reduce((acc, s) => acc + s.data.reduce((a, b) => a + b, 0), 0);
        setSeries(allSeries);
        setVaccineNames(names);
        setSelectedVaccines(names);
        setGrandTotal(total);
      }).catch(() => {
        setError("Veri alınamadı");
      }).finally(() => setLoading(false));
    }, []);

    const areaOptions = useMemo(() => ({
      chart: { type: "area", stacked, toolbar: { show: false } },
      dataLabels: { enabled: false },
      stroke: { curve: "smooth", width: 2 },
      legend: { show: true },
      grid: { strokeDashArray: 3 },
      theme: { mode: "light" },
      colors: baseColors,
      xaxis: { categories: (lang === 'en' ? ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"] : monthNames).slice(windowRange.min, windowRange.max + 1) },
      yaxis: { labels: { formatter: (v) => normalized ? `${Math.round(v)}%` : Math.round(v).toString() } },
      tooltip: { shared: true, intersect: false },
      markers: { size: 0 },
      responsive: [
        { breakpoint: 1200, options: { legend: { position: "bottom" }, chart: { height: 320 }, xaxis: { labels: { rotate: -10 } } } },
        { breakpoint: 992, options: { legend: { position: "bottom" }, chart: { height: 300 }, xaxis: { labels: { rotate: -20 } } } },
        { breakpoint: 768, options: { legend: { show: false }, chart: { height: 260 }, xaxis: { labels: { rotate: -30 } } } },
        { breakpoint: 480, options: { legend: { show: false }, chart: { height: 220 }, xaxis: { labels: { show: false } } } }
      ],
    }), [stacked, normalized, windowRange]);

    const barOptions = useMemo(() => ({
      chart: { type: "bar", stacked: false, toolbar: { show: false } },
      dataLabels: { enabled: false },
      grid: { strokeDashArray: 3 },
      theme: { mode: "light" },
      colors: ["#0ea5e9"],
      xaxis: { categories: (lang === 'en' ? ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"] : monthNames).slice(windowRange.min, windowRange.max + 1) },
      yaxis: { labels: { formatter: (v) => Math.round(v).toString() } },
      tooltip: { shared: true, intersect: false },
      responsive: [
        { breakpoint: 992, options: { legend: { position: "bottom" }, chart: { height: 200 }, xaxis: { labels: { rotate: -15 } } } },
        { breakpoint: 768, options: { legend: { show: false }, chart: { height: 180 }, xaxis: { labels: { rotate: -30 } } } },
        { breakpoint: 480, options: { legend: { show: false }, chart: { height: 160 }, xaxis: { labels: { show: false } } } }
      ],
    }), [windowRange]);

    const filteredSeries = useMemo(() => {
      const names = new Set(selectedVaccines);
      return series.filter((s) => names.has(s.name));
    }, [series, selectedVaccines]);

    const trendSeries = useMemo(() => {
      const { min, max } = windowRange;
      const datas = filteredSeries.map(s => s.data.slice(min, max + 1));
      if (!normalized) return filteredSeries.map((s, idx) => ({ name: s.name, data: datas[idx] }));
      const len = max - min + 1;
      const totals = new Array(len).fill(0);
      datas.forEach(a => a.forEach((v, i) => { totals[i] += v; }));
      const normalizedDatas = datas.map(a => a.map((v, i) => totals[i] ? (v / totals[i]) * 100 : 0));
      return filteredSeries.map((s, idx) => ({ name: s.name, data: normalizedDatas[idx] }));
    }, [filteredSeries, windowRange, normalized]);

    const distributionSeries = useMemo(() => {
      const { min, max } = windowRange;
      const sums = filteredSeries.map(s => ({ name: s.name, value: s.data.slice(min, max + 1).reduce((a, b) => a + b, 0) }));
      const labels = sums.map(s => s.name);
      const values = sums.map(s => s.value);
      return { labels, values };
    }, [filteredSeries, windowRange]);

    const totalsSeries = useMemo(() => {
      const { min, max } = windowRange;
      const len = max - min + 1;
      const totals = new Array(len).fill(0);
      filteredSeries.forEach(s => s.data.slice(min, max + 1).forEach((v, i) => { totals[i] += v; }));
      return [{ name: t('Total'), data: totals }];
    }, [filteredSeries, windowRange]);

    const currentMonthIndex = new Date().getMonth();
    const currentMonthTotal = series.reduce((acc, s) => acc + (s.data[currentMonthIndex] || 0), 0);
    const prevMonthTotal = series.reduce((acc, s) => acc + (s.data[Math.max(0, currentMonthIndex - 1)] || 0), 0);
    const growth = prevMonthTotal ? (((currentMonthTotal - prevMonthTotal) / prevMonthTotal) * 100) : 0;
    const topVaccine = useMemo(() => {
      let best = null;
      let bestSum = -1;
      series.forEach(s => {
        const sum = s.data.reduce((a, b) => a + b, 0);
        if (sum > bestSum) { bestSum = sum; best = s.name; }
      });
      return best || "-";
    }, [series]);

    const topVaccineTrend = useMemo(() => {
      const found = series.find(s => s.name === topVaccine);
      return found ? found.data : new Array(12).fill(0);
    }, [series, topVaccine]);

    const selectTopN = (n) => {
      const sorted = [...series].sort((a, b) => b.data.reduce((x, y) => x + y, 0) - a.data.reduce((x, y) => x + y, 0));
      const names = sorted.slice(0, n).map(s => s.name);
      setSelectedVaccines(names);
    };

    const toggleVaccine = (name) => {
      setSelectedVaccines((prev) => prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]);
    };
    const selectAll = () => setSelectedVaccines(vaccineNames);
    const clearSelection = () => setSelectedVaccines([]);

    const exportCsv = () => {
      const { min, max } = windowRange;
      const cats = monthNames.slice(min, max + 1);
      const header = ["Aşı", ...cats];
      const rows = filteredSeries.map(s => [s.name, ...s.data.slice(min, max + 1)]);
      const csv = [header, ...rows].map(r => r.join(",")).join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "vaccine-usage.csv";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    };

    return (
      <div className="identity-section-card">
        <div className="identity-panel-banner" style={{ 
          background: "linear-gradient(135deg, var(--id-primary-dark, #4f46e5) 0%, var(--id-primary, #6366f1) 50%, var(--id-primary-light, #818cf8) 100%)",
          boxShadow: "0 4px 20px rgba(var(--id-primary-rgb), 0.3)"
        }}>
          <div>
            <div className="identity-panel-title" style={{ fontSize: "1.75rem", fontWeight: 700, marginBottom: 4 }}>
            📊 {t('YearlyVaccineUsage')}
          </div>
          <div className="identity-panel-sub" style={{ fontSize: "1rem", opacity: 0.9 }}>
            {t('DetailedAnalysis')}
          </div>
          </div>
          <div className="identity-header-stats" style={{ gap: 12 }}>
            <div className="identity-stat-pill" style={{ background: "rgba(255, 255, 255, 0.2)", border: "none" }}>
              💉 {t('Total')}: <strong style={{ color: "#fff", fontSize: "1.1em" }}>{grandTotal}</strong>
            </div>
            <div className="identity-stat-pill" style={{ background: "rgba(255, 255, 255, 0.2)", border: "none" }}>
              📅 {t('ThisMonth')}: <strong style={{ color: "#fff", fontSize: "1.1em" }}>{Math.round(currentMonthTotal)}</strong>
            </div>
            <div className="identity-stat-pill" style={{ 
              background: growth >= 0 ? "rgba(255, 255, 255, 0.3)" : "rgba(239, 68, 68, 0.3)",
              border: "none",
              color: growth >= 0 ? "#ffffffff" : "#ef4444"
            }}>
              📈 {t('Change')}: <strong>{growth >= 0 ? "+" : ""}{Math.round(growth)}%</strong>
            </div>
            <div className="identity-stat-pill" style={{ background: "rgba(255, 255, 255, 0.2)", border: "none" }}>
              🏆 {t('Most')}: <strong style={{ color: "#fff", fontSize: "1.1em" }}>{topVaccine}</strong>
            </div>
          </div>
        </div>

        <div className="identity-action-bar" style={{ flexWrap: "wrap", rowGap: 10, columnGap: 10 }}>
          <div className="identity-action-group" style={{ gap: 8 }}>
            <button className="identity-btn identity-btn-xs" onClick={() => setWindowStart(s => Math.max(0, s - 1))}><ChevronLeft size={14} /> {t('Previous')}</button>
            <button className="identity-btn identity-btn-xs" onClick={() => setWindowStart(s => Math.min(12 - windowSize, s + 1))}>{t('Next')} <ChevronRight size={14} /></button>
            <button className={`identity-btn identity-btn-xs ${windowSize === 3 ? "identity-btn-primary" : ""}`} onClick={() => setWindowSize(3)}>{t('Months3')}</button>
            <button className={`identity-btn identity-btn-xs ${windowSize === 6 ? "identity-btn-primary" : ""}`} onClick={() => setWindowSize(6)}>{t('Months6')}</button>
            <button className={`identity-btn identity-btn-xs ${windowSize === 12 ? "identity-btn-primary" : ""}`} onClick={() => setWindowSize(12)}>{t('Months12')}</button>
            <button className={`identity-btn identity-btn-xs ${stacked ? "identity-btn-warning" : ""}`} onClick={() => setStacked(s => !s)}><Layers size={14} /> {t('Stacked')}</button>
            <button className={`identity-btn identity-btn-xs ${normalized ? "identity-btn-accent" : ""}`} onClick={() => setNormalized(n => !n)}><Percent size={14} /> {t('Normalized100')}</button>
          </div>
          <div className="identity-action-group" style={{ marginLeft: "auto", gap: 8 }}>
            <button className="identity-btn identity-btn-primary identity-btn-xs" onClick={exportCsv}><Download size={14} /> {t('Export')}</button>
            <button className="identity-btn identity-btn-xs" onClick={() => selectTopN(5)}>{t('Top5')}</button>
          </div>
        </div>

        {loading && (
          <div style={{ padding: 16 }}>
            <div style={{ height: 390, borderRadius: 12, background: "#f3f4f6" }} />
          </div>
        )}
        {!loading && error && (
          <div style={{ padding: 16 }}>
            <div className="identity-owner-actions"><span className="identity-chip warning">{error}</span></div>
          </div>
        )}
        {!loading && !error && (
          <div style={{ padding: 12 }}>
            <div className="identity-layout" style={{ gap: 20 }}>
              <aside className="identity-sidebar" style={{ alignSelf: "stretch", position: "static", height: "100%" }}>
                <div className="identity-section-card compact" style={{ 
                  background: "linear-gradient(135deg, rgba(var(--id-primary-rgb), 0.14) 0%, rgba(var(--id-primary-rgb), 0.06) 100%)",
                  border: "1px solid rgba(var(--id-primary-rgb), 0.25)",
                  boxShadow: "0 4px 20px rgba(var(--id-primary-rgb), 0.12)",
                  height: isMobile ? 520 : 640,
                  display: "flex",
                  flexDirection: "column"
                }}>
                  <div className="identity-section-header">
                    <h3 className="identity-card-title" style={{ color: "var(--id-text, #0f172a)", fontSize: "1.1rem" }}>
                    💉 {t('VaccineNames')}
                    </h3>
                  </div>
                  <div className="identity-input-group" style={{ 
                    marginBottom: 12,
                    background: "var(--id-bg-card, #ffffff)",
                    border: "1px solid var(--id-border, #e2e8f0)",
                    borderRadius: 8
                  }}>
                    <Search className="identity-input-icon" size={16} color="var(--id-text-muted, #64748b)" />
                    <input 
                      className="identity-owner-input" 
                    placeholder={t('SearchVaccinePlaceholder')} 
                      value={vaccineFilter} 
                      onChange={(e) => setVaccineFilter(e.target.value)}
                      style={{ fontSize: "0.9rem" }}
                    />
                  </div>
                  <div className="identity-checkbox-grid" style={{ 
                    flex: 1,
                    minHeight: 0,
                    overflowY: "auto",
                    padding: 4,
                    background: "var(--id-bg-elevated, #f1f5f9)",
                    borderRadius: 8,
                    gridTemplateColumns: "1fr"
                  }}>
                    {vaccineNames.filter(n => n.toLowerCase().includes(vaccineFilter.toLowerCase())).map((n) => (
                      <label key={n} className="identity-checkbox-card" style={{ 
                        padding: "8px 12px",
                        borderRadius: 6,
                        border: "1px solid var(--id-border, #e2e8f0)",
                        background: selectedVaccines.includes(n)
                          ? "rgba(var(--id-primary-rgb), 0.10)"
                          : "transparent"
                      }}>
                        <input type="checkbox" checked={selectedVaccines.includes(n)} onChange={() => toggleVaccine(n)} />
                        <span style={{ 
                          fontSize: "0.9rem",
                          color: selectedVaccines.includes(n)
                            ? "var(--id-primary, #6366f1)"
                            : "var(--id-text-secondary, #475569)"
                        }}>{n}</span>
                      </label>
                    ))}
                  </div>
                  <div className="identity-owner-actions" style={{ 
                    paddingTop: 12,
                    borderTop: "1px solid var(--id-border, #e2e8f0)",
                    marginTop: 8
                  }}>
                    <button className="identity-btn identity-btn-primary identity-btn-xs" onClick={selectAll}>
                      ✅ {t('SelectAll')}
                    </button>
                    <button className="identity-btn identity-btn-ghost identity-btn-xs" onClick={clearSelection}>
                      🗑️ {t('Clear')}
                    </button>
                    <button className="identity-btn identity-btn-accent identity-btn-xs" onClick={() => selectTopN(5)}>
                      🏆 {t('Top5')}
                    </button>
                  </div>
                  <div style={{ 
                    display: "flex", 
                    flexWrap: "wrap", 
                    gap: 8, 
                    marginTop: 12,
                    padding: 12,
                    background: "linear-gradient(135deg, var(--id-bg-card, #ffffff) 0%, rgba(var(--id-primary-rgb), 0.08) 100%)",
                    borderRadius: 8,
                    border: "1px solid var(--id-border, #e2e8f0)",
                    maxHeight: 140,
                    overflowY: "auto",
                    alignContent: "flex-start"
                  }}>
                    <div style={{ fontSize: "0.8rem", color: "var(--id-text-muted, #64748b)", marginBottom: 4 }}>
                    {t('SelectedVaccines')} ({selectedVaccines.length}):
                    </div>
                    {selectedVaccines.map((n) => (
                      <span key={n} className="identity-stat-pill" style={{ 
                        background: "linear-gradient(135deg, var(--id-primary, #6366f1) 0%, var(--id-primary-dark, #4f46e5) 100%)",
                        color: "white",
                        border: "none",
                        fontSize: "0.8rem",
                        padding: "4px 8px"
                      }}>
                        💉 {n}
                        <button className="identity-icon-btn" onClick={() => toggleVaccine(n)} style={{ 
                          marginLeft: 4,
                          color: "white",
                          opacity: 0.8
                        }}>
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </aside>
              <main className="identity-content">
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 20, alignItems: "stretch" }}>
                  <div className="identity-section-card compact" style={{ 
                    height: "100%",
                    display: "grid",
                    gridTemplateRows: "1fr 1fr",
                    gap: 16
                  }}>
                    <div className="identity-section-card compact" style={{ 
                      background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
                      border: "1px solid #e2e8f0",
                      boxShadow: "0 2px 12px rgba(0, 0, 0, 0.05)",
                      display: "flex",
                      flexDirection: "column"
                    }}>
                      <div className="identity-section-header">
                        <h3 className="identity-card-title" style={{ color: "#334155", fontSize: "1.1rem" }}>
                          📈 {t('MonthlyTotals')}
                        </h3>
                      </div>
                      <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
                        <Chart type="bar" width="100%" height={isMobile ? 180 : 260} options={barOptions} series={totalsSeries} />
                      </div>
                    </div>
                    <div className="identity-section-card compact" style={{ 
                      background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)",
                      border: "1px solid #bae6fd",
                      boxShadow: "0 2px 12px rgba(14, 165, 233, 0.1)",
                      display: "flex",
                      flexDirection: "column"
                    }}>
                      <div className="identity-section-header">
                        <h3 className="identity-card-title" style={{ color: "#0c4a6e", fontSize: "1.1rem" }}>
                          🎯 {t('VaccineDistribution')}
                        </h3>
                      </div>
                      <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
                        <Chart type="donut" width="100%" height={isMobile ? 220 : 260} options={{ 
                          labels: distributionSeries.labels, 
                          legend: { position: "bottom" }, 
                          colors: baseColors,
                          plotOptions: { pie: { donut: { size: '65%' } } }
                        }} series={distributionSeries.values} />
                      </div>
                    </div>
                  </div>
                  <div className="identity-section-card" style={{ 
                    alignSelf: "start",
                    background: "#ffffff",
                    border: "1px solid #f1f5f9",
                    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.06)",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column"
                  }}>
                    <Chart type="area" width="100%" height={isMobile ? 300 : 380} options={areaOptions} series={trendSeries} />
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16, marginTop: 20 }}>
                      <div className="identity-section-card compact" style={{ 
                        background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)",
                        border: "1px solid #bbf7d0",
                        boxShadow: "0 2px 12px rgba(16, 185, 129, 0.1)"
                      }}>
                        <div className="identity-section-header">
                          <h3 className="identity-card-title" style={{ color: "#166534", fontSize: "1rem" }}>
                            🥇 {t('MostUsedVaccine')}
                          </h3>
                        </div>
                        <Chart type="line" width="100%" height={120} options={{ 
                          chart: { sparkline: { enabled: true } }, 
                          stroke: { curve: "smooth", width: 3 }, 
                          colors: ["#10b981"], 
                          tooltip: { enabled: true },
                          markers: { size: 4 }
                        }} series={[{ name: topVaccine, data: topVaccineTrend }]} />
                      </div>
                    </div>
                  </div>
                  
                </div>
              </main>
            </div>
          </div>
        )}
      </div>
    );
  };

  export default VaccineUsageChartYear;
