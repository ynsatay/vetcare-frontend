import { Card, CardBody, CardSubtitle, CardTitle } from "reactstrap";
import Chart from "react-apexcharts";
import { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance.ts";

const VaccineUsageChart = () => {
  const [chartData, setChartData] = useState({
    series: [],
    options: {
      chart: { type: "area" },
      dataLabels: { enabled: false },
      grid: { strokeDashArray: 3 },
      stroke: { curve: "smooth", width: 2 },
      xaxis: { categories: [] },
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
      .catch((error) => {
        console.error("Aşı grafiği verisi alınamadı", error);
      });
  }, []);

  return (
    <Card>
      <CardBody>
        <CardTitle tag="h5">Aşı Kullanım Özeti</CardTitle>
        <CardSubtitle className="text-muted" tag="h6">
          Son 30 Gün İçinde Kullanılan Aşılar
        </CardSubtitle>
        <Chart
          type="area"
          width="100%"
          height="390"
          options={chartData.options}
          series={chartData.series}
        />
      </CardBody>
    </Card>
  );
};

export default VaccineUsageChart;
