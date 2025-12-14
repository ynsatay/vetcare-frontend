import React, { useState, useEffect, useContext } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Navbar,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Dropdown,
  Button,
  Nav,
  NavItem,
} from "reactstrap";
import "./scss/_header.scss";
import { AuthContext } from "../context/usercontext.tsx";
import { useLanguage } from "../context/LanguageContext.js";
import { palettes } from "../utils/theme.js";

const Header = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { isLogin, logout, profileImage } = useContext(AuthContext);
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [scrolled, setScrolled] = useState(false);
  const [themeColor, setThemeColor] = useState('#59018b');
  const [themeLightColor, setThemeLightColor] = useState('#7a1fa8');
  const location = useLocation();
  const navigate = useNavigate();

  const toRgba = (color, alpha) => {
    if (!color || typeof color !== 'string') return `rgba(89, 1, 139, ${alpha})`;
    const hex = color.replace('#', '').trim();
    // #RRGGBB or #RRGGBBAA
    if (hex.length === 6 || hex.length === 8) {
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    return color;
  };

  const toggleDropdown = () => setDropdownOpen((prev) => !prev);

  const handleSidebarToggle = () => {
    const sidebar = document.getElementById("sidebarArea");
    if (sidebar) {
      sidebar.classList.toggle("showSidebar");
    }
  };

  useEffect(() => {
    setIsLoading(false);

    // Load theme from localStorage
    const loadTheme = () => {
      try {
        const themePrefs = localStorage.getItem('theme_prefs');
        const prefs = themePrefs ? JSON.parse(themePrefs) : { dark: false, primary: 'home' };
        const primaryPalette = palettes[prefs.primary] || palettes.home || palettes.indigo;

        if (prefs.dark) {
          setThemeColor(primaryPalette[2] || primaryPalette[0]);
          setThemeLightColor(primaryPalette[1] || primaryPalette[0]);
        } else {
          setThemeColor(primaryPalette[0]);
          setThemeLightColor(primaryPalette[1] || primaryPalette[0]);
        }
      } catch {
        const homePalette = palettes.home || palettes.indigo;
        setThemeColor(homePalette[0]);
        setThemeLightColor(homePalette[1] || homePalette[0]);
      }
    };
    loadTheme();

    // Listen for theme changes
    const handleThemeChange = () => {
      loadTheme();
    };
    window.addEventListener('themechange', handleThemeChange);

    // Window resize listener
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    handleResize();

    // Scroll listener
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('themechange', handleThemeChange);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  if (isLoading) return null;

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -70;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlelogout = () => {
    logout();
    navigate("/");
  };

  const closeMobileMenu = () => {
    setIsOpen(false);
  };

  return (
    <>
      <Navbar
       
        style={{
          background: scrolled
            ? `linear-gradient(135deg, ${toRgba(themeColor, 0.98)} 0%, ${toRgba(themeLightColor, 0.98)} 100%)`
            : `linear-gradient(135deg, ${themeColor} 0%, ${themeLightColor} 100%)`,
          height: "70px",
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1030,
          boxShadow: scrolled
            ? `0 8px 30px ${toRgba(themeColor, 0.4)}`
            : `0 2px 15px ${toRgba(themeColor, 0.2)}`,
          transition: 'all 0.3s ease',
          backdropFilter: scrolled ? 'blur(10px)' : 'none',
          WebkitBackdropFilter: scrolled ? 'blur(10px)' : 'none'
        }}
        expand="md"
      >
        {isLogin ? (
          // Giriş yapılmış hali
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              width: "100%",
              padding: '0 20px'
            }}
          >
            <div className="d-flex align-items-center d-lg-none">
              <button
                onClick={() => {
                  handleSidebarToggle();
                }}
                style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '12px',
                  width: '45px',
                  height: '45px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  color: '#fff',
                  fontSize: '1.5rem'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)';
                  e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                <i className="bi bi-list"></i>
              </button>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "center",
                flexGrow: 1,
              }}
            >
              <Dropdown isOpen={dropdownOpen} toggle={toggleDropdown}>
                <DropdownToggle
                  style={{
                    background: 'transparent',
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: '50%',
                    padding: '4px',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.6)';
                    e.currentTarget.style.transform = 'scale(1.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  <img
                    src={profileImage}
                    alt="profile"
                    className="rounded-circle"
                    width="40"
                    height="40"
                    style={{
                      border: '2px solid rgba(255, 255, 255, 0.5)',
                      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)'
                    }}
                  />
                </DropdownToggle>
                <DropdownMenu
                  style={{
                    borderRadius: '15px',
                    border: 'none',
                    boxShadow: '0 10px 40px rgba(89, 1, 139, 0.3)',
                    marginTop: '10px',
                    padding: '10px 0',
                    minWidth: '200px'
                  }}
                >
                  <DropdownItem header style={{
                    fontWeight: 700,
                    color: '#59018b',
                    fontSize: '1.1rem'
                  }}>
                    {t('User')}
                  </DropdownItem>
                  <DropdownItem
                    tag={Link}
                    to="/profile"
                    style={{
                      transition: 'all 0.2s ease',
                      borderRadius: '8px',
                      margin: '5px 10px'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(135deg, rgba(89, 1, 139, 0.1) 0%, rgba(122, 31, 168, 0.1) 100%)';
                      e.currentTarget.style.transform = 'translateX(5px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.transform = 'translateX(0)';
                    }}
                  >
                    <i className="bi bi-person-circle me-2"></i> {t('MyAccount')}
                  </DropdownItem>
                  <DropdownItem divider />
                  <DropdownItem
                    onClick={handlelogout}
                    style={{
                      transition: 'all 0.2s ease',
                      borderRadius: '8px',
                      margin: '5px 10px',
                      color: '#dc3545'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(220, 53, 69, 0.1)';
                      e.currentTarget.style.transform = 'translateX(5px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.transform = 'translateX(0)';
                    }}
                  >
                    <i className="bi bi-box-arrow-right me-2"></i> {t('Logout')}
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </div>
          </div>
        ) : (
          // Giriş yapılmamış hali
          <div
            className="container-fluid d-flex justify-content-between align-items-center"
            style={{
              width: '100%',
              padding: '0 20px',
              position: 'relative'
            }}
          >
            {/* Sol: Logo */}
            <Link
              to="/"
              className="navbar-brand"
              style={{
                fontWeight: 700,
                fontSize: "clamp(1.1rem, 2.5vw, 1.4rem)",
                color: "#fff",
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                textDecoration: 'none',
                whiteSpace: 'nowrap',
                transition: 'all 0.3s ease',
                marginRight: '40px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.textShadow = '0 2px 10px rgba(255, 255, 255, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.textShadow = 'none';
              }}
            >
              <span style={{ fontSize: '1.8rem', display: 'inline-block' }}>🐾</span>
              <span>VetCare</span>
            </Link>

            {/* Navigation Links - Desktop */}
            <Nav className="d-none d-md-flex align-items-center" style={{ gap: '8px', flex: 1 }}>
              <NavItem>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection('hero');
                  }}
                  style={{
                    color: '#fff',
                    textDecoration: 'none',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '0.95rem',
                    fontWeight: 500,
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  {t('Home')}
                </a>
              </NavItem>

              <NavItem>
                <a
                  href="#features"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection('features');
                  }}
                  style={{
                    color: '#fff',
                    textDecoration: 'none',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '0.95rem',
                    fontWeight: 500,
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                {t('Features')}
              </a>
              </NavItem>
              <NavItem>
                <a
                  href="#pricing"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection('pricing');
                  }}
                  style={{
                    color: '#fff',
                    textDecoration: 'none',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '0.95rem',
                    fontWeight: 500,
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                {t('Pricing')}
              </a>
              </NavItem>
              <NavItem>
                <a
                  href="#testimonials"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection('testimonials');
                  }}
                  style={{
                    color: '#fff',
                    textDecoration: 'none',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '0.95rem',
                    fontWeight: 500,
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                {t('Testimonials')}
              </a>
              </NavItem>
              <NavItem>
                <a
                  href="#videos"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection('videos');
                  }}
                  style={{
                    color: '#fff',
                    textDecoration: 'none',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '0.95rem',
                    fontWeight: 500,
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                {t('Videos')}
              </a>
              </NavItem>
              <NavItem>
                <a
                  href="#about"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection('about');
                  }}
                  style={{
                    color: '#fff',
                    textDecoration: 'none',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '0.95rem',
                    fontWeight: 500,
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                {t('AboutContact')}
              </a>
              </NavItem>
            </Nav>

            {/* Modern Hamburger Menü Butonu */}
            <button
              className="d-md-none"
              onClick={() => setIsOpen(!isOpen)}
              style={{
                background: isOpen
                  ? 'rgba(255, 255, 255, 0.25)'
                  : 'rgba(255, 255, 255, 0.15)',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '12px',
                width: '48px',
                height: '48px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '5px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                zIndex: 1050,
                position: 'relative'
              }}
              onMouseEnter={(e) => {
                if (!isOpen) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)';
                  e.currentTarget.style.transform = 'scale(1.05)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isOpen) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                  e.currentTarget.style.transform = 'scale(1)';
                }
              }}
            >
              <span
                style={{
                  width: '24px',
                  height: '3px',
                  background: '#fff',
                  borderRadius: '3px',
                  transition: 'all 0.3s ease',
                  transform: isOpen ? 'rotate(45deg) translateY(8px)' : 'none'
                }}
              ></span>
              <span
                style={{
                  width: '24px',
                  height: '3px',
                  background: '#fff',
                  borderRadius: '3px',
                  transition: 'all 0.3s ease',
                  opacity: isOpen ? 0 : 1
                }}
              ></span>
              <span
                style={{
                  width: '24px',
                  height: '3px',
                  background: '#fff',
                  borderRadius: '3px',
                  transition: 'all 0.3s ease',
                  transform: isOpen ? 'rotate(-45deg) translateY(-8px)' : 'none'
                }}
              ></span>
            </button>

            <Button
              className="d-none d-md-block ms-3"
              style={{
                background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                border: 'none',
                borderRadius: '25px',
                fontWeight: 600,
                fontSize: '0.95rem',
                padding: '10px 25px',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
                transition: 'all 0.3s ease',
                color: '#59018b',
                whiteSpace: 'nowrap'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.3)';
                e.currentTarget.style.background = 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.2)';
                e.currentTarget.style.background = 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)';
              }}
            >
              <Link
                to="/login"
                className="text-decoration-none"
                style={{
                  color: '#59018b ',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px' 
                }}
              >
                <i className="bi bi-person-fill"></i> {t('Login')}
              </Link>
            </Button>
          </div>
        )}
      </Navbar>

      {/* Mobil Overlay Menü */}
      {!isLogin && isMobile && isOpen && (
        <>
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.4)',
              backdropFilter: 'blur(4px)',
              WebkitBackdropFilter: 'blur(4px)',
              zIndex: 1025,
              animation: 'fadeIn 0.3s ease'
            }}
            onClick={closeMobileMenu}
          ></div>
          <div
            style={{
              position: 'fixed',
              top: '70px',
              left: 0,
              width: '80%',
              maxWidth: '320px',
              height: 'calc(100vh - 70px)',
              background: 'rgba(255, 255, 255, 0.85)',
              backdropFilter: 'blur(40px) saturate(180%)',
              WebkitBackdropFilter: 'blur(40px) saturate(180%)',
              boxShadow: '5px 0 40px rgba(0, 0, 0, 0.15)',
              borderRight: '1px solid rgba(255, 255, 255, 0.3)',
              zIndex: 1030,
              padding: '40px 25px',
              overflowY: 'auto',
              transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
              transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              animation: 'slideInLeft 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            {/* Logo/Brand */}
            <div style={{
              marginBottom: '40px',
              paddingBottom: '30px',
              borderBottom: '1px solid rgba(89, 1, 139, 0.1)'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '20px'
              }}>
                <span style={{ fontSize: '2rem' }}>🐾</span>
                <span style={{
                  fontWeight: 700,
                  fontSize: '1.5rem',
                  color: '#59018b',
                  letterSpacing: '0.5px'
                }}>VetCare</span>
              </div>
            </div>

            <div style={{ marginBottom: '30px' }}>
              <Link
                to="/"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToTop();
                  closeMobileMenu();
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '15px',
                  padding: '18px 20px',
                  borderRadius: '18px',
                  background: 'rgba(89, 1, 139, 0.08)',
                  color: '#59018b',
                  textDecoration: 'none',
                  fontWeight: 600,
                  fontSize: '1.1rem',
                  marginBottom: '12px',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  border: '1px solid rgba(89, 1, 139, 0.15)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(89, 1, 139, 0.15)';
                  e.currentTarget.style.transform = 'translateX(8px) scale(1.02)';
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(89, 1, 139, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(89, 1, 139, 0.08)';
                  e.currentTarget.style.transform = 'translateX(0) scale(1)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <span style={{ fontSize: '1.3rem' }}>🏠</span>
                <span>{t('Home')}</span>
              </Link>
              
              <a
                href="#features"
                onClick={(e) => {
                  e.preventDefault();
                  if (location.pathname === "/") {
                    scrollToSection("features");
                  } else {
                    navigate("/", { state: { scrollTo: "features" } });
                  }
                  closeMobileMenu();
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '15px',
                  padding: '18px 20px',
                  borderRadius: '18px',
                  background: 'rgba(89, 1, 139, 0.08)',
                  color: '#59018b',
                  textDecoration: 'none',
                  fontWeight: 600,
                  fontSize: '1.1rem',
                  marginBottom: '30px',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  border: '1px solid rgba(89, 1, 139, 0.15)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(89, 1, 139, 0.15)';
                  e.currentTarget.style.transform = 'translateX(8px) scale(1.02)';
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(89, 1, 139, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(89, 1, 139, 0.08)';
                  e.currentTarget.style.transform = 'translateX(0) scale(1)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <span style={{ fontSize: '1.3rem' }}>⚙️</span>
                <span>{t('Features')}</span>
              </a>

              <a
                href="#pricing"
                onClick={(e) => {
                  e.preventDefault();
                  if (location.pathname === "/") {
                    scrollToSection("pricing");
                  } else {
                    navigate("/", { state: { scrollTo: "pricing" } });
                  }
                  closeMobileMenu();
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '15px',
                  padding: '18px 20px',
                  borderRadius: '18px',
                  background: 'rgba(89, 1, 139, 0.08)',
                  color: '#59018b',
                  textDecoration: 'none',
                  fontWeight: 600,
                  fontSize: '1.1rem',
                  marginBottom: '30px',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  border: '1px solid rgba(89, 1, 139, 0.15)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(89, 1, 139, 0.15)';
                  e.currentTarget.style.transform = 'translateX(8px) scale(1.02)';
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(89, 1, 139, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(89, 1, 139, 0.08)';
                  e.currentTarget.style.transform = 'translateX(0) scale(1)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <span style={{ fontSize: '1.3rem' }}>💰</span>
                <span>{t('Pricing')}</span>
              </a>

               <a
                href="#testimonials"
                onClick={(e) => {
                  e.preventDefault();
                  if (location.pathname === "/") {
                    scrollToSection("testimonials");
                  } else {
                    navigate("/", { state: { scrollTo: "testimonials" } });
                  }
                  closeMobileMenu();
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '15px',
                  padding: '18px 20px',
                  borderRadius: '18px',
                  background: 'rgba(89, 1, 139, 0.08)',
                  color: '#59018b',
                  textDecoration: 'none',
                  fontWeight: 600,
                  fontSize: '1.1rem',
                  marginBottom: '30px',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  border: '1px solid rgba(89, 1, 139, 0.15)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(89, 1, 139, 0.15)';
                  e.currentTarget.style.transform = 'translateX(8px) scale(1.02)';
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(89, 1, 139, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(89, 1, 139, 0.08)';
                  e.currentTarget.style.transform = 'translateX(0) scale(1)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <span style={{ fontSize: '1.3rem' }}>💬</span>
                <span>{t('Testimonials')}</span>
              </a>

               <a
                href="#videos"
                onClick={(e) => {
                  e.preventDefault();
                  if (location.pathname === "/") {
                    scrollToSection("videos");
                  } else {
                    navigate("/", { state: { scrollTo: "testimonials" } });
                  }
                  closeMobileMenu();
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '15px',
                  padding: '18px 20px',
                  borderRadius: '18px',
                  background: 'rgba(89, 1, 139, 0.08)',
                  color: '#59018b',
                  textDecoration: 'none',
                  fontWeight: 600,
                  fontSize: '1.1rem',
                  marginBottom: '30px',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  border: '1px solid rgba(89, 1, 139, 0.15)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(89, 1, 139, 0.15)';
                  e.currentTarget.style.transform = 'translateX(8px) scale(1.02)';
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(89, 1, 139, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(89, 1, 139, 0.08)';
                  e.currentTarget.style.transform = 'translateX(0) scale(1)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <span style={{ fontSize: '1.3rem' }}>🎥</span>
                <span>{t('Videos')}</span>
              </a>

              <a
                href="#about"
                onClick={(e) => {
                  e.preventDefault();
                  if (location.pathname === "/") {
                    scrollToSection("about");
                  } else {
                    navigate("/", { state: { scrollTo: "about" } });
                  }
                  closeMobileMenu();
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '15px',
                  padding: '18px 20px',
                  borderRadius: '18px',
                  background: 'rgba(89, 1, 139, 0.08)',
                  color: '#59018b',
                  textDecoration: 'none',
                  fontWeight: 600,
                  fontSize: '1.1rem',
                  marginBottom: '12px',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  border: '1px solid rgba(89, 1, 139, 0.15)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(89, 1, 139, 0.15)';
                  e.currentTarget.style.transform = 'translateX(8px) scale(1.02)';
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(89, 1, 139, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(89, 1, 139, 0.08)';
                  e.currentTarget.style.transform = 'translateX(0) scale(1)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <span style={{ fontSize: '1.3rem' }}>ℹ️</span>
                <span>{t('AboutContact')}</span>
              </a>
              <Link
                to="/login"
                onClick={closeMobileMenu}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  padding: '18px 25px',
                  borderRadius: '25px',
                  background: 'linear-gradient(135deg, #59018b 0%, #7a1fa8 100%)',
                  color: '#fff',
                  textDecoration: 'none',
                  fontWeight: 700,
                  fontSize: '1.1rem',
                  boxShadow: '0 6px 20px rgba(89, 1, 139, 0.3)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  marginTop: '20px',
                  border: 'none'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(89, 1, 139, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(89, 1, 139, 0.3)';
                }}
              >
                <i className="bi bi-person-fill"></i>
                <span>{t('Login')}</span>
              </Link>
            </div>
          </div>
        </>
      )}

      {/* CSS Animations */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes slideInLeft {
          from {
            transform: translateX(-100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        /* iPhone tarzı scrollbar */
        ::-webkit-scrollbar {
          width: 6px;
        }
        ::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.05);
          border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb {
          background: rgba(89, 1, 139, 0.3);
          border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(89, 1, 139, 0.5);
        }
      `}</style>
    </>
  );
};

export default Header;
