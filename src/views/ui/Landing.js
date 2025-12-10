import React, { useEffect, useState, useRef } from 'react';
import { Container, Row, Col, Button, Modal, ModalBody, ModalHeader, Form, FormGroup, Label, Input } from 'reactstrap';
import { useNavigate } from 'react-router-dom';
import heroImage from '../../assets/images/bg/bgmain3.png';
import "../scss/_login.scss";
import { useLocation } from "react-router-dom";
import { BASE_URL } from "../../config.js";

const Landing = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const [modalOpen, setModalOpen] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [formModalOpen, setFormModalOpen] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [animatedNumbers, setAnimatedNumbers] = useState({ clinics: 0, patients: 0, satisfaction: 0, support: 0 });
    const [hasAnimated, setHasAnimated] = useState(false);
    const [scrollY, setScrollY] = useState(0);
    
    const sectionRefs = useRef({});

    const importAll = (r) => r.keys().map(r);
    const screenshots = importAll(require.context('../../assets/screenshots', false, /Screenshot_\d+\.png$/));

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
        const payload = { ...formData, plan: selectedPlan };
        try {
            const res = await fetch(`${BASE_URL}/sendDemoRequest`, {
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

    const goPrev = () => setCurrentIndex((prev) => (prev === 0 ? screenshots.length - 1 : prev - 1));
    const goNext = () => setCurrentIndex((prev) => (prev === screenshots.length - 1 ? 0 : prev + 1));

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        
        const handleScroll = () => setScrollY(window.scrollY);
        window.addEventListener('scroll', handleScroll);
        
        const observers = [];
        Object.keys(sectionRefs.current).forEach(key => {
            const observer = new IntersectionObserver(
                (entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting && key === 'stats' && !hasAnimated) {
                            animateNumbers();
                            setHasAnimated(true);
                        }
                    });
                },
                { threshold: 0.1 }
            );
            if (sectionRefs.current[key]) {
                observer.observe(sectionRefs.current[key]);
                observers.push(observer);
            }
        });

        const animateNumbers = () => {
            const duration = 2000;
            const steps = 60;
            const stepDuration = duration / steps;
            const targets = { clinics: 500, patients: 50000, satisfaction: 98, support: 24 };
            const increments = {
                clinics: targets.clinics / steps,
                patients: targets.patients / steps,
                satisfaction: targets.satisfaction / steps,
                support: targets.support / steps
            };
            
            let currentStep = 0;
            const interval = setInterval(() => {
                currentStep++;
                setAnimatedNumbers({
                    clinics: Math.min(Math.floor(increments.clinics * currentStep), targets.clinics),
                    patients: Math.min(Math.floor(increments.patients * currentStep), targets.patients),
                    satisfaction: Math.min(Math.floor(increments.satisfaction * currentStep * 10) / 10, targets.satisfaction),
                    support: Math.min(Math.floor(increments.support * currentStep * 10) / 10, targets.support)
                });
                
                if (currentStep >= steps) {
                    clearInterval(interval);
                    setAnimatedNumbers(targets);
                }
            }, stepDuration);
        };

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('scroll', handleScroll);
            observers.forEach(obs => obs.disconnect());
        };
    }, [hasAnimated]);

    useEffect(() => {
        if (location.state && location.state.scrollTo) {
            const id = location.state.scrollTo;
            setTimeout(() => {
                const element = document.getElementById(id);
                if (element) {
                    const yOffset = -60;
                    const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
                    window.scrollTo({ top: y, behavior: "smooth" });
                }
                navigate(location.pathname, { replace: true, state: {} });
            }, 100);
        }
    }, [location.state, location.pathname, navigate]);

    const features = [
        { icon: "🏥", title: "Hasta Yönetimi", desc: "Kolay kayıt, detaylı dosya takibi, hızlı erişim" },
        { icon: "📦", title: "Stok Takibi", desc: "İlaç, malzeme ve temizlik ürünlerinizi yönetin" },
        { icon: "📅", title: "Randevu Takvimi", desc: "Takvim tabanlı randevu yönetimi ile vakit kazanın" }
    ];

    const stats = [
        { number: animatedNumbers.clinics, suffix: '+', label: 'Aktif Klinik', color: '#59018b' },
        { number: animatedNumbers.patients, suffix: '+', label: 'Kayıtlı Hasta', color: '#7a1fa8' },
        { number: animatedNumbers.satisfaction, suffix: '%', label: 'Memnuniyet', color: '#59018b' },
        { number: '24', suffix: '/7', label: 'Destek', color: '#7a1fa8' }
    ];

    const plans = [
        {
            title: "Başlangıç", price: "₺399", period: "/ay",
            features: ["Temel Hasta Takibi", "Stok Görüntüleme", "Aşı Takvimi", "1 Şube", "Randevu Takvimi"],
            gradient: "#28a745"
        },
        {
            title: "Standart", price: "₺599", period: "/ay", popular: true,
            features: ["Hasta + Stok Yönetimi", "Randevu Takvimi", "Aşı Takvimi", "Hatırlatma Maili", "Erişim Yetkileri", "2 Şube"],
            gradient: "#59018b"
        },
        {
            title: "Profesyonel", price: "₺799", period: "/ay",
            features: ["Gelişmiş Raporlama", "Tüm Modüller", "Aşı Takvimi", "Hatırlatma Maili + SMS", "Öncelikli Destek", "Sınırsız Şube"],
            gradient: "#17a2b8"
        }
    ];

    const testimonials = [
        {
            name: 'Dr. Ayşe Yılmaz', clinic: 'Paws & Claws Veteriner Kliniği', city: 'İstanbul',
            rating: 5, comment: 'VetCare sayesinde işlerimiz çok daha düzenli hale geldi. Hasta kayıtları, randevu takibi ve stok yönetimi artık çok kolay.',
            avatar: '👩‍⚕️'
        },
        {
            name: 'Dr. Mehmet Demir', clinic: 'Hayvan Dostu Veteriner', city: 'Ankara',
            rating: 5, comment: 'Özellikle stok takibi özelliği hayat kurtarıcı. Artık hangi ilacın bittiğini önceden biliyoruz.',
            avatar: '👨‍⚕️'
        },
        {
            name: 'Dr. Zeynep Kaya', clinic: 'Sevimli Patiler Kliniği', city: 'İzmir',
            rating: 5, comment: 'Kullanıcı arayüzü çok kullanıcı dostu. Personelimiz çok hızlı adapte oldu.',
            avatar: '👩‍⚕️'
        }
    ];

    // Modern spacing constants
    const sectionPadding = isMobile ? '64px 0' : '80px 0';
    const containerPadding = isMobile ? '0 20px' : '0 40px';

    return (
        <div style={{ 
            background: '#ffffff', 
            color: '#212529', 
            minHeight: '100vh', 
            overflowX: 'hidden',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
        }}>
            {/* Hero Section - Enhanced with Parallax */}
            <section 
                id="hero"
                style={{
                    minHeight: isMobile ? 'auto' : '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    position: 'relative',
                    overflow: 'hidden',
                    background: 'linear-gradient(135deg, #f8f9ff 0%, #ffffff 30%, #f0f4ff 60%, #ffffff 100%)',
                    padding: sectionPadding,
                    paddingTop: isMobile ? '100px' : '120px'
                }}
            >
                {/* Animated Background Elements with Parallax */}
                <div style={{
                    position: 'absolute',
                    top: `${-20 + scrollY * 0.1}%`,
                    right: `${-10 + scrollY * 0.05}%`,
                    width: '800px',
                    height: '800px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, rgba(89, 1, 139, 0.15) 0%, rgba(122, 31, 168, 0.08) 100%)',
                    filter: 'blur(100px)',
                    zIndex: 0,
                    transition: 'transform 0.1s ease-out'
                }} />
                <div style={{
                    position: 'absolute',
                    bottom: `${-15 - scrollY * 0.08}%`,
                    left: `${-5 - scrollY * 0.03}%`,
                    width: '700px',
                    height: '700px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, rgba(89, 1, 139, 0.12) 0%, rgba(122, 31, 168, 0.06) 100%)',
                    filter: 'blur(80px)',
                    zIndex: 0,
                    transition: 'transform 0.1s ease-out'
                }} />
                <div style={{
                    position: 'absolute',
                    top: '20%',
                    left: '50%',
                    width: '400px',
                    height: '400px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, rgba(157, 78, 221, 0.1) 0%, rgba(89, 1, 139, 0.05) 100%)',
                    filter: 'blur(70px)',
                    zIndex: 0,
                    transform: `translate(${scrollY * 0.05}px, ${scrollY * 0.1}px)`,
                    transition: 'transform 0.1s ease-out'
                }} />
                
                {/* Floating Particles */}
                {[...Array(6)].map((_, i) => (
                    <div
                        key={i}
                        style={{
                            position: 'absolute',
                            width: `${20 + i * 10}px`,
                            height: `${20 + i * 10}px`,
                            borderRadius: '50%',
                            background: `rgba(89, 1, 139, ${0.1 - i * 0.01})`,
                            top: `${20 + i * 15}%`,
                            left: `${10 + i * 12}%`,
                            filter: 'blur(2px)',
                            zIndex: 0,
                            animation: `float ${3 + i * 0.5}s ease-in-out infinite`,
                            animationDelay: `${i * 0.3}s`
                        }}
                    />
                ))}
                
                <Container fluid style={{ 
                    position: 'relative',
                    zIndex: 1,
                    padding: containerPadding,
                    width: '100%',
                    maxWidth: '100%'
                }}>
                    <Row className="align-items-center">
                        <Col xs="12" lg="6" style={{ marginBottom: isMobile ? '48px' : '0' }}>
                            <div style={{
                                fontSize: '0.875rem',
                                fontWeight: 700,
                                color: '#59018b',
                                marginBottom: '20px',
                                letterSpacing: '2px',
                                textTransform: 'uppercase',
                                opacity: 0.9,
                                animation: 'fadeInDown 0.8s ease-out'
                            }}>
                                ✨ Veteriner Klinikleri İçin
                            </div>
                            <h1 style={{
                                fontSize: isMobile ? 'clamp(2.5rem, 8vw, 3rem)' : 'clamp(3.5rem, 7vw, 5.5rem)',
                                fontWeight: 900,
                                lineHeight: 1.1,
                                marginBottom: '28px',
                                background: 'linear-gradient(135deg, #59018b 0%, #7a1fa8 40%, #9d4edd 70%, #c77dff 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                                letterSpacing: '-0.03em',
                                animation: 'fadeInUp 0.8s ease-out 0.2s both'
                            }}>
                            Veteriner Otomasyon Sistemi
                        </h1>
                            <p style={{
                                fontSize: isMobile ? '1.125rem' : '1.375rem',
                                lineHeight: 1.7,
                                color: '#4b5563',
                                marginBottom: '40px',
                                maxWidth: '600px',
                                fontWeight: 400,
                                animation: 'fadeInUp 0.8s ease-out 0.4s both'
                            }}>
                            Kliniklerinizi kolayca yönetin. Hasta kayıtları, stok takibi, randevu yönetimi ve daha fazlası tek bir platformda!
                        </p>
                            
                            {/* Stats Row */}
                            <div style={{
                                display: 'flex',
                                gap: isMobile ? '16px' : '32px',
                                marginBottom: '40px',
                                flexWrap: 'wrap',
                                animation: 'fadeInUp 0.8s ease-out 0.6s both'
                            }}>
                                <div>
                                    <div style={{ fontSize: isMobile ? '1.75rem' : '2.25rem', fontWeight: 800, color: '#59018b', lineHeight: 1 }}>500+</div>
                                    <div style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '4px' }}>Aktif Klinik</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: isMobile ? '1.75rem' : '2.25rem', fontWeight: 800, color: '#7a1fa8', lineHeight: 1 }}>50K+</div>
                                    <div style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '4px' }}>Kayıtlı Hasta</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: isMobile ? '1.75rem' : '2.25rem', fontWeight: 800, color: '#9d4edd', lineHeight: 1 }}>98%</div>
                                    <div style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '4px' }}>Memnuniyet</div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                            <Button
                                    onClick={() => { setSelectedPlan("Demo Talebi"); setFormModalOpen(true); }}
                                    style={{
                                        padding: isMobile ? '14px 28px' : '16px 32px',
                                        fontSize: '1rem',
                                        fontWeight: 600,
                                        borderRadius: '8px',
                                        background: '#59018b',
                                        color: '#ffffff',
                                        border: 'none',
                                        boxShadow: '0 4px 14px rgba(89, 1, 139, 0.25)',
                                        transition: 'all 0.2s ease'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = '#7a1fa8';
                                        e.currentTarget.style.transform = 'translateY(-1px)';
                                        e.currentTarget.style.boxShadow = '0 6px 20px rgba(89, 1, 139, 0.35)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = '#59018b';
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = '0 4px 14px rgba(89, 1, 139, 0.25)';
                                    }}
                                >
                                    Ücretsiz Demo İste
                                </Button>
                            <Button
                                    outline
                                onClick={() => {
                                        const element = document.getElementById('features');
                                        if (element) {
                                            window.scrollTo({ top: element.offsetTop - 80, behavior: 'smooth' });
                                        }
                                    }}
                                    style={{
                                        padding: isMobile ? '14px 28px' : '16px 32px',
                                        fontSize: '1rem',
                                        fontWeight: 600,
                                        borderRadius: '8px',
                                        border: '1.5px solid #59018b',
                                        color: '#59018b',
                                        background: 'transparent',
                                        transition: 'all 0.2s ease'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = '#59018b';
                                        e.currentTarget.style.color = '#ffffff';
                                        e.currentTarget.style.transform = 'translateY(-1px)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = 'transparent';
                                        e.currentTarget.style.color = '#59018b';
                                        e.currentTarget.style.transform = 'translateY(0)';
                                    }}
                                >
                                    Daha Fazla Bilgi
                            </Button>
                        </div>
                    </Col>
                        <Col xs="12" lg="6">
                            <div style={{
                                position: 'relative',
                                borderRadius: '32px',
                                overflow: 'hidden',
                                boxShadow: '0 40px 100px rgba(89, 1, 139, 0.3)',
                                transform: `perspective(1000px) rotateY(-5deg) translateY(${scrollY * 0.2}px)`,
                                transition: 'transform 0.1s ease-out',
                                animation: 'fadeInRight 1s ease-out 0.8s both'
                            }}
                            onMouseEnter={(e) => {
                                if (!isMobile) {
                                    e.currentTarget.style.transform = 'perspective(1000px) rotateY(0deg) scale(1.05)';
                                    e.currentTarget.style.boxShadow = '0 50px 120px rgba(89, 1, 139, 0.4)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!isMobile) {
                                    e.currentTarget.style.transform = `perspective(1000px) rotateY(-5deg) translateY(${scrollY * 0.2}px)`;
                                    e.currentTarget.style.boxShadow = '0 40px 100px rgba(89, 1, 139, 0.3)';
                                }
                            }}
                            >
                                {/* Gradient Overlay */}
                                <div style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    background: 'linear-gradient(135deg, rgba(89, 1, 139, 0.15) 0%, rgba(122, 31, 168, 0.08) 50%, rgba(157, 78, 221, 0.05) 100%)',
                                    zIndex: 1,
                                    pointerEvents: 'none'
                                }} />
                                {/* Shine Effect */}
                                <div style={{
                                    position: 'absolute',
                                    top: '-50%',
                                    left: '-50%',
                                    width: '200%',
                                    height: '200%',
                                    background: 'linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.1) 50%, transparent 70%)',
                                    transform: 'rotate(45deg)',
                                    animation: 'shine 3s infinite',
                                    zIndex: 2,
                                    pointerEvents: 'none'
                                }} />
                        <img
                            src={heroImage}
                            alt="Veteriner Otomasyon"
                                    style={{
                                        width: '100%',
                                        height: 'auto',
                                        display: 'block',
                                        position: 'relative',
                                        zIndex: 0,
                                        transform: `translateY(${isMobile ? scrollY * 0.03 : scrollY * 0.12}px)`,
                                        transition: 'transform 0.1s ease-out'
                                    }}
                                />
                            </div>
                    </Col>
                </Row>
                </Container>
            </section>

            {/* Features Section - Modern Grid with Gradient */}
            <section id="features" ref={el => { sectionRefs.current['features'] = el; if (el) el.id = 'features'; }} style={{
                padding: sectionPadding,
                background: 'linear-gradient(180deg, #ffffff 0%, #f8f9ff 100%)',
                position: 'relative'
            }}>
                <Container fluid style={{ 
                    padding: containerPadding,
                    width: '100%',
                    maxWidth: '100%'
                }}>
                    <div style={{ textAlign: 'center', marginBottom: isMobile ? '48px' : '64px' }}>
                        <h2 style={{
                            fontSize: isMobile ? 'clamp(1.75rem, 6vw, 2rem)' : 'clamp(2.25rem, 4vw, 3rem)',
                            fontWeight: 800,
                            marginBottom: '16px',
                            background: 'linear-gradient(135deg, #59018b 0%, #7a1fa8 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                            letterSpacing: '-0.02em'
                        }}>
                            Neden VetCare?
                        </h2>
                        <p style={{
                            fontSize: '1.125rem',
                            color: '#6b7280',
                            maxWidth: '600px',
                            margin: '0 auto'
                        }}>
                            Veteriner klinikleriniz için özel olarak tasarlanmış özellikler
                        </p>
                    </div>

                    <Row className="g-4">
                        {features.map((feature, idx) => (
                            <Col key={idx} xs="12" md="4">
                                <div style={{
                                    padding: isMobile ? '32px 24px' : '40px 32px',
                                    borderRadius: '20px',
                                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 249, 255, 0.9) 100%)',
                                    border: '2px solid rgba(89, 1, 139, 0.1)',
                                    height: '100%',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    cursor: 'pointer',
                                    backdropFilter: 'blur(10px)',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}
                                onMouseEnter={(e) => {
                                    if (!isMobile) {
                                        e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
                                        e.currentTarget.style.borderColor = '#59018b';
                                        e.currentTarget.style.boxShadow = '0 20px 40px rgba(89, 1, 139, 0.2)';
                                        e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255, 255, 255, 1) 0%, rgba(248, 249, 255, 1) 100%)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!isMobile) {
                                        e.currentTarget.style.transform = 'translateY(0) scale(1)';
                                        e.currentTarget.style.borderColor = 'rgba(89, 1, 139, 0.1)';
                                        e.currentTarget.style.boxShadow = 'none';
                                        e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 249, 255, 0.9) 100%)';
                                    }
                                }}
                                >
                                    <div style={{
                                        position: 'absolute',
                                        top: 0,
                                        right: 0,
                                        width: '100px',
                                        height: '100px',
                                        background: 'linear-gradient(135deg, rgba(89, 1, 139, 0.05) 0%, rgba(122, 31, 168, 0.02) 100%)',
                                        borderRadius: '50%',
                                        transform: 'translate(30%, -30%)',
                                        filter: 'blur(40px)',
                                        zIndex: 0
                                    }} />
                                    <div style={{ position: 'relative', zIndex: 1 }}>
                                    <div style={{
                                        fontSize: '2.5rem',
                                        marginBottom: '20px',
                                        display: 'inline-block'
                                    }}>
                                        {feature.icon}
                                    </div>
                                    <h3 style={{
                                        fontSize: '1.25rem',
                                        fontWeight: 600,
                                        marginBottom: '12px',
                                        color: '#1a1a1a'
                                    }}>
                                        {feature.title}
                                    </h3>
                                    <p style={{
                                        fontSize: '0.9375rem',
                                        lineHeight: 1.6,
                                        color: '#6b7280',
                                        margin: 0
                                    }}>
                                        {feature.desc}
                                    </p>
                                    </div>
                            </div>
                        </Col>
                    ))}
                </Row>
                </Container>
            </section>

            {/* Stats Section - Modern with Pattern */}
            <section ref={el => sectionRefs.current['stats'] = el} style={{
                padding: sectionPadding,
                background: 'linear-gradient(135deg, #59018b 0%, #7a1fa8 50%, #9d4edd 100%)',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Animated Background Pattern */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 50%)',
                    opacity: 0.5,
                    zIndex: 0
                }} />
                
                <Container fluid style={{ 
                    maxWidth: '1400px',
                    margin: '0 auto',
                    padding: containerPadding,
                    width: '100%',
                    position: 'relative',
                    zIndex: 1
                }}>
                    <div style={{ textAlign: 'center', marginBottom: isMobile ? '48px' : '64px' }}>
                        <h2 style={{
                            fontSize: isMobile ? 'clamp(1.75rem, 6vw, 2rem)' : 'clamp(2.25rem, 4vw, 3rem)',
                            fontWeight: 700,
                            marginBottom: '16px',
                            color: '#ffffff',
                            letterSpacing: '-0.02em'
                        }}>
                            Rakamlarla VetCare
                        </h2>
                        <p style={{
                            fontSize: '1.125rem',
                            color: 'rgba(255, 255, 255, 0.9)',
                            maxWidth: '600px',
                            margin: '0 auto'
                        }}>
                            Binlerce mutlu müşteri ve başarı hikayesi
                        </p>
                    </div>

                    <Row className="g-4">
                        {stats.map((stat, idx) => (
                            <Col key={idx} xs="6" md="3">
                                <div style={{
                                    padding: isMobile ? '32px 20px' : '40px 32px',
                                    borderRadius: '20px',
                                    background: 'rgba(255, 255, 255, 0.98)',
                                    backdropFilter: 'blur(20px)',
                                    textAlign: 'center',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    border: '1px solid rgba(255, 255, 255, 0.3)',
                                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
                                }}
                                onMouseEnter={(e) => {
                                    if (!isMobile) {
                                        e.currentTarget.style.transform = 'translateY(-8px) scale(1.05)';
                                        e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.2)';
                                        e.currentTarget.style.background = 'rgba(255, 255, 255, 1)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!isMobile) {
                                        e.currentTarget.style.transform = 'translateY(0) scale(1)';
                                        e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.1)';
                                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.98)';
                                    }
                                }}
                                >
                                    <div style={{
                                        fontSize: isMobile ? '2rem' : '2.5rem',
                                        fontWeight: 700,
                                        marginBottom: '8px',
                                        color: stat.color,
                                        lineHeight: 1
                                    }}>
                                        {stat.label === 'Destek' 
                                            ? `24${stat.suffix}` 
                                            : typeof stat.number === 'number' 
                                                ? `${Math.floor(stat.number)}${stat.suffix}` 
                                                : `${stat.number}${stat.suffix}`}
                                    </div>
                                    <div style={{
                                        fontSize: '0.9375rem',
                                        color: '#6b7280',
                                        fontWeight: 500
                                    }}>
                                        {stat.label}
                                    </div>
                                </div>
                            </Col>
                        ))}
                    </Row>
                </Container>
            </section>

            {/* Pricing Section - Modern Cards with Gradient */}
            <section id="pricing" ref={el => { sectionRefs.current['pricing'] = el; if (el) el.id = 'pricing'; }} style={{
                padding: sectionPadding,
                background: 'linear-gradient(180deg, #ffffff 0%, #f8f9ff 100%)',
                position: 'relative'
            }}>
                <Container fluid style={{ 
                    padding: containerPadding,
                    width: '100%',
                    maxWidth: '100%'
                }}>
                    <div style={{ textAlign: 'center', marginBottom: isMobile ? '48px' : '64px' }}>
                        <h2 style={{
                            fontSize: isMobile ? 'clamp(1.75rem, 6vw, 2rem)' : 'clamp(2.25rem, 4vw, 3rem)',
                            fontWeight: 800,
                            marginBottom: '16px',
                            background: 'linear-gradient(135deg, #59018b 0%, #7a1fa8 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                            letterSpacing: '-0.02em'
                        }}>
                            Fiyatlandırma Planları
                        </h2>
                        <p style={{
                            fontSize: '1.125rem',
                            color: '#6b7280',
                            maxWidth: '600px',
                            margin: '0 auto'
                        }}>
                            İhtiyacınıza en uygun planı seçin
                        </p>
                    </div>

                    <Row className="g-4 justify-content-center">
                        {plans.map((plan, idx) => (
                            <Col key={idx} xs="12" md="6" lg="4">
                                <div style={{
                                    padding: isMobile ? '32px 24px' : '40px 32px',
                                    borderRadius: '24px',
                                    background: plan.popular 
                                        ? `linear-gradient(135deg, ${plan.gradient} 0%, ${plan.gradient === '#59018b' ? '#7a1fa8' : plan.gradient} 100%)`
                                        : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 249, 255, 0.95) 100%)',
                                    border: plan.popular ? 'none' : '2px solid rgba(89, 1, 139, 0.15)',
                                    height: '100%',
                                    position: 'relative',
                                    transform: plan.popular ? 'scale(1.05)' : 'scale(1)',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    boxShadow: plan.popular 
                                        ? '0 20px 60px rgba(89, 1, 139, 0.3)' 
                                        : '0 8px 24px rgba(0, 0, 0, 0.1)',
                                    backdropFilter: plan.popular ? 'none' : 'blur(10px)',
                                    overflow: 'hidden'
                                }}
                                onMouseEnter={(e) => {
                                    if (!isMobile) {
                                        e.currentTarget.style.transform = plan.popular ? 'scale(1.08) translateY(-4px)' : 'scale(1.03) translateY(-4px)';
                                        e.currentTarget.style.boxShadow = plan.popular 
                                            ? '0 30px 80px rgba(89, 1, 139, 0.4)' 
                                            : '0 16px 40px rgba(89, 1, 139, 0.2)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!isMobile) {
                                        e.currentTarget.style.transform = plan.popular ? 'scale(1.05)' : 'scale(1)';
                                        e.currentTarget.style.boxShadow = plan.popular 
                                            ? '0 20px 60px rgba(89, 1, 139, 0.3)' 
                                            : '0 8px 24px rgba(0, 0, 0, 0.1)';
                                    }
                                }}
                                >
                                    {!plan.popular && (
                                        <div style={{
                                            position: 'absolute',
                                            top: '-50%',
                                            right: '-50%',
                                            width: '200px',
                                            height: '200px',
                                            background: 'linear-gradient(135deg, rgba(89, 1, 139, 0.05) 0%, rgba(122, 31, 168, 0.02) 100%)',
                                            borderRadius: '50%',
                                            filter: 'blur(40px)',
                                            zIndex: 0
                                        }} />
                                    )}
                                    {plan.popular && (
                                        <div style={{
                                            position: 'absolute',
                                            top: '16px',
                                            right: '16px',
                                            padding: '6px 16px',
                                            borderRadius: '20px',
                                            background: 'rgba(255, 255, 255, 0.3)',
                                            backdropFilter: 'blur(10px)',
                                            fontSize: '0.75rem',
                                            fontWeight: 700,
                                            color: '#ffffff',
                                            border: '1px solid rgba(255, 255, 255, 0.4)',
                                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                                        }}>
                                            ⭐ Popüler
                                        </div>
                                    )}
                                    <div style={{ position: 'relative', zIndex: 1 }}>
                                    <h3 style={{
                                        fontSize: '1.5rem',
                                        fontWeight: 600,
                                        marginBottom: '8px',
                                        color: plan.popular ? '#ffffff' : '#1a1a1a'
                                    }}>
                                        {plan.title}
                                    </h3>
                                    <div style={{ marginBottom: '24px' }}>
                                        <span style={{
                                            fontSize: isMobile ? '2.5rem' : '3rem',
                                            fontWeight: 700,
                                            color: plan.popular ? '#ffffff' : '#1a1a1a',
                                            lineHeight: 1
                                        }}>
                                            {plan.price}
                                        </span>
                                        <span style={{
                                            fontSize: '1rem',
                                            color: plan.popular ? 'rgba(255, 255, 255, 0.8)' : '#6b7280',
                                            marginLeft: '4px'
                                        }}>
                                            {plan.period}
                                        </span>
                                    </div>
                                    <ul style={{
                                        listStyle: 'none',
                                        padding: 0,
                                        margin: '0 0 32px 0'
                                    }}>
                                        {plan.features.map((feature, fIdx) => (
                                            <li key={fIdx} style={{
                                                padding: '10px 0',
                                                borderBottom: plan.popular ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid #e5e7eb',
                                                color: plan.popular ? 'rgba(255, 255, 255, 0.95)' : '#374151',
                                                fontSize: '0.9375rem',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px'
                                            }}>
                                                <span style={{ color: plan.popular ? '#ffffff' : '#59018b' }}>✓</span>
                                                {feature}
                                            </li>
                                                ))}
                                            </ul>
                                        <Button
                                        onClick={() => { setSelectedPlan(plan.title); setFormModalOpen(true); }}
                                        style={{
                                            width: '100%',
                                            padding: '14px',
                                            fontSize: '1rem',
                                            fontWeight: 600,
                                            borderRadius: '8px',
                                            background: plan.popular ? '#ffffff' : plan.gradient,
                                            color: plan.popular ? plan.gradient : '#ffffff',
                                            border: 'none',
                                            transition: 'all 0.2s ease'
                                        }}
                                        onMouseEnter={(e) => {
                                            if (!isMobile) {
                                                e.currentTarget.style.transform = 'translateY(-1px)';
                                                e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.15)';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (!isMobile) {
                                                e.currentTarget.style.transform = 'translateY(0)';
                                                e.currentTarget.style.boxShadow = 'none';
                                            }
                                        }}
                                    >
                                        Planı Seç
                                        </Button>
                                    </div>
                                </div>
                            </Col>
                        ))}
                    </Row>
                </Container>
                </section>

            {/* Testimonials Section */}
            <section id="testimonials" ref={el => { sectionRefs.current['testimonials'] = el; if (el) el.id = 'testimonials'; }} style={{
                padding: sectionPadding,
                background: 'linear-gradient(180deg, #f8f9ff 0%, #ffffff 100%)'
            }}>
                <Container fluid style={{ 
                    padding: containerPadding,
                    width: '100%',
                    maxWidth: '100%'
                }}>
                    <div style={{ textAlign: 'center', marginBottom: isMobile ? '48px' : '64px' }}>
                        <h2 style={{
                            fontSize: isMobile ? 'clamp(1.75rem, 6vw, 2rem)' : 'clamp(2.25rem, 4vw, 3rem)',
                            fontWeight: 800,
                            marginBottom: '16px',
                            background: 'linear-gradient(135deg, #59018b 0%, #7a1fa8 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                            letterSpacing: '-0.02em'
                        }}>
                            Müşterilerimiz Ne Diyor?
                        </h2>
                        <p style={{
                            fontSize: '1.125rem',
                            color: '#6b7280',
                            maxWidth: '600px',
                            margin: '0 auto'
                        }}>
                            Binlerce mutlu müşterimizin deneyimlerini keşfedin
                        </p>
                    </div>

                    <Row className="g-4">
                        {testimonials.map((testimonial, idx) => (
                            <Col key={idx} xs="12" md="4">
                                <div style={{
                                    padding: isMobile ? '32px 24px' : '40px 32px',
                                    borderRadius: '20px',
                                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 249, 255, 0.95) 100%)',
                                    border: '2px solid rgba(89, 1, 139, 0.1)',
                                    height: '100%',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    backdropFilter: 'blur(10px)',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}
                                onMouseEnter={(e) => {
                                    if (!isMobile) {
                                        e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
                                        e.currentTarget.style.borderColor = '#59018b';
                                        e.currentTarget.style.boxShadow = '0 20px 40px rgba(89, 1, 139, 0.2)';
                                        e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255, 255, 255, 1) 0%, rgba(248, 249, 255, 1) 100%)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!isMobile) {
                                        e.currentTarget.style.transform = 'translateY(0) scale(1)';
                                        e.currentTarget.style.borderColor = 'rgba(89, 1, 139, 0.1)';
                                        e.currentTarget.style.boxShadow = 'none';
                                        e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 249, 255, 0.95) 100%)';
                                    }
                                }}
                                >
                                    <div style={{
                                        position: 'absolute',
                                        top: 0,
                                        right: 0,
                                        width: '120px',
                                        height: '120px',
                                        background: 'linear-gradient(135deg, rgba(89, 1, 139, 0.05) 0%, rgba(122, 31, 168, 0.02) 100%)',
                                        borderRadius: '50%',
                                        transform: 'translate(30%, -30%)',
                                        filter: 'blur(40px)',
                                        zIndex: 0
                                    }} />
                                    <div style={{ position: 'relative', zIndex: 1 }}>
                                    <div style={{ marginBottom: '16px' }}>
                                        {[...Array(testimonial.rating)].map((_, i) => (
                                            <span key={i} style={{ fontSize: '1.125rem', color: '#fbbf24', marginRight: '2px' }}>⭐</span>
                                        ))}
                                    </div>
                                    <p style={{
                                        fontSize: '0.9375rem',
                                        lineHeight: 1.7,
                                        color: '#374151',
                                        marginBottom: '24px',
                                        fontStyle: 'italic'
                                    }}>
                                        "{testimonial.comment}"
                                    </p>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{
                                            width: '48px',
                                            height: '48px',
                                            borderRadius: '50%',
                                            background: 'linear-gradient(135deg, #59018b 0%, #7a1fa8 100%)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '1.25rem',
                                            flexShrink: 0
                                        }}>
                                            {testimonial.avatar}
                                        </div>
                                        <div>
                                            <div style={{
                                                fontSize: '0.9375rem',
                                                fontWeight: 600,
                                                color: '#1a1a1a',
                                                marginBottom: '2px'
                                            }}>
                                                {testimonial.name}
                                            </div>
                                            <div style={{
                                                fontSize: '0.8125rem',
                                                color: '#6b7280'
                                            }}>
                                                {testimonial.clinic}
                                            </div>
                                        </div>
                                    </div>
                                    </div>
                                </div>
                            </Col>
                        ))}
                    </Row>
                </Container>
            </section>

            {/* Screenshots Section */}
            <section ref={el => sectionRefs.current['screenshots'] = el} style={{
                padding: sectionPadding,
                background: 'linear-gradient(180deg, #ffffff 0%, #f8f9ff 100%)'
            }}>
                <Container fluid style={{ 
                    padding: containerPadding,
                    width: '100%',
                    maxWidth: '100%'
                }}>
                    <div style={{ textAlign: 'center', marginBottom: isMobile ? '48px' : '64px' }}>
                        <h2 style={{
                            fontSize: isMobile ? 'clamp(1.75rem, 6vw, 2rem)' : 'clamp(2.25rem, 4vw, 3rem)',
                            fontWeight: 800,
                            marginBottom: '16px',
                            background: 'linear-gradient(135deg, #59018b 0%, #7a1fa8 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                            letterSpacing: '-0.02em'
                        }}>
                            Uygulamadan Görseller
                        </h2>
                        <p style={{
                            fontSize: '1.125rem',
                            color: '#6b7280',
                            maxWidth: '600px',
                            margin: '0 auto'
                        }}>
                            Sistemimizin kullanıcı dostu arayüzünü keşfedin
                        </p>
                    </div>

                    <div style={{
                        display: 'flex',
                        gap: '16px',
                        overflowX: 'auto',
                        paddingBottom: '20px',
                        scrollbarWidth: 'thin',
                        scrollbarColor: '#59018b rgba(0, 0, 0, 0.1)',
                        WebkitOverflowScrolling: 'touch'
                    }}>
                        {screenshots.map((imgSrc, idx) => (
                            <div
                                key={idx}
                                onClick={() => openModal(idx)}
                                style={{
                                    minWidth: isMobile ? '200px' : '240px',
                                    maxWidth: isMobile ? '200px' : '240px',
                                    borderRadius: '12px',
                                    overflow: 'hidden',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    border: '2px solid rgba(89, 1, 139, 0.1)',
                                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                                    flexShrink: 0
                                }}
                                onMouseEnter={(e) => {
                                    if (!isMobile) {
                                        e.currentTarget.style.transform = 'translateY(-4px) scale(1.05)';
                                        e.currentTarget.style.borderColor = '#59018b';
                                        e.currentTarget.style.boxShadow = '0 12px 24px rgba(89, 1, 139, 0.2)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!isMobile) {
                                        e.currentTarget.style.transform = 'translateY(0) scale(1)';
                                        e.currentTarget.style.borderColor = 'rgba(89, 1, 139, 0.1)';
                                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)';
                                    }
                                }}
                            >
                                <img
                                    src={imgSrc}
                                    alt={`Screenshot ${idx + 1}`}
                                    style={{
                                        width: '100%',
                                        height: 'auto',
                                        display: 'block',
                                        objectFit: 'cover'
                                    }}
                                />
                            </div>
                        ))}
                </div>
                </Container>
            </section>

            {/* YouTube Videos Section */}
            <section ref={el => sectionRefs.current['videos'] = el} id="videos" style={{
                padding: sectionPadding,
                background: 'linear-gradient(180deg, #ffffff 0%, #f8f9ff 100%)'
            }}>
                <Container fluid style={{ 
                    padding: containerPadding,
                    width: '100%',
                    maxWidth: '100%'
                }}>
                    <div style={{ textAlign: 'center', marginBottom: isMobile ? '48px' : '64px' }}>
                        <h2 style={{
                            fontSize: isMobile ? 'clamp(1.75rem, 6vw, 2rem)' : 'clamp(2.25rem, 4vw, 3rem)',
                            fontWeight: 800,
                            marginBottom: '16px',
                            background: 'linear-gradient(135deg, #59018b 0%, #7a1fa8 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                            letterSpacing: '-0.02em'
                        }}>
                            Video Tanıtım
                        </h2>
                        <p style={{
                            fontSize: '1.125rem',
                            color: '#6b7280',
                            maxWidth: '600px',
                            margin: '0 auto'
                        }}>
                            Sistemimizi daha yakından tanıyın
                        </p>
                    </div>

                    <Row className="g-4 justify-content-center">
                        <Col xs="12" md="10" lg="8">
                            <div style={{
                                position: 'relative',
                                paddingBottom: '56.25%',
                                height: 0,
                                overflow: 'hidden',
                                borderRadius: '20px',
                                boxShadow: '0 20px 60px rgba(89, 1, 139, 0.2)',
                                border: '2px solid rgba(89, 1, 139, 0.1)',
                                transition: 'all 0.3s ease'
                            }}
                            onMouseEnter={(e) => {
                                if (!isMobile) {
                                    e.currentTarget.style.transform = 'translateY(-4px)';
                                    e.currentTarget.style.boxShadow = '0 30px 80px rgba(89, 1, 139, 0.3)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!isMobile) {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 20px 60px rgba(89, 1, 139, 0.2)';
                                }
                            }}
                            >
                                <iframe
                                    width="100%"
                                    height="100%"
                                    src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                                    title="VetCare Sistem Tanıtımı"
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                            style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        width: '100%',
                                        height: '100%',
                                        borderRadius: '18px'
                                    }}
                                />
                            </div>
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* About & Contact Section - Redesigned */}
            <section ref={el => sectionRefs.current['about'] = el} id="about" style={{
                padding: sectionPadding,
                background: 'linear-gradient(180deg, #f8f9ff 0%, #ffffff 100%)',
                position: 'relative'
            }}>
                {/* Decorative Background */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: '400px',
                    height: '400px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, rgba(89, 1, 139, 0.05) 0%, rgba(122, 31, 168, 0.02) 100%)',
                    filter: 'blur(60px)',
                    zIndex: 0
                }} />
                
                <Container fluid style={{ 
                    padding: containerPadding,
                    width: '100%',
                    maxWidth: '100%',
                    position: 'relative',
                    zIndex: 1
                }}>
                    <Row className="g-5">
                        {/* About Section - Enhanced */}
                        <Col xs="12" lg="6">
                            <div style={{
                                padding: isMobile ? '32px 24px' : '48px 40px',
                                borderRadius: '24px',
                                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 249, 255, 0.95) 100%)',
                                border: '2px solid rgba(89, 1, 139, 0.1)',
                                backdropFilter: 'blur(10px)',
                                boxShadow: '0 12px 40px rgba(89, 1, 139, 0.1)',
                                height: '100%'
                            }}>
                                <h2 style={{
                                    fontSize: isMobile ? 'clamp(1.75rem, 6vw, 2rem)' : 'clamp(2.25rem, 4vw, 3rem)',
                                    fontWeight: 800,
                                    marginBottom: '24px',
                                    background: 'linear-gradient(135deg, #59018b 0%, #7a1fa8 100%)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    backgroundClip: 'text',
                                    letterSpacing: '-0.02em'
                                }}>
                                    Hakkımızda
                                </h2>
                                <p style={{
                                    fontSize: '1.125rem',
                                    lineHeight: 1.8,
                                    color: '#374151',
                                    marginBottom: '32px'
                                }}>
                                            Biz veteriner kliniklerin işlerini kolaylaştırmak için modern, kullanıcı dostu ve güçlü bir otomasyon sistemi sunuyoruz.
                                            Hasta kayıtlarından randevu yönetimine, stok takibinden raporlamaya kadar her şeyi tek platformda topluyoruz.
                                </p>
                                
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                    <div style={{
                                        padding: '24px',
                                        borderRadius: '16px',
                                        background: 'linear-gradient(135deg, rgba(89, 1, 139, 0.05) 0%, rgba(122, 31, 168, 0.02) 100%)',
                                        border: '1px solid rgba(89, 1, 139, 0.1)',
                                        transition: 'all 0.3s ease'
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!isMobile) {
                                            e.currentTarget.style.transform = 'translateX(8px)';
                                            e.currentTarget.style.borderColor = '#59018b';
                                            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(89, 1, 139, 0.08) 0%, rgba(122, 31, 168, 0.04) 100%)';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!isMobile) {
                                            e.currentTarget.style.transform = 'translateX(0)';
                                            e.currentTarget.style.borderColor = 'rgba(89, 1, 139, 0.1)';
                                            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(89, 1, 139, 0.05) 0%, rgba(122, 31, 168, 0.02) 100%)';
                                        }
                                    }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
                                            <div style={{
                                                width: '48px',
                                                height: '48px',
                                                borderRadius: '12px',
                                                background: 'linear-gradient(135deg, #59018b 0%, #7a1fa8 100%)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '1.5rem',
                                                flexShrink: 0
                                            }}>
                                                🎯
                                            </div>
                                            <h4 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: '#1a1a1a' }}>Vizyonumuz</h4>
                                        </div>
                                        <p style={{ fontSize: '0.9375rem', color: '#6b7280', margin: 0, lineHeight: 1.6, paddingLeft: '64px' }}>
                                            Türkiye'nin en güvenilir veteriner otomasyon sistemi olmak ve sektörde öncü olmak
                                        </p>
                                    </div>
                                    
                                    <div style={{
                                        padding: '24px',
                                        borderRadius: '16px',
                                        background: 'linear-gradient(135deg, rgba(89, 1, 139, 0.05) 0%, rgba(122, 31, 168, 0.02) 100%)',
                                        border: '1px solid rgba(89, 1, 139, 0.1)',
                                        transition: 'all 0.3s ease'
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!isMobile) {
                                            e.currentTarget.style.transform = 'translateX(8px)';
                                            e.currentTarget.style.borderColor = '#59018b';
                                            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(89, 1, 139, 0.08) 0%, rgba(122, 31, 168, 0.04) 100%)';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!isMobile) {
                                            e.currentTarget.style.transform = 'translateX(0)';
                                            e.currentTarget.style.borderColor = 'rgba(89, 1, 139, 0.1)';
                                            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(89, 1, 139, 0.05) 0%, rgba(122, 31, 168, 0.02) 100%)';
                                        }
                                    }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
                                            <div style={{
                                                width: '48px',
                                                height: '48px',
                                                borderRadius: '12px',
                                                background: 'linear-gradient(135deg, #59018b 0%, #7a1fa8 100%)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '1.5rem',
                                                flexShrink: 0
                                            }}>
                                                💡
                                            </div>
                                            <h4 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: '#1a1a1a' }}>Misyonumuz</h4>
                                        </div>
                                        <p style={{ fontSize: '0.9375rem', color: '#6b7280', margin: 0, lineHeight: 1.6, paddingLeft: '64px' }}>
                                            Kullanıcı dostu araçlarla iş süreçlerini kolaylaştırmak ve veteriner kliniklerin verimliliğini artırmak
                                        </p>
                                    </div>
                                </div>
                            </div>
                            </Col>
                        
                        {/* Contact Section - Enhanced */}
                        <Col xs="12" lg="6" id="contact">
                            <div style={{
                                padding: isMobile ? '32px 24px' : '48px 40px',
                                borderRadius: '24px',
                                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 249, 255, 0.95) 100%)',
                                border: '2px solid rgba(89, 1, 139, 0.1)',
                                backdropFilter: 'blur(10px)',
                                boxShadow: '0 12px 40px rgba(89, 1, 139, 0.1)',
                                height: '100%'
                            }}>
                                <h2 style={{
                                    fontSize: isMobile ? 'clamp(1.75rem, 6vw, 2rem)' : 'clamp(2.25rem, 4vw, 3rem)',
                                    fontWeight: 800,
                                    marginBottom: '24px',
                                    background: 'linear-gradient(135deg, #59018b 0%, #7a1fa8 100%)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    backgroundClip: 'text',
                                    letterSpacing: '-0.02em'
                                }}>
                                    İletişim
                                </h2>
                                <p style={{
                                    fontSize: '1.125rem',
                                    lineHeight: 1.8,
                                    color: '#374151',
                                    marginBottom: '32px'
                                }}>
                                    Herhangi bir sorunuz veya talebiniz için bize ulaşabilirsiniz. Size en kısa sürede dönüş yapacağız.
                                </p>
                                
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    <div style={{
                                        padding: '28px',
                                        borderRadius: '18px',
                                        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 249, 255, 0.95) 100%)',
                                        border: '2px solid rgba(89, 1, 139, 0.15)',
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                        backdropFilter: 'blur(10px)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '20px'
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!isMobile) {
                                            e.currentTarget.style.borderColor = '#59018b';
                                            e.currentTarget.style.boxShadow = '0 12px 32px rgba(89, 1, 139, 0.2)';
                                            e.currentTarget.style.transform = 'translateY(-4px)';
                                            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255, 255, 255, 1) 0%, rgba(248, 249, 255, 1) 100%)';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!isMobile) {
                                            e.currentTarget.style.borderColor = 'rgba(89, 1, 139, 0.15)';
                                            e.currentTarget.style.boxShadow = 'none';
                                            e.currentTarget.style.transform = 'translateY(0)';
                                            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 249, 255, 0.95) 100%)';
                                        }
                                    }}
                                    >
                                        <div style={{
                                            width: '56px',
                                            height: '56px',
                                            borderRadius: '16px',
                                            background: 'linear-gradient(135deg, #59018b 0%, #7a1fa8 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                                            fontSize: '1.5rem',
                                            flexShrink: 0,
                                            boxShadow: '0 4px 12px rgba(89, 1, 139, 0.3)'
                                        }}>
                                            📧
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '6px', color: '#1a1a1a' }}>Email</div>
                                            <a href="mailto:info@veterineroto.com" style={{
                                                color: '#6b7280',
                                                textDecoration: 'none',
                                                fontSize: '0.9375rem',
                                                transition: 'color 0.2s ease',
                                                display: 'block'
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.color = '#59018b'}
                                            onMouseLeave={(e) => e.currentTarget.style.color = '#6b7280'}
                                            >
                                                info@veterineroto.com
                                            </a>
                                        </div>
                                    </div>
                                    
                                    <div style={{
                                        padding: '28px',
                                        borderRadius: '18px',
                                        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 249, 255, 0.95) 100%)',
                                        border: '2px solid rgba(89, 1, 139, 0.15)',
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                        backdropFilter: 'blur(10px)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '20px'
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!isMobile) {
                                            e.currentTarget.style.borderColor = '#59018b';
                                            e.currentTarget.style.boxShadow = '0 12px 32px rgba(89, 1, 139, 0.2)';
                                            e.currentTarget.style.transform = 'translateY(-4px)';
                                            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255, 255, 255, 1) 0%, rgba(248, 249, 255, 1) 100%)';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!isMobile) {
                                            e.currentTarget.style.borderColor = 'rgba(89, 1, 139, 0.15)';
                                            e.currentTarget.style.boxShadow = 'none';
                                            e.currentTarget.style.transform = 'translateY(0)';
                                            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 249, 255, 0.95) 100%)';
                                        }
                                    }}
                                    >
                                        <div style={{
                                            width: '56px',
                                            height: '56px',
                                            borderRadius: '16px',
                                            background: 'linear-gradient(135deg, #59018b 0%, #7a1fa8 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                                            fontSize: '1.5rem',
                                            flexShrink: 0,
                                            boxShadow: '0 4px 12px rgba(89, 1, 139, 0.3)'
                                        }}>
                                            📱
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '6px', color: '#1a1a1a' }}>Telefon</div>
                                            <a href="tel:+905551234567" style={{
                                                color: '#6b7280',
                                                textDecoration: 'none',
                                                fontSize: '0.9375rem',
                                                transition: 'color 0.2s ease',
                                                display: 'block'
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.color = '#59018b'}
                                            onMouseLeave={(e) => e.currentTarget.style.color = '#6b7280'}
                                            >
                                                +90 555 123 45 67
                                            </a>
                                        </div>
                                    </div>
                                    
                                    <div style={{
                                        padding: '28px',
                                        borderRadius: '18px',
                                        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 249, 255, 0.95) 100%)',
                                        border: '2px solid rgba(89, 1, 139, 0.15)',
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                        backdropFilter: 'blur(10px)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '20px'
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!isMobile) {
                                            e.currentTarget.style.borderColor = '#59018b';
                                            e.currentTarget.style.boxShadow = '0 12px 32px rgba(89, 1, 139, 0.2)';
                                            e.currentTarget.style.transform = 'translateY(-4px)';
                                            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255, 255, 255, 1) 0%, rgba(248, 249, 255, 1) 100%)';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!isMobile) {
                                            e.currentTarget.style.borderColor = 'rgba(89, 1, 139, 0.15)';
                                            e.currentTarget.style.boxShadow = 'none';
                                            e.currentTarget.style.transform = 'translateY(0)';
                                            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 249, 255, 0.95) 100%)';
                                        }
                                    }}
                                    >
                                        <div style={{
                                            width: '56px',
                                            height: '56px',
                                            borderRadius: '16px',
                                            background: 'linear-gradient(135deg, #59018b 0%, #7a1fa8 100%)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '1.5rem',
                                            flexShrink: 0,
                                            boxShadow: '0 4px 12px rgba(89, 1, 139, 0.3)'
                                        }}>
                                            📍
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '6px', color: '#1a1a1a' }}>Adres</div>
                                            <div style={{ color: '#6b7280', fontSize: '0.9375rem' }}>
                                                İstanbul, Türkiye
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* Modals */}
            <Modal isOpen={modalOpen} toggle={() => setModalOpen(false)} centered size="xl">
                <ModalBody className="position-relative text-center p-0" style={{ background: "#000" }}>
                    <img src={screenshots[currentIndex]} alt="Büyük Görsel" style={{ width: '100%', height: 'auto', borderRadius: '5px' }} />
                    <Button onClick={goPrev} style={{
                        position: 'absolute', top: '50%', left: '20px', transform: 'translateY(-50%)',
                        width: '50px', height: '50px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.9)',
                        color: '#59018b', fontSize: '2rem', fontWeight: 'bold', border: 'none', zIndex: 999
                    }}>‹</Button>
                    <Button onClick={goNext} style={{
                        position: 'absolute', top: '50%', right: '20px', transform: 'translateY(-50%)',
                        width: '50px', height: '50px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.9)',
                        color: '#59018b', fontSize: '2rem', fontWeight: 'bold', border: 'none', zIndex: 999
                    }}>›</Button>
                </ModalBody>
            </Modal>

            <Modal isOpen={formModalOpen} toggle={toggleModal} centered size="lg">
                <ModalHeader toggle={toggleModal} style={{
                    background: '#59018b',
                    color: 'white', border: 'none', borderRadius: '10px 10px 0 0'
                }}>
                    {selectedPlan}
                </ModalHeader>
                <ModalBody style={{ padding: '32px', background: '#ffffff' }}>
                    <Form onSubmit={handleSubmit}>
                        <FormGroup>
                            <Label for="name" style={{ color: '#1a1a1a', fontWeight: 600, marginBottom: '8px' }}>Ad Soyad</Label>
                            <Input name="name" value={formData.name} onChange={handleChange} required
                                style={{ borderRadius: '8px', border: '1.5px solid #e5e7eb', padding: '12px', color: '#212529' }}
                                onFocus={(e) => e.currentTarget.style.borderColor = '#59018b'}
                                onBlur={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
                            />
                        </FormGroup>
                        <FormGroup>
                            <Label for="email" style={{ color: '#1a1a1a', fontWeight: 600, marginBottom: '8px' }}>E-Posta</Label>
                            <Input type="email" name="email" value={formData.email} onChange={handleChange} required
                                style={{ borderRadius: '8px', border: '1.5px solid #e5e7eb', padding: '12px', color: '#212529' }}
                                onFocus={(e) => e.currentTarget.style.borderColor = '#59018b'}
                                onBlur={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
                            />
                        </FormGroup>
                        <FormGroup>
                            <Label for="phone" style={{ color: '#1a1a1a', fontWeight: 600, marginBottom: '8px' }}>Telefon</Label>
                            <Input name="phone" value={formData.phone} onChange={handleChange} required
                                style={{ borderRadius: '8px', border: '1.5px solid #e5e7eb', padding: '12px', color: '#212529' }}
                                onFocus={(e) => e.currentTarget.style.borderColor = '#59018b'}
                                onBlur={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
                            />
                        </FormGroup>
                        <FormGroup>
                            <Label for="message" style={{ color: '#1a1a1a', fontWeight: 600, marginBottom: '8px' }}>Ek Mesaj</Label>
                            <Input type="textarea" name="message" value={formData.message} onChange={handleChange} rows={4}
                                style={{ borderRadius: '8px', border: '1.5px solid #e5e7eb', padding: '12px', color: '#212529' }}
                                onFocus={(e) => e.currentTarget.style.borderColor = '#59018b'}
                                onBlur={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
                            />
                        </FormGroup>
                        <div className="d-flex justify-content-end gap-2 mt-4">
                            <Button type="button" outline onClick={toggleModal}
                                style={{ borderRadius: '8px', padding: '10px 24px', borderColor: '#6b7280', color: '#6b7280' }}>
                                İptal
                            </Button>
                            <Button type="submit" style={{
                                borderRadius: '8px', padding: '10px 28px',
                                background: '#59018b',
                                border: 'none', fontWeight: 600, color: '#ffffff'
                            }}>
                                Gönder
                            </Button>
                        </div>
                    </Form>
                </ModalBody>
            </Modal>

            {/* Scroll to Top Button */}
            {scrollY > 300 && (
                <Button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    style={{
                        position: 'fixed', bottom: '24px', right: '24px',
                        width: '48px', height: '48px', borderRadius: '50%',
                        background: '#59018b',
                        border: 'none', zIndex: 1000, fontSize: '1.25rem', color: '#ffffff',
                        boxShadow: '0 4px 16px rgba(89, 1, 139, 0.3)',
                        transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#7a1fa8';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 6px 20px rgba(89, 1, 139, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#59018b';
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 16px rgba(89, 1, 139, 0.3)';
                    }}
                >
                    ↑
                </Button>
            )}

            {/* CSS Animations */}
            <style>{`
                @keyframes float {
                    0%, 100% { transform: translate(0, 0) rotate(0deg); }
                    25% { transform: translate(20px, -30px) rotate(90deg); }
                    50% { transform: translate(-15px, -50px) rotate(180deg); }
                    75% { transform: translate(-30px, -20px) rotate(270deg); }
                }
                @keyframes fadeInDown {
                    from {
                        opacity: 0;
                        transform: translateY(-20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                @keyframes fadeInRight {
                    from {
                        opacity: 0;
                        transform: translateX(50px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }
                @keyframes shine {
                    0% {
                        transform: translateX(-100%) translateY(-100%) rotate(45deg);
                    }
                    100% {
                        transform: translateX(100%) translateY(100%) rotate(45deg);
                    }
                }
            `}</style>
        </div>
    );
};

export default Landing;
