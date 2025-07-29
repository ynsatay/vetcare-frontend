// src/routes/Router.js
import React from "react";
import { Navigate } from "react-router-dom";

// Layout
import FullLayout from "../layouts/FullLayout.js";

// Giriş ve genel ekranlar
import Login from "../views/ui/Login.js";
import Register from "../views/ui/_Old_Register.js";

// Sayfalar
import Starter from "../views/Starter.js";
import About from "../views/About.js";
import Alerts from "../views/ui/Alerts.js";
import Badges from "../views/ui/Badges.js";
import Buttons from "../views/ui/Buttons.js";
import Cards from "../views/ui/Cards.js";
import Grid from "../views/ui/Grid.js";
import Tables from "../views/ui/Tables.js";
import Forms from "../views/ui/Forms.js";
import Breadcrumbs from "../views/ui/Breadcrumbs.js";
import Profile from "../views/ui/Profile.js";
import AnimalsManagment from "../views/ui/AnimalsManagment.js";
import PersonelManagment from "../views/ui/PersonelManagment.js";
import OfficeList from "../views/ui/OfficeList.js";
import ClinicList from "../views/ui/ClinicList.js";
import ApporinmentList from "../views/ui/Appointment.js";
import IdentityInfo from "../views/ui/IdentityInfo.js";
import PatientFile from "../views/ui/PatientFile.js";
import ProcessDef from "../views/ui/ProcessDef.js";
import StockList from "../views/list/StockList.js";
import ServiceList from "../views/list/ServiceList.js";
import StockInvoicePage from "../views/ui/StockInvoices.js";
import VaccinationTracker from "../views/ui/VaccinationTracker.js";
import ProviderFirmsList from "../views/ui/ProviderFirms.js";
import ProviderPriceList from "../views/ui/ProviderPriceList.js";
import CustometList from "../views/list/CustometList.js"; 
const ThemeRoutes = [
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },
  {
    path: "/",
    element: <FullLayout />,
    children: [
      { path: "/", element: <Navigate to="/starter" /> },
      { path: "/starter", element: <Starter /> },
      { path: "/about", element: <About /> },
      { path: "/alerts", element: <Alerts /> },
      { path: "/badges", element: <Badges /> },
      { path: "/buttons", element: <Buttons /> },
      { path: "/cards", element: <Cards /> },
      { path: "/grid", element: <Grid /> },
      { path: "/table", element: <Tables /> },
      { path: "/forms", element: <Forms /> },
      { path: "/breadcrumbs", element: <Breadcrumbs /> },
      { path: "/profile", element: <Profile /> }, 
      { path: "/animalslist", element: <AnimalsManagment /> },
      { path: "/personelManagment", element: <PersonelManagment /> },
      { path: "/officeList", element: <OfficeList /> },
      { path: "/clinicList", element: <ClinicList /> },
      { path: "/appointmentList", element: <ApporinmentList /> },
      { path: "/identityinfo/:id", element: <IdentityInfo /> },
      { path: "/patientFile/:id", element: <PatientFile /> },
      { path: "/processDef", element: <ProcessDef/>},
      { path: "/stoklist", element: <StockList/>},
      { path: "/servicelist", element: <ServiceList/>},
      { path: "/purchase-invoices", element: <StockInvoicePage /> },
      { path: "/vaccination-tracker", element: <VaccinationTracker /> },
      { path: "/providerfirms", element: <ProviderFirmsList /> },
      { path: "/providerpriceslist", element: <ProviderPriceList /> },
      { path: "/customerlist", element: <CustometList /> }

    ],
  },
];

export default ThemeRoutes;
