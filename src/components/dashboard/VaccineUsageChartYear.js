  import { useEffect, useState } from "react";
  import { Card, CardBody, CardSubtitle, CardTitle } from "reactstrap";
  import Chart from "react-apexcharts";
  import axiosInstance from "../../api/axiosInstance.ts";

  const VaccineUsageChartSimple = () => {
    const [chartoptions, setChartOptions] = useState({
      series: [],
      options: {
        chart: { type: "area" },
        dataLabels: { enabled: false },
        stroke: { curve: "smooth", width: 2 },
        xaxis: {
          categories: [
            "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
            "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık",
          ],
          min: 0,
          max: 5,
        },
      },
    });

    useEffect(() => {
      axiosInstance.get("/simple-vaccine-usage").then((res) => {
        const raw = res.data;

        const vaccineMap = {};
        for (let item of raw) {
          const monthIdx = item.month - 1;
          if (!vaccineMap[item.vaccine_name]) {
            vaccineMap[item.vaccine_name] = new Array(12).fill(0);
          }
          vaccineMap[item.vaccine_name][monthIdx] = Number(item.usage);
        }

        const series = Object.entries(vaccineMap).map(([name, data]) => ({
          name,
          data,
        }));

        const currentMonthIdx = new Date().getMonth()+1;
        const visibleCount = 5;

        // currentMonthIdx'i merkeze alacak şekilde min/max hesapla
        let min = Math.max(0, currentMonthIdx - Math.floor(visibleCount / 2));
        let max = min + visibleCount - 1;

        if (currentMonthIdx >= 11) {
          max = 12
          min=8  
        }

        setChartOptions((prev) => ({
          ...prev,
          series,
          options: {
            ...prev.options,
            xaxis: {
              ...prev.options.xaxis,
              min,
              max,
            },
          },
        }));
      });
    }, []);

    return (
      <Card>
        <CardBody>
          <CardTitle tag="h5">Yıllık Aşı Kullanımı</CardTitle>
          <CardSubtitle className="text-muted" tag="h6">
            Basit ve net aşı analizi (12 ay)
          </CardSubtitle>
          <Chart
            type="area"
            width="100%"
            height="390"
            options={chartoptions.options}
            series={chartoptions.series}
          />
        </CardBody>
      </Card>
    );
  };

  export default VaccineUsageChartSimple;
