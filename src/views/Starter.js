import { Col, Row, Card, CardBody, CardTitle } from "reactstrap";
import VaccineUsageChartYear from "../components/dashboard/VaccineUsageChartYear";
import StockUsageChartYear from "../components/dashboard/StockUsageChartYear";
import ServiceUsageChartYear from "../components/dashboard/ServiceUsageChartYear";
import Feeds from "../components/dashboard/Feeds";
// import ProjectTables from "../components/dashboard/ProjectTable";
import TopCards from "../components/dashboard/TopCards";
// import Blog from "../components/dashboard/Blog";
// import bg1 from "../assets/images/bg/bg1.jpg";
// import bg2 from "../assets/images/bg/bg2.jpg";
// import bg3 from "../assets/images/bg/bg3.jpg";
// import bg4 from "../assets/images/bg/bg4.jpg";
import VaccineUsageChartMonth from "../components/dashboard/VaccineUsageChartMonth";
import StockUsageChartMonth from "../components/dashboard/StockUsageChartMonth";
import ServiceUsageChartMonth from "../components/dashboard/ServiceUsageChartMonth";
import axiosInstance from '../api/axiosInstance.ts';
import { useEffect, useMemo, useState } from "react";
import ReactApexChart from 'react-apexcharts';
import './ui/IdentityInfo.css';
import { useLanguage } from '../context/LanguageContext.js';

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
  const { t } = useLanguage();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('genel');
  const [feedsTab, setFeedsTab] = useState('payments');
  const [paymentsFeeds, setPaymentsFeeds] = useState([]);
  const [appointmentFeeds, setAppointmentFeeds] = useState([]);

  useEffect(() => {
    axiosInstance.get('/dashboardStats')
      .then(res => {
        setStats(res.data);
        setLoading(false);
      })
      .catch(err => {
        setError(t('DataLoadFailed'));
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    axiosInstance.get('/feeds?category=payments').then(res => setPaymentsFeeds(res.data)).catch(() => {});
    axiosInstance.get('/feeds?category=appointment').then(res => setAppointmentFeeds(res.data)).catch(() => {});
  }, []);

  const paymentsHours = useMemo(() => {
    const arr = new Array(24).fill(0);
    paymentsFeeds.forEach(f => { const h = new Date(f.created_at).getHours(); arr[h]++; });
    return arr.slice(8, 21);
  }, [paymentsFeeds]);

  const appointmentHours = useMemo(() => {
    const arr = new Array(24).fill(0);
    appointmentFeeds.forEach(f => { const h = new Date(f.created_at).getHours(); arr[h]++; });
    return arr.slice(8, 21);
  }, [appointmentFeeds]);

  const hoursLabels = useMemo(() => {
    const base = Array.from({ length: 13 }, (_, i) => i + 8);
    return base.map(h => (h < 10 ? `0${h}` : `${h}`));
  }, []);

  const barOptions = useMemo(() => ({
    chart: { toolbar: { show: false } },
    grid: { borderColor: '#eee' },
    dataLabels: { enabled: false },
    xaxis: { categories: hoursLabels, labels: { style: { fontSize: '12px' } } },
    colors: ['#3b82f6'],
    plotOptions: { bar: { borderRadius: 6, columnWidth: '55%' } },
    yaxis: { labels: { style: { fontSize: '12px' } } }
  }), [hoursLabels]);

  const busiestPaymentHour = useMemo(() => {
    let idx = 0, max = -1; paymentsHours.forEach((v, i) => { if (v > max) { max = v; idx = i; } }); return hoursLabels[idx] || '';
  }, [paymentsHours, hoursLabels]);

  const busiestAppointmentHour = useMemo(() => {
    let idx = 0, max = -1; appointmentHours.forEach((v, i) => { if (v > max) { max = v; idx = i; } }); return hoursLabels[idx] || '';
  }, [appointmentHours, hoursLabels]);

  if (loading) return <div>{t('Loading')}</div>;
  if (error) return <div>{error}</div>;
  return (
    <div>
      {/***Top Cards***/}
      <Row>
        <Col sm="6" lg="3">
          <TopCards
            bg="bg-light-info text-info"
            title={t('Visits')}
            subtitle={t('MonthlyCompletedAppointments')}
            earning={stats.appCompleted}
            icon="bi bi-calendar2-check"
          />
        </Col>
        <Col sm="6" lg="3">
          <TopCards
            bg="bg-light-warning text-warning"
            title={t('Appointments')}
            subtitle={t('TodayAppointments')}
            earning={stats.appointments}
            icon="bi bi-calendar-event"
          />
        </Col>
        <Col sm="6" lg="3">
          <TopCards
            bg="bg-light-success text-success"
            title={t('VaccinationApplication')}
            subtitle={t('VaccinationsThisMonth')}
            earning={stats.vaccines}
            icon="bi bi-eyedropper"
          />
        </Col>
        <Col sm="6" lg="3">
          <TopCards
            bg="bg-light-danger text-danger"
            title={t('Payments')}
            subtitle={t('PaymentsThisMonth')}
            earning={`₺${stats.payments.toLocaleString()}`}
            icon="bi bi-wallet2"
          />
        </Col>
      </Row>

      <div className="identity-tabs" style={{ marginTop: 16 }}>
        <button className={`identity-tab ${activeTab === 'genel' ? 'active' : ''}`} onClick={() => setActiveTab('genel')}>{t('VaccineUsageTab')}</button>
        <button className={`identity-tab ${activeTab === 'stok' ? 'active' : ''}`} onClick={() => setActiveTab('stok')}>{t('StockUsageTab')}</button>
        <button className={`identity-tab ${activeTab === 'hizmet' ? 'active' : ''}`} onClick={() => setActiveTab('hizmet')}>{t('ServiceUsageTab')}</button>
        <button className={`identity-tab ${activeTab === 'ozet' ? 'active' : ''}`} onClick={() => setActiveTab('ozet')}>{t('SummaryFeedsTab')}</button>
      </div>

      {activeTab === 'genel' ? (
        <Row>
          <Col sm="12" lg="12" xl="12" xxl="12">
            <VaccineUsageChartYear />
          </Col>
        </Row>
      ) : activeTab === 'stok' ? (
        <Row>
          <Col sm="12" lg="12" xl="12" xxl="12">
            <StockUsageChartYear />
          </Col>
        </Row>
      ) : activeTab === 'hizmet' ? (
        <Row>
          <Col sm="12" lg="12" xl="12" xxl="12">
            <ServiceUsageChartYear />
          </Col>
        </Row>
      ) : (
        <>
          <Row style={{ marginTop: 8 }}>
            <Col sm="12" lg="12" xl="12" xxl="12">
              <Feeds activeTab={feedsTab} onTabChange={setFeedsTab} />
            </Col>
          </Row>
          <Row style={{ marginTop: 8 }}>
            <Col sm="12" lg="12" xl="12" xxl="12">
              {feedsTab === 'vaccine' && (
                <VaccineUsageChartMonth />
              )}
              {feedsTab === 'stock' && (
                <StockUsageChartMonth />
              )}
              {feedsTab === 'service' && (
                <ServiceUsageChartMonth />
              )}
              {feedsTab === 'payments' && (
                <Card>
                  <CardBody>
                    <CardTitle tag="h5">{t('PaymentsHourlyDistribution')}</CardTitle>
                    <div className="identity-owner-actions" style={{ gap: 8, flexWrap: 'wrap' }}>
                      <span className="identity-chip info">{t('Total')}: {paymentsFeeds.length}</span>
                      {busiestPaymentHour && <span className="identity-chip success">{t('Busiest')}: {busiestPaymentHour}</span>}
                    </div>
                    <div style={{ marginTop: 8 }}>
                      <ReactApexChart type="bar" height={220} series={[{ name: t('CountLabel'), data: paymentsHours }]} options={barOptions} />
                    </div>
                  </CardBody>
                </Card>
              )}
              {feedsTab === 'appointment' && (
                <Card>
                  <CardBody>
                    <CardTitle tag="h5">{t('AppointmentsHourlyDistribution')}</CardTitle>
                    <div className="identity-owner-actions" style={{ gap: 8, flexWrap: 'wrap' }}>
                      <span className="identity-chip info">{t('Total')}: {appointmentFeeds.length}</span>
                      {busiestAppointmentHour && <span className="identity-chip success">{t('Busiest')}: {busiestAppointmentHour}</span>}
                    </div>
                    <div style={{ marginTop: 8 }}>
                      <ReactApexChart type="bar" height={220} series={[{ name: t('CountLabel'), data: appointmentHours }]} options={barOptions} />
                    </div>
                  </CardBody>
                </Card>
              )}
            </Col>
          </Row>
        </>
      )}
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
