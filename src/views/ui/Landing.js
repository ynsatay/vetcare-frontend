import React, { useEffect } from 'react';
import { Container, Row, Col, Button, Card, CardBody, CardTitle, CardText } from 'reactstrap';
import { useNavigate } from 'react-router-dom';
import heroImage from '../../assets/images/bg/bgmain3.png';
import "../scss/_login.scss";
import { useLocation } from "react-router-dom";

const Landing = () => {
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        if (location.state && location.state.scrollTo) {
            const id = location.state.scrollTo;
            // Küçük bir timeout ile sayfa render tamamlandıktan sonra scroll yap
            setTimeout(() => {
                const element = document.getElementById(id);
                if (element) {
                    const yOffset = -60; // navbar yüksekliği kadar offset
                    const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
                    window.scrollTo({ top: y, behavior: "smooth" });
                }
                // Scroll işleminden sonra history state'ini temizlemek için:
                navigate(location.pathname, { replace: true, state: {} });
            }, 100);
        }
    }, [location.state, location.pathname, navigate]);

    return (
        <div style={{ background: '#f8f9fa', width: '100%', paddingTop: 60, paddingBottom: 80 }}>
            <Container fluid className="d-flex flex-column justify-content-center" style={{ maxWidth: 1200 }}>

                {/* Hero Section */}
                <Row className="align-items-center mb-5">
                    <Col md="6" className="text-center text-md-start px-md-5">
                        <h1 className="display-3 fw-bold text-purple" style={{ color: "#59018b", lineHeight: 1.1 }}>
                            Veteriner Otomasyon Sistemi
                        </h1>
                        <p className="lead text-secondary my-4" style={{ fontSize: '1.2rem', maxWidth: 460 }}>
                            Kliniklerinizi kolayca yönetin. Hasta kayıtları, stok takibi, randevu yönetimi ve daha fazlası tek bir platformda!
                        </p>
                        <div className="d-flex gap-3 justify-content-center justify-content-md-start">
                            <Button
                                color="primary"
                                size="lg"
                                className="shadow-sm"
                                onClick={() => navigate('/login')}
                                style={{ minWidth: 130, fontWeight: 600 }}
                            >
                                Giriş Yap
                            </Button>
                            <Button
                                color="outline-primary"
                                size="lg"
                                className="shadow-sm"
                                onClick={() => navigate('/register')}
                                style={{ minWidth: 130, fontWeight: 600 }}
                            >
                                Ücretsiz Dene
                            </Button>
                        </div>
                    </Col>

                    <Col md="6" className="mt-4 mt-md-0 text-center">
                        <img
                            src={heroImage}
                            alt="Veteriner Otomasyon"
                            style={{ maxWidth: '100%', borderRadius: 15 }}
                        />
                    </Col>
                </Row>

                {/* Features Section */}
                <Row className="mb-5 text-center">
                    {[
                        { icon: "📋", title: "Hasta Yönetimi", desc: "Kolay kayıt, detaylı dosya takibi, hızlı erişim." },
                        { icon: "📦", title: "Stok Takibi", desc: "İlaç, malzeme ve temizlik ürünlerinizi yönetin." },
                        { icon: "📅", title: "Randevu Takvimi", desc: "Takvim tabanlı randevu yönetimi ile vakit kazanın." }
                    ].map(({ icon, title, desc }) => (
                        <Col key={title} md="4" className="mb-4">
                            <div className="p-4 bg-white rounded shadow-sm h-100 d-flex flex-column align-items-center justify-content-center">
                                <div style={{ fontSize: '3rem' }}>{icon}</div>
                                <h5 className="mt-3 mb-2 fw-bold" style={{ color: "#59018b" }}>{title}</h5>
                                <p className="text-muted mb-0" style={{ fontSize: '1rem' }}>{desc}</p>
                            </div>
                        </Col>
                    ))}
                </Row>

                {/* Pricing Plans */}
                <section>
                    <h2 className="text-center fw-bold text-primary mb-3">Fiyatlandırma Planları</h2>
                    <p className="text-center text-muted mb-5">
                        İhtiyacınıza en uygun planı seçin. Ücretsiz plan ile hemen başlayabilirsiniz!
                    </p>

                    <Row className="justify-content-center">
                        {[
                            {
                                title: "Başlangıç",
                                price: "₺149 / ay",
                                features: ["1 Kullanıcı", "Temel Hasta Takibi", "Stok Görüntüleme"],
                                noFeatures: ["Randevu Takvimi"],
                                textColor: "success",
                                btnColor: "success",
                                btnOutline: false,
                                btnText: "Planı Seç",
                            },
                            {
                                title: "Standart",
                                price: "₺299 / ay",
                                features: ["5 Kullanıcı", "Hasta + Stok Yönetimi", "Randevu Takvimi", "Erişim Yetkileri"],
                                noFeatures: [],
                                textColor: "primary",
                                btnColor: "primary",
                                btnOutline: true,
                                btnText: "Planı Seç",
                            },
                            {
                                title: "Profesyonel",
                                price: "499 / ay",
                                features: ["Sınırsız Kullanıcı", "Gelişmiş Raporlama", "Tüm Modüller", "Öncelikli Destek"],
                                noFeatures: [],
                                textColor: "info",
                                btnColor: "info",
                                btnOutline: true,
                                btnText: "Planı Seç",
                            }
                        ].map(({ title, price, features, noFeatures, textColor, btnColor, btnOutline, btnText }) => (
                            <Col key={title} md="4" className="mb-4">
                                <Card className="shadow-sm h-100 border-0 rounded">
                                    <CardBody className="text-center bg-light rounded">
                                        <h4 className={`fw-bold mb-3 text-${textColor}`}>{title}</h4>
                                        <h2 className={`my-3 fw-bold text-${textColor}`}>{price}</h2>
                                        <ul className="list-unstyled mb-4 text-muted" style={{ fontSize: "1rem" }}>
                                            {features.map(f => (
                                                <li key={f}>✔ {f}</li>
                                            ))}
                                            {noFeatures.map(nf => (
                                                <li key={nf} style={{ opacity: 0.5 }}>✖ {nf}</li>
                                            ))}
                                        </ul>
                                        <Button
                                            color={btnColor}
                                            outline={btnOutline}
                                            size="lg"
                                            onClick={() => navigate('/register')}
                                            style={{ minWidth: 140, fontWeight: 600 }}
                                        >
                                            {btnText}
                                        </Button>
                                    </CardBody>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </section>



                {/* About & Contact Section */}
                <section style={{ marginTop: 80, marginBottom: 80 }}>
                    <Container fluid style={{ maxWidth: '100%', width: '100%' }}>
                        {/* Hakkımızda Bölümü */}
                        <Row id="about" className="justify-content-center mb-5">
                            <Col md={12} lg={10} xl={8}>
                                <Card
                                    className="shadow-sm border-0 rounded"
                                    style={{
                                        backgroundColor: '#fff',
                                        padding: '40px',
                                    }}
                                >
                                    <CardBody>
                                        <CardTitle
                                            tag="h2"
                                            className="text-center fw-bold mb-4"
                                            style={{
                                                color: '#59018b',
                                                borderBottom: '4px solid #59018b',
                                                paddingBottom: '10px',
                                                maxWidth: 'fit-content',
                                                margin: '0 auto 30px',
                                                letterSpacing: '1px',
                                            }}
                                        >
                                            Hakkımızda
                                        </CardTitle>

                                        <CardText className="text-dark fs-5" style={{ lineHeight: 1.8, marginBottom: '2.5rem' }}>
                                            Biz veteriner kliniklerin işlerini kolaylaştırmak için modern, kullanıcı dostu ve güçlü bir otomasyon sistemi sunuyoruz.
                                            Hasta kayıtlarından randevu yönetimine, stok takibinden raporlamaya kadar her şeyi tek platformda topluyoruz.
                                        </CardText>

                                        <Row>
                                            <Col md={6} className="mb-4">
                                                <h4 style={{ color: '#59018b', marginBottom: '12px' }}>Vizyonumuz</h4>
                                                <p className="text-muted fs-6" style={{ lineHeight: 1.6 }}>
                                                    Türkiye’nin en güvenilir ve kapsamlı veteriner otomasyon sistemini geliştirerek,
                                                    kliniklerin dijital dönüşümünü hızlandırmak.
                                                </p>
                                            </Col>
                                            <Col md={6} className="mb-4">
                                                <h4 style={{ color: '#59018b', marginBottom: '12px' }}>Misyonumuz</h4>
                                                <p className="text-muted fs-6" style={{ lineHeight: 1.6 }}>
                                                    Kullanıcı dostu, esnek ve güçlü araçlarla veterinerlerin iş süreçlerini kolaylaştırmak,
                                                    hayvan sağlığına katkı sağlamak.
                                                </p>
                                            </Col>
                                        </Row>
                                    </CardBody>
                                </Card>
                            </Col>
                        </Row>

                        {/* İletişim Bölümü */}
                        <Row id="contact" className="justify-content-center">
                            <Col md={12} lg={10} xl={8}>
                                <Card
                                    className="shadow-sm border-0 rounded"
                                    style={{
                                        backgroundColor: '#fff',
                                        padding: '40px',
                                    }}
                                >
                                    <CardBody>
                                        <CardTitle
                                            tag="h2"
                                            className="text-center fw-bold mb-4"
                                            style={{
                                                color: '#59018b',
                                                borderBottom: '4px solid #59018b',
                                                paddingBottom: '10px',
                                                maxWidth: 'fit-content',
                                                margin: '0 auto 30px',
                                                letterSpacing: '1px',
                                            }}
                                        >
                                            İletişim
                                        </CardTitle>

                                        <p className="text-dark fs-5 mb-4" style={{ lineHeight: 1.8 }}>
                                            Herhangi bir sorunuz veya talebiniz için bize ulaşabilirsiniz:
                                        </p>

                                        <ul
                                            className="list-unstyled text-dark fs-5"
                                            style={{ lineHeight: 2, maxWidth: '400px', margin: '0 auto' }}
                                        >
                                            <li style={{ marginBottom: '15px', display: 'flex', alignItems: 'center' }}>
                                                <i
                                                    className="bi bi-envelope-fill"
                                                    style={{ color: '#59018b', marginRight: '15px', fontSize: '1.4rem' }}
                                                />
                                                <strong>Email:</strong>&nbsp;info@veterineroto.com
                                            </li>
                                            <li style={{ marginBottom: '15px', display: 'flex', alignItems: 'center' }}>
                                                <i
                                                    className="bi bi-telephone-fill"
                                                    style={{ color: '#59018b', marginRight: '15px', fontSize: '1.4rem' }}
                                                />
                                                <strong>Telefon:</strong>&nbsp;+90 555 123 45 67
                                            </li>
                                            <li style={{ display: 'flex', alignItems: 'center' }}>
                                                <i
                                                    className="bi bi-geo-alt-fill"
                                                    style={{ color: '#59018b', marginRight: '15px', fontSize: '1.4rem' }}
                                                />
                                                <strong>Adres:</strong>&nbsp;İstanbul, Türkiye
                                            </li>
                                        </ul>
                                    </CardBody>
                                </Card>
                            </Col>
                        </Row>
                    </Container>
                </section>
            </Container>
        </div>
    );
};

export default Landing;
