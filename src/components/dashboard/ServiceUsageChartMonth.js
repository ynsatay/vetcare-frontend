import { Card, CardBody, CardSubtitle, CardTitle } from "reactstrap";
import Chart from "react-apexcharts";
import { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance.ts";

const ServiceUsageChartMonth = () => {
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
      .get("/service-usage-last-month")
      .then((res) => {
        const data = res.data;
        setChartData((prev) => ({
          ...prev,
          series: [
            {
              name: "Kullanım Sayısı",
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
      .catch(() => {})
      ;
  }, []);

  return (
    <Card>
      <CardBody>
        <CardTitle tag="h5">Hizmet Kullanım Özeti</CardTitle>
        <CardSubtitle className="text-muted" tag="h6">
          Son 30 Gün İçinde Kullanılan Hizmetler
        </CardSubtitle>
        <Chart type="area" width="100%" height="300" options={chartData.options} series={chartData.series} />
      </CardBody>
    </Card>
  );
};

export default ServiceUsageChartMonth;
