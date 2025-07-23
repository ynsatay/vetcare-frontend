import { Col, Row } from "reactstrap";
import VaccineUsageChartYear from "../components/dashboard/VaccineUsageChartYear";
import Feeds from "../components/dashboard/Feeds";
// import ProjectTables from "../components/dashboard/ProjectTable";
import TopCards from "../components/dashboard/TopCards";
// import Blog from "../components/dashboard/Blog";
// import bg1 from "../assets/images/bg/bg1.jpg";
// import bg2 from "../assets/images/bg/bg2.jpg";
// import bg3 from "../assets/images/bg/bg3.jpg";
// import bg4 from "../assets/images/bg/bg4.jpg";
import VaccineUsageChartMonth from "../components/dashboard/VaccineUsageChartMonth";
import axiosInstance from '../api/axiosInstance.ts';
import { useEffect, useState } from "react";

// const BlogData = [
//   {
//     image: bg1,
//     title: "This is simple blog",
//     subtitle: "2 comments, 1 Like",
//     description:
//       "This is a wider card with supporting text below as a natural lead-in to additional content.",
//     btnbg: "primary",
//   },
//   {
//     image: bg2,
//     title: "Lets be simple blog",
//     subtitle: "2 comments, 1 Like",
//     description:
//       "This is a wider card with supporting text below as a natural lead-in to additional content.",
//     btnbg: "primary",
//   },
//   {
//     image: bg3,
//     title: "Don't Lamp blog",
//     subtitle: "2 comments, 1 Like",
//     description:
//       "This is a wider card with supporting text below as a natural lead-in to additional content.",
//     btnbg: "primary",
//   },
//   {
//     image: bg4,
//     title: "Simple is beautiful",
//     subtitle: "2 comments, 1 Like",
//     description:
//       "This is a wider card with supporting text below as a natural lead-in to additional content.",
//     btnbg: "primary",
//   },
// ];

const Starter = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axiosInstance.get('/dashboardStats')
      .then(res => {
        setStats(res.data);
        setLoading(false);
      })
      .catch(err => {
        setError('Veriler yüklenemedi');
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Yükleniyor...</div>;
  if (error) return <div>{error}</div>;
  return (
    <div>
      {/***Top Cards***/}
      <Row>
        <Col sm="6" lg="3">
          <TopCards
            bg="bg-light-info text-info"
            title="Ziyaretler"
            subtitle="Tamamlanan Randevular(Ay)"
            earning={stats.appCompleted}
            icon="bi bi-calendar2-check"
          />
        </Col>
        <Col sm="6" lg="3">
          <TopCards
            bg="bg-light-warning text-warning"
            title="Randevular"
            subtitle="Bugünkü Randevular"
            earning={stats.appointments}
            icon="bi bi-calendar-event"
          />
        </Col>
        <Col sm="6" lg="3">
          <TopCards
            bg="bg-light-success text-success"
            title="Aşı Uygulaması"
            subtitle="Bu Ay Yapılan Aşı"
            earning={stats.vaccines}
            icon="bi bi-eyedropper"
          />
        </Col>
        <Col sm="6" lg="3">
          <TopCards
            bg="bg-light-danger text-danger"
            title="Tahsilat"
            subtitle="Bu Ay Yapılan Tahsilatlar"
            earning={`₺${stats.payments.toLocaleString()}`}
            icon="bi bi-wallet2"
          />
        </Col>
      </Row>

      {/***Sales & Feed***/}
      <Row>
        <Col sm="12" lg="12" xl="12" xxl="12">
          <VaccineUsageChartYear />
        </Col>

      </Row>
      <Row>
        <Col sm="6" lg="6" xl="7" xxl="8">
          <VaccineUsageChartMonth />
        </Col>
        <Col sm="6" lg="6" xl="5" xxl="4" style={{ minHeight: '400px' }}>
          <Feeds />
        </Col>
      </Row>
      {/***Table ***/}
      {/* <Row>
        <Col lg="12">
          <ProjectTables />
        </Col>
      </Row> */}
      {/***Blog Cards***/}
      {/* <Row>
        {BlogData.map((blg, index) => (
          <Col sm="6" lg="6" xl="3" key={index}>
            <Blog
              image={blg.image}
              title={blg.title}
              subtitle={blg.subtitle}
              text={blg.description}
              color={blg.btnbg}
            />
          </Col>
        ))}
      </Row> */}
    </div>
  );
};

export default Starter;
