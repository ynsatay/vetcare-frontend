import React, { useState, useContext, useRef } from 'react';
import { Button, Nav, NavItem } from "reactstrap";
import Logo from "./Logo";
import { Link, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import AuthContext from '../context/usercontext.tsx';
import './scss/_sidebar.scss';
import PatientReg from '../views/popup/PatientReg.js';
import MainModal from '../components/MainModal.js';
import {
  faCat,
  faHomeUser,
  faHouseMedical,
  faUsers,
  faChevronDown,
  faChevronUp,
  faIdCard,
  faBoxOpen,
  faStethoscope,
  faFolderOpen,
  faCalendarDays,
  faFileInvoice,
  faSyringe,
  faTruck,
  faMoneyBillWave,
  faUserTie
} from '@fortawesome/free-solid-svg-icons';



const Sidebar = () => {
  const { userRole } = useContext(AuthContext);
  const [openMenus, setOpenMenus] = useState({});
  const [modal, setModal] = useState(null); // Modal içeriğini saklamak için state
  const [isOpen, setIsOpen] = useState(false); // Modal açılma durumu
  const [modalTitle, setModalTitle] = useState(''); // Modal baslığını saklamak için state
  const [showFooter, setShowFooter] = useState(true);

  const patientRef = useRef();

  const navigation = [
    // {
    //   title: "Alert",
    //   href: "/alerts",
    //   icon: "bi bi-bell",
    //   icon2: "",
    //   rol: 0,
    //   subMenu: [
    //     { title: "Detay1", href: "/cards" },
    //     { title: "Detay2", href: "/buttons" },
    //   ],
    // },
    // {
    //   title: "Badges",
    //   href: "/badges",
    //   icon: "bi bi-patch-check",
    //   icon2: "",
    //   rol: 0,
    //   subMenu: [
    //     { title: "Detay3", href: "/grid" },
    //     { title: "Detay4", href: "/table" },
    //   ],
    // },
    // {
    //   title: "Buttons",
    //   href: "/buttons",
    //   icon: "bi bi-hdd-stack",
    //   icon2: "",
    //   rol: 0,
    // },
    // {
    //   title: "Cards",
    //   href: "/cards",
    //   icon: "bi bi-card-text",
    //   icon2: "",
    //   rol: 0,
    // },
    // {
    //   title: "Grid",
    //   href: "/grid",
    //   icon: "bi bi-columns",
    //   icon2: "",
    //   rol: 0,
    // },
    // {
    //   title: "Table",
    //   href: "/table",
    //   icon: "bi bi-layout-split",
    //   icon2: "",
    //   rol: 0,
    // },
    // {
    //   title: "Forms",
    //   href: "/forms",
    //   icon: "bi bi-textarea-resize",
    //   icon2: "",
    //   rol: 0,
    // },
    // {
    //   title: "Breadcrumbs",
    //   href: "/breadcrumbs",
    //   icon: "bi bi-link",
    //   icon2: "",
    //   rol: 0,
    // },
    // {
    //   title: "About",
    //   href: "/about",
    //   icon: "bi bi-people",
    //   icon2: "",
    //   rol: 0,
    // },
    // {
    //   title: "Anasayfa",
    //   href: "/starter",
    //   icon: "bi bi-speedometer2",
    //   icon2: "",
    //   rol: 0,
    // },
    // {
    //   title: "Bildirimler",
    //   href: "/alerts",
    //   icon: "bi bi-bell",
    //   icon2: "",
    //   rol: 0,
    // },
    // {
    //   title: "Randevu Listesi",
    //   href: "/grid",
    //   icon: "bi bi-columns",
    //   icon2: "",
    //   rol: 0,
    // },
    {
      title: "Anasayfa",
      href: "/",
      icon: "",
      icon2: faHomeUser,
      rol: 0,
      modal: null,
    },
    {
      title: "Hasta Arama / Kayıt",
      href: "/PatientReg",
      icon: "",
      icon2: faIdCard,
      rol: 2,
      modal: () => <PatientReg ref={patientRef} onClose={() => setIsOpen(false)} />,
      footer: false,
    },
    {
      title: "Aşı Takibi",
      href: "/vaccination-tracker",
      icon: "",
      icon2: faSyringe,
      rol: 2,
      modal: null,
      footer: false,
    },
    {
      title: "Hayvan Listesi",
      href: "/Animalslist",
      icon: "",
      icon2: faCat,
      rol: 2,
      modal: null,
    },
    {
      title: "Müşteri Listesi",
      href: "/customerlist",
      icon: "",
      icon2: faUsers,
      rol: 2,
      modal: null,
    },
    {
      title: "Personel Ekranı",
      href: "/PersonelManagment",
      icon: "",
      icon2: faUserTie,
      rol: 3,
      modal: null,
    },
    {
      title: "Kurum Listesi",
      href: "/clinicList",
      icon: "",
      icon2: faHomeUser,
      rol: 3,
      modal: null,
    },
    {
      title: "Şube Listesi",
      href: "/officeList",
      icon: "",
      icon2: faHouseMedical,
      rol: 3,
      modal: null,
    },
    {
      title: "Randevu Listesi",
      href: "/appointmentList",
      icon: "",
      icon2: faCalendarDays,
      rol: 2,
      modal: null,
    },
    // { KAPALI KALSIN İHTİYAÇ OLURSA ÖRNEK OLARAK BU EKRANA BAKIALBİLİR.
    //   title: "Stok/Hizmet Tanımı",
    //   href: "/processDef",
    //   icon: "",
    //   icon2: faFolderOpen,
    //   rol: 2,
    //   modal: null,
    // },
    {
      title: "Tedarikçi Firmaları",
      href: "/providerfirms",
      icon: "",
      icon2: faTruck,
      rol: 2,
      modal: null,
    },
    {
      title: "Tedarikçi Fiyat Listesi",
      href: "/providerpriceslist",
      icon: "",
      icon2: faMoneyBillWave,
      rol: 2,
      modal: null,
    },
    {
      title: "Stok / Hizmet",
      href: "",
      icon: "bi bi-patch-check",
      icon2: faFolderOpen,
      rol: 2,
      subMenu: [
        { title: "Stok Listesi", href: "/stoklist", icon: "", icon2: faBoxOpen },
        { title: "Hizmet Listesi", href: "/servicelist", icon: "", icon2: faStethoscope },
        { title: "Stok Faturası", href: "/purchase-invoices", icon: "", icon2: faFileInvoice },

      ],
    },
  ];

  let location = useLocation();

  const toggleMenu = (index) => {
    setOpenMenus({
      ...openMenus,
      [index]: !openMenus[index]
    });
  };

  const toggleModal = (modalFn) => {
    setModal(() => modalFn); // fonksiyonu sakla
    setIsOpen(true); // modalı aç
  };

  const closeSidebarIfMobile = () => {
    if (window.innerWidth < 991) {
      document.getElementById("sidebarArea")?.classList.remove("showSidebar");
    }
  };

  return (
    <div className="p-3">
      {/* Logo */}
      <div style={{ height: "40px" }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <Logo />
          <span className="ms-auto d-lg-none">
            <Button
              close
              size="sm"
              className="ms-auto d-lg-none"
              onClick={() => document.getElementById("sidebarArea").classList.toggle("showSidebar")}
            ></Button>
          </span>
        </div>
      </div>

      {/* Menu */}
      <div className="pt-4 mt-2">
        <Nav vertical className="sidebarNav">
          {navigation.map((navi, index) => (
            userRole >= navi.rol &&
            <NavItem key={index} className="sidenav-bg">
              <Link
                to={navi.modal ? "#" : navi.href} // Modal varsa link çalışmaz
                className={
                  location.pathname === navi.href
                    ? "text-primary nav-link py-3"
                    : "nav-link text-secondary py-3"
                }
                onClick={(e) => {
                  if (navi.subMenu && !navi.modal) {
                    // Alt menü varsa ve modal değilse sayfaya gitmesin
                    e.preventDefault();
                    toggleMenu(index); // Menü aç/kapa
                    return;
                  }

                  if (typeof navi.modal === 'function') {
                    e.preventDefault();
                    setModalTitle(navi.title);
                    toggleModal(navi.modal);
                    setShowFooter(navi.footer);
                  }

                  closeSidebarIfMobile();
                }}

              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <FontAwesomeIcon icon={navi.icon2} />
                    <span className="ms-3 d-inline-block">{navi.title}</span>
                  </div>
                  {navi.subMenu && (
                    <FontAwesomeIcon
                      icon={openMenus[index] ? faChevronUp : faChevronDown}
                      onClick={(e) => {
                        e.preventDefault();
                        toggleMenu(index);
                      }}
                    />
                  )}
                </div>
              </Link>

              {openMenus[index] && navi.subMenu && (
                <Nav vertical className="subMenu">
                  {navi.subMenu.map((subItem, subIndex) => (
                    <NavItem key={subIndex} className="sidenav-bg sub-nav-item">
                      <Link
                        to={subItem.href}
                        className={
                          location.pathname === subItem.href
                            ? "text-primary nav-link py-2"
                            : "nav-link text-secondary py-2"
                        }
                        onClick={() => {
                          closeSidebarIfMobile(); 
                        }}
                      >
                        <div className="d-flex align-items-center">
                          {subItem.icon2 && <FontAwesomeIcon icon={subItem.icon2} className="me-1 ms-2" />}
                          <span>{subItem.title}</span>
                        </div>
                      </Link>
                    </NavItem>
                  ))}
                </Nav>
              )}
            </NavItem>
          ))}
        </Nav>
      </div>

      {modal && (
        <MainModal
          isOpen={isOpen}
          toggle={() => setIsOpen(false)}
          title={modalTitle}
          content={modal()}
          ShowFooter={showFooter}
        />
      )}
    </div>
  );
};

export default Sidebar;


