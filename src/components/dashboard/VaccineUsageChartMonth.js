import { Card, CardBody, CardSubtitle, CardTitle } from "reactstrap";
import Chart from "react-apexcharts";
import { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance.ts";

const VaccineUsageChart = () => {
  const [chartData, setChartData] = useState({
    series: [],
    options: {
      chart: {
        type: "area",
      },
      dataLabels: {
        enabled: false,
      },
      grid: {
        strokeDashArray: 3,
      },
      stroke: {
        curve: "smooth",
        width: 2,
      },
      xaxis: {
        categories: [],
      },
    },
  });

  useEffect(() => {
    // Daha önce veri alındıysa tekrar alma
    const cached = sessionStorage.getItem("vaccineUsageData");
    if (cached) {
      const data = JSON.parse(cached);
      setChartData({
        series: [
          {
            name: "Kullanım Sayısı",
            data: data.map((item) => item.usage_count),
          },
        ],
        options: {
          chart: { type: "area" },
          dataLabels: { enabled: false },
          grid: { strokeDashArray: 3 },
          stroke: { curve: "smooth", width: 2 },
          xaxis: {
            categories: data.map((item) => item.name),
          },
        },
      });
      return;
    }

    // Veri daha önce alınmadıysa API'den çek
    const fetchData = async () => {
      try {
        const res = await axiosInstance.get("/vaccine-usage-last-month");
        const data = res.data;

        // cache'e yaz
        sessionStorage.setItem("vaccineUsageData", JSON.stringify(data));

        setChartData({
          series: [
            {
              name: "Kullanım Sayısı",
              data: data.map((item) => item.usage_count),
            },
          ],
          options: {
            chart: { type: "area" },
            dataLabels: { enabled: false },
            grid: { strokeDashArray: 3 },
            stroke: { curve: "smooth", width: 2 },
            xaxis: {
              categories: data.map((item) => item.name),
            },
          },
        });
      } catch (error) {
        console.error("Aşı grafiği verisi alınamadı", error);
      }
    };

    fetchData();
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
