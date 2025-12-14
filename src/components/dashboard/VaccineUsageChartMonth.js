import { Card, CardBody, CardSubtitle, CardTitle } from "reactstrap";
import Chart from "react-apexcharts";
import { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance.ts";
import { useLanguage } from "../../context/LanguageContext.js";

const VaccineUsageChart = () => {
  const { t } = useLanguage();
  const [chartData, setChartData] = useState({
    series: [],
    options: {
      chart: { type: "area", toolbar: { show: false } },
      dataLabels: { enabled: false },
      grid: { strokeDashArray: 3 },
      stroke: { curve: "smooth", width: 2 },
      xaxis: { categories: [] },
      legend: { position: "bottom" },
      colors: ["#0ea5e9"],
      responsive: [
        { breakpoint: 992, options: { chart: { height: 280 } } },
        { breakpoint: 768, options: { chart: { height: 240 }, legend: { show: false } } },
        { breakpoint: 480, options: { chart: { height: 200 }, legend: { show: false }, xaxis: { labels: { show: false } } } }
      ],
    },
  });

  useEffect(() => {
    axiosInstance
      .get("/vaccine-usage-last-month")
      .then((res) => {
        const data = res.data;
        setChartData((prev) => ({
          ...prev,
          series: [
            {
              name: t('UsageCount'),
              data: data.map((item) => item.usage_count),
            },
          ],
          options: {
            ...prev.options,
            xaxis: {
              categories: data.map((item) => item.name),
            },
          },
        }));
      })
      .catch((error) => {
        console.error("Aşı grafiği verisi alınamadı", error);
      });
  }, []);

  return (
    <Card>
      <CardBody>
        <CardTitle tag="h5">{t('VaccineUsageSummaryTitle')}</CardTitle>
        <CardSubtitle className="text-muted" tag="h6">
          {t('VaccineUsageSummarySub')}
        </CardSubtitle>
        <Chart type="area" width="100%" height="300" options={chartData.options} series={chartData.series} />
      </CardBody>
    </Card>
  );
};

export default VaccineUsageChart;
