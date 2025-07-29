import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Button, Card, CardBody, CardTitle, CardText, Modal, ModalBody, ModalHeader, Form, FormGroup, Label, Input } from 'reactstrap';
import { useNavigate } from 'react-router-dom';
import heroImage from '../../assets/images/bg/bgmain3.png';
import "../scss/_login.scss";
import { useLocation } from "react-router-dom";
import StockInvoice from '../../assets/screenshots/Screenshot_1.png';
import randevuImg from '../../assets/screenshots/Screenshot_2.png';
import dashboardImg from '../../assets/screenshots/Screenshot_3.png';
import Vaccine from '../../assets/screenshots/Screenshot_4.png';
import hastalarImg from '../../assets/screenshots/Screenshot_5.png';
import hastalarImg2 from '../../assets/screenshots/Screenshot_6.png';

const Landing = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const screenshots = [dashboardImg, hastalarImg, hastalarImg2, StockInvoice, randevuImg, Vaccine];
    const [modalOpen, setModalOpen] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [formModalOpen, setFormModalOpen] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });

    const toggleModal = () => setFormModalOpen(!formModalOpen);

    const openModal = (index) => {
        setCurrentIndex(index);
        setModalOpen(true);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const payload = {
            ...formData,
            plan: selectedPlan,
        };

        try {
            const res = await fetch('https://vatcare-backend-production.up.railway.app/api/sendDemoRequest', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await res.json();
            if (data.success) {
                alert("Talebiniz başarıyla gönderildi.");
                setFormData({ name: '', email: '', phone: '', message: '' });
                setFormModalOpen(false);
            } else {
                alert("Bir hata oluştu.");
            }
        } catch (err) {
            alert("Sunucuya bağlanılamadı.");
        }
    };

    const goPrev = () => {
        setCurrentIndex((prev) => (prev === 0 ? screenshots.length - 1 : prev - 1));
    };

    const goNext = () => {
        setCurrentIndex((prev) => (prev === screenshots.length - 1 ? 0 : prev + 1));
    };

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
                                style={{ minWidth: 130, fontWeight: 600 }}
                                onClick={() => {
                                    setSelectedPlan("Demo Talebi");
                                    setFormModalOpen(true);
                                }}
                            >
                                Demo İste
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
                                price: "₺399 / ay",
                                features: [
                                    "Temel Hasta Takibi",
                                    "Stok Görüntüleme",
                                    "Aşı Takvimi",
                                    "1 Şube",
                                    "Randevu Takvimi",
                                ],
                                noFeatures: [
                                    "Hatırlatma Maili",
                                    "SMS Gönderimi"
                                ],
                                textColor: "success",
                                btnColor: "success",
                                btnOutline: false,
                                btnText: "Planı Seç",
                            },
                            {
                                title: "Standart",
                                price: "599 / ay",
                                features: [
                                    "Hasta + Stok Yönetimi",
                                    "Randevu Takvimi",
                                    "Aşı Takvimi",
                                    "Hatırlatma Maili",
                                    "Erişim Yetkileri",
                                    "2 Şube"
                                ],
                                noFeatures: [
                                    "SMS Gönderimi"
                                ],
                                textColor: "primary",
                                btnColor: "primary",
                                btnOutline: true,
                                btnText: "Planı Seç",
                            },
                            {
                                title: "Profesyonel",
                                price: "₺799 / ay",
                                features: [
                                    "Gelişmiş Raporlama",
                                    "Tüm Modüller",
                                    "Aşı Takvimi",
                                    "Hatırlatma Maili + SMS",
                                    "Öncelikli Destek",
                                    "Sınırsız Şube",
                                    "İsteğe Bağlı Raporlama Ekranı"
                                ],
                                noFeatures: [],
                                textColor: "info",
                                btnColor: "info",
                                btnOutline: true,
                                btnText: "Planı Seç",
                            }
                        ].map(({ title, price, features, noFeatures, textColor, btnColor, btnOutline, btnText }) => (
                            <Col key={title} md="4" className="mb-4">
                                <Card className="shadow-sm h-100 border-0 rounded">
                                    <CardBody className="d-flex flex-column justify-content-between bg-light rounded text-center">
                                        <div>
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
                                        </div>
                                        <Button
                                            color={btnColor}
                                            outline={btnOutline}
                                            size="lg"
                                            style={{ minWidth: 140, fontWeight: 600 }}
                                            onClick={() => {
                                                setSelectedPlan(title);
                                                setFormModalOpen(true);
                                            }}
                                        >
                                            {btnText}
                                        </Button>
                                    </CardBody>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </section>

                <div className="text-center mt-5">
                    <h4 style={{ color: '#59018b', marginBottom: '25px' }}>Uygulamadan Görseller</h4>
                    <Row className="g-4 justify-content-center">
                        {screenshots.map((imgSrc, idx) => (
                            <Col key={idx} xs="6" md="4" lg="3">
                                <img
                                    src={imgSrc}
                                    alt={`Screenshot ${idx + 1}`}
                                    onClick={() => openModal(idx)}
                                    style={{
                                        width: '100%',
                                        height: 'auto',
                                        borderRadius: 10,
                                        cursor: 'pointer',
                                        boxShadow: '0 2px 10px rgba(0,0,0,0.15)',
                                        transition: 'transform 0.3s',
                                    }}
                                    onMouseOver={e => (e.currentTarget.style.transform = 'scale(1.03)')}
                                    onMouseOut={e => (e.currentTarget.style.transform = 'scale(1.0)')}
                                />
                            </Col>
                        ))}
                    </Row>
                </div>

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

            <Modal isOpen={modalOpen} toggle={() => setModalOpen(false)} centered size="xl">
                <ModalBody className="position-relative text-center p-0" style={{ background: "#000" }}>
                    <img
                        src={screenshots[currentIndex]}
                        alt="Büyük Görsel"
                        style={{ width: '100%', height: 'auto', borderRadius: '5px' }}
                    />

                    <Button
                        onClick={goPrev}
                        style={{
                            position: 'absolute',
                            top: '50%',
                            left: '20px',
                            transform: 'translateY(-50%)',
                            width: '50px',
                            height: '50px',
                            borderRadius: '50%',
                            backgroundColor: 'rgba(255,255,255,0.9)',
                            color: '#59018b',
                            fontSize: '2rem',
                            fontWeight: 'bold',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 4px 10px rgba(0, 0, 0, 0.3)',
                            border: 'none',
                            zIndex: 999,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease-in-out',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#fff')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.9)')}
                    >
                        ‹
                    </Button>

                    {/* Sağ Ok */}
                    <Button
                        onClick={goNext}
                        style={{
                            position: 'absolute',
                            top: '50%',
                            right: '20px',
                            transform: 'translateY(-50%)',
                            width: '50px',
                            height: '50px',
                            borderRadius: '50%',
                            backgroundColor: 'rgba(255,255,255,0.9)',
                            color: '#59018b',
                            fontSize: '2rem',
                            fontWeight: 'bold',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 4px 10px rgba(0, 0, 0, 0.3)',
                            border: 'none',
                            zIndex: 999,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease-in-out',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#fff')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.9)')}
                    >
                        ›
                    </Button>
                </ModalBody>

            </Modal>

            <Modal isOpen={formModalOpen} toggle={toggleModal}>
                <ModalHeader toggle={toggleModal}>
                    {selectedPlan}
                </ModalHeader>
                <ModalBody>
                    <Form onSubmit={handleSubmit}>
                        <FormGroup>
                            <Label for="name">Ad Soyad</Label>
                            <Input name="name" value={formData.name} onChange={handleChange} required />
                        </FormGroup>
                        <FormGroup>
                            <Label for="email">E-Posta</Label>
                            <Input type="email" name="email" value={formData.email} onChange={handleChange} required />
                        </FormGroup>
                        <FormGroup>
                            <Label for="phone">Telefon</Label>
                            <Input name="phone" value={formData.phone} onChange={handleChange} required />
                        </FormGroup>
                        <FormGroup>
                            <Label for="message">Ek Mesaj</Label>
                            <Input type="textarea" name="message" value={formData.message} onChange={handleChange} />
                        </FormGroup>
                        <Button type="submit" color="primary">Gönder</Button>
                    </Form>
                </ModalBody>
            </Modal>
        </div>
    );
};

export default Landing;
