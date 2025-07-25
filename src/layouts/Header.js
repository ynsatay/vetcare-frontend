import React, { useState, useEffect, useContext } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Navbar,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Dropdown,
  Button,
  Collapse,
  Nav,
  NavItem,
} from "reactstrap";
import "./scss/_header.scss";
import { AuthContext } from "../context/usercontext.tsx";

const Header = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { isLogin, logout, profileImage } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false); // Collapse toggler
  const location = useLocation();
  const navigate = useNavigate();

  const toggleDropdown = () => setDropdownOpen((prev) => !prev);

  const handleSidebarToggle = () => {
    const sidebar = document.getElementById("sidebarArea");
    if (sidebar) {
      sidebar.classList.toggle("showSidebar");
    }
  };

  useEffect(() => {
    setIsLoading(false);
  }, []);

  if (isLoading) return null;

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -60; // navbar yüksekliği kadar offset
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

  
  return (
    <Navbar
      className="navbar"
      style={{
        backgroundColor: "#59018b",
        height: "60px",
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1030,
      }}
      dark
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
          }}
        >
          <div className="d-flex align-items-center d-lg-none">
            <Button
              color="light"
              size="sm"
              onClick={() => {
                handleSidebarToggle();
                setIsOpen(!isOpen);
              }}
              style={{ marginLeft: "10px" }}
            >
              <i className="bi bi-list"></i>
            </Button>
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
                style={{ backgroundColor: "#59018b", border: "none" }}

              >
                <img
                  src={profileImage}
                  alt="profile"
                  className="rounded-circle"
                  width="35"
                  height="35"
                />
              </DropdownToggle>
              <DropdownMenu>
                <DropdownItem header>Kullanıcı</DropdownItem>
                <DropdownItem tag={Link} to="/profile">
                  Hesabım
                </DropdownItem>
                {/* <DropdownItem>Edit Profile</DropdownItem>
                <DropdownItem divider />
                <DropdownItem>My Balance</DropdownItem>
                <DropdownItem>Inbox</DropdownItem> */}
                <DropdownItem divider />
                <DropdownItem onClick={handlelogout}>Çıkış Yap</DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        </div>
      ) : (
        // Giriş yapılmamış hali
        <div className="container-fluid d-flex justify-content-between align-items-center">
          {/* Sol: Logo veya Site Adı */}
          <Link
            to="/"
            className="navbar-brand"
            style={{ fontWeight: "bold", fontSize: "20px", color: "#fff" }}
          >
            VetCare
          </Link>

          {isLogin ? (
            <div className="d-flex align-items-center d-lg-none">
              <Button
                color="light"
                size="sm"
                onClick={() => {
                  handleSidebarToggle();
                  setIsOpen(!isOpen);
                }}
                style={{ marginLeft: "10px" }}
              >
                <i className="bi bi-list"></i>
              </Button>
            </div>
          ) : null}

          <Collapse isOpen={isOpen} navbar className="flex-grow-1">
            <Nav className="mx-auto" navbar>
              <NavItem>
                <Link
                  to="/"
                  className="nav-link text-white"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToTop();
                    if (isOpen) setIsOpen(false);
                  }}
                >
                  Anasayfa
                </Link>
              </NavItem>
              <NavItem>
                <a
                  href="#about"
                  className="nav-link text-white"
                  onClick={(e) => {
                    e.preventDefault();
                    if (location.pathname === "/") {
                      scrollToSection("about");
                    } else {
                      navigate("/", { state: { scrollTo: "about" } });
                    }
                    if (isOpen) setIsOpen(false);
                  }}
                >
                  Hakkımızda
                </a>
              </NavItem>
              <NavItem>
                <a
                  href="#contact"
                  className="nav-link text-white"
                  onClick={(e) => {
                    e.preventDefault();
                    if (location.pathname === "/") {
                      scrollToSection("contact");
                    } else {
                      navigate("/", { state: { scrollTo: "contact" } });
                    }
                    if (isOpen) setIsOpen(false);
                  }}
                >
                  İletişim
                </a>
              </NavItem>
            </Nav>
          </Collapse>

          {/* Sağ: Giriş Butonu */}
          <Button color="light" className="px-3 ms-3">
            <Link
              to="/login"
              className="login-link text-dark text-decoration-none"
            >
              <i className="bi bi-person-fill"></i> Giriş Yap
            </Link>
          </Button>
        </div>
      )}
    </Navbar>
  );
};

export default Header;
