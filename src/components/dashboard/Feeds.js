import React, { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import axiosInstance from "../../api/axiosInstance.ts";
import {
  Card,
  CardBody,
  CardTitle,
  ListGroup,
  CardSubtitle,
  ListGroupItem,
  Button,
} from "reactstrap";
import "../../views/ui/IdentityInfo.css";
import timezone from "dayjs/plugin/timezone";
import tr from "dayjs/locale/tr";

dayjs.extend(timezone);
dayjs.locale(tr);

const Feeds = ({ activeTab: controlledTab, onTabChange, onData }) => {
  const [feeds, setFeeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [localTab, setLocalTab] = useState("payments");
  const [search, setSearch] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const activeTab = controlledTab ?? localTab;

  dayjs.extend(customParseFormat);
  const fmt = (s) => {
    if (!s) return "";
    const str = String(s);
    if (str.includes("T") && (str.endsWith("Z") || /[\\+\\-]\\d{2}:?\\d{2}$/.test(str))) {
      const base = new Date(str);
      const adj = new Date(base.getTime() + 3 * 60 * 60 * 1000);
      const yyyy = adj.getUTCFullYear().toString();
      const mm = (adj.getUTCMonth() + 1).toString().padStart(2, "0");
      const dd = adj.getUTCDate().toString().padStart(2, "0");
      const hh = adj.getUTCHours().toString().padStart(2, "0");
      const min = adj.getUTCMinutes().toString().padStart(2, "0");
      return `${dd}.${mm}.${yyyy} ${hh}:${min}`;
    }
    const m = str.match(/^(\\d{4})-(\\d{2})-(\\d{2})\\s(\\d{2}):(\\d{2})(?::\\d{2})?$/);
    if (m) {
      const [, y, mo, d, h, mi] = m;
      return `${d}.${mo}.${y} ${h}:${mi}`;
    }
    const d = dayjs(str, "YYYY-MM-DD HH:mm:ss");
    return d.isValid() ? d.format("DD.MM.YYYY HH:mm") : dayjs(str).format("DD.MM.YYYY HH:mm");
  };
  useEffect(() => {
    setLoading(true);
    axiosInstance
      .get(`/feeds?category=${activeTab}`)
      .then((res) => {
        setFeeds(res.data);
        if (onData) onData(res.data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [activeTab]);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    const handler = () => setIsMobile(mq.matches);
    handler();
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const kpi = useMemo(() => {
    const total = feeds.length;
    const last = feeds[0];
    const users = new Set(feeds.map((f) => f.user_name)).size;
    return {
      total,
      lastTitle: last?.title ?? "",
      lastTime: last ? fmt(last.created_at) : "",
      users,
    };
  }, [feeds]);

  if (loading) {
    return (
      <Card>
        <CardBody>
          <CardTitle tag="h5">Akışlar</CardTitle>
          <CardSubtitle className="mb-2 text-muted" tag="h6">
            Yükleniyor...
          </CardSubtitle>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardBody>
        <CardTitle tag="h5">Akışlar</CardTitle>
        <div className="identity-tabs" style={{ marginTop: 8, marginBottom: 8 }}>
          <button className={`identity-tab ${activeTab === 'payments' ? 'active' : ''}`} onClick={() => (onTabChange ? onTabChange('payments') : setLocalTab('payments'))}>Tahsilat</button>
          <button className={`identity-tab ${activeTab === 'vaccine' ? 'active' : ''}`} onClick={() => (onTabChange ? onTabChange('vaccine') : setLocalTab('vaccine'))}>Aşı</button>
          <button className={`identity-tab ${activeTab === 'stock' ? 'active' : ''}`} onClick={() => (onTabChange ? onTabChange('stock') : setLocalTab('stock'))}>Stok</button>
          <button className={`identity-tab ${activeTab === 'service' ? 'active' : ''}`} onClick={() => (onTabChange ? onTabChange('service') : setLocalTab('service'))}>Hizmet</button>
          <button className={`identity-tab ${activeTab === 'appointment' ? 'active' : ''}`} onClick={() => (onTabChange ? onTabChange('appointment') : setLocalTab('appointment'))}>Randevu</button>
        </div>
        <div className="identity-owner-actions" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
          <span className="identity-chip info">Toplam: {kpi.total}</span>
          <span className="identity-chip success">Kullanıcı: {kpi.users}</span>
          {kpi.lastTitle && <span className="identity-chip">Son: {kpi.lastTitle}</span>}
          {kpi.lastTime && <span className="identity-chip warning">Zaman: {kpi.lastTime}</span>}
        </div>
        <div className="identity-input-group" style={{ marginBottom: 10 }}>
          <input
            className="identity-owner-input"
            placeholder="Akışlarda ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ fontSize: "0.9rem" }}
          />
          <button
            className="identity-btn identity-btn-xs"
            onClick={() => {
              const header = ["Kullanıcı", "Başlık", "İkon", "Renk", "Tarih"];
              const rows = feeds.map((f) => [
                f.user_name,
                f.title,
                f.icon,
                f.color,
                fmt(f.created_at),
              ]);
              const csv = [header, ...rows].map((r) => r.join(",")).join("\n");
              const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `feeds-${activeTab}.csv`;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
            }}
            style={{ marginLeft: 8 }}
          >
            Dışa Aktar
          </button>
        </div>
        <ListGroup
          flush
          className="mt-3"
          style={{ height: isMobile ? "300px" : "380px", maxHeight: isMobile ? "300px" : "380px", overflowY: "auto" }}
        >
          {feeds.length === 0 ? (
            <ListGroupItem className="text-center">Akış yok</ListGroupItem>
          ) : (
            feeds
              .filter((f) => {
                const s = search.trim().toLowerCase();
                if (!s) return true;
                return (
                  (f.title || "").toLowerCase().includes(s) ||
                  (f.user_name || "").toLowerCase().includes(s)
                );
              })
              .map((feed, index) => (
              <ListGroupItem
                key={index}
                className="d-flex justify-content-between align-items-center p-3 border-0"
              >
                <div className="d-flex align-items-center">
                  <Button
                    className="rounded-circle me-3"
                    size="sm"
                    color={feed.color || "primary"}
                  >
                    <i className={feed.icon || "bi bi-info-circle"}></i>
                  </Button>
                  <div>
                    <strong>{feed.user_name}</strong> — {feed.title}
                  </div>
                </div>
                <small className="text-muted text-small" style={{ whiteSpace: "nowrap" }}>
                  {fmt(feed.created_at)}
                </small>
              </ListGroupItem>
            ))
          )}
        </ListGroup>
      </CardBody>
    </Card>
  );
};

export default Feeds;
