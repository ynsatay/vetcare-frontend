import { lazy } from "react";
import { Navigate } from "react-router-dom";
import RequireAuth from "./RequireAuth.js";


/****Layouts*****/
const FullLayout = lazy(() => import("../layouts/FullLayout.js"));

/***** Pages ****/
const Starter = lazy(() => import("../views/Starter.js"));
const About = lazy(() => import("../views/About.js"));
const Alerts = lazy(() => import("../views/ui/Alerts.js"));
const Badges = lazy(() => import("../views/ui/Badges.js"));
const Buttons = lazy(() => import("../views/ui/Buttons.js"));
const Cards = lazy(() => import("../views/ui/Cards.js"));
const Grid = lazy(() => import("../views/ui/Grid.js"));
const Tables = lazy(() => import("../views/ui/Tables.js"));
const Forms = lazy(() => import("../views/ui/Forms.js"));
const Breadcrumbs = lazy(() => import("../views/ui/Breadcrumbs.js"));
const Login = lazy(() => import("../views/ui/Login.js"));
const Register = lazy(() => import("../views/ui/Register.js"));
const Profile = lazy(() => import("../views/ui/Profile.js"));
const AnimalsManagment = lazy(() => import("../views/ui/AnimalsManagment.js"));
const PersonelManagment = lazy(() => import("../views/ui/PersonelManagment.js"));
const OfficeList = lazy(() => import("../views/ui/OfficeList.js"));
const ClinicList = lazy(() => import("../views/ui/ClinicList.js"));
const ApporinmentList = lazy(() => import("../views/ui/Appointment.js"));
const IdentityInfo = lazy(() => import("../views/ui/IdentityInfo.js"));
const PatientFile = lazy(() => import("../views/ui/PatientFile.js"));
const ProcessDef = lazy(() => import("../views/ui/ProcessDef.js"));
const StockList = lazy(() => import("../views/list/StockList.js"));
const ServiceList = lazy(() => import("../views/list/ServiceList.js"));
const StockInvoicePage = lazy(() => import("../views/ui/StockInvoices.js"));
const VaccinationTracker = lazy(() => import("../views/ui/VaccinationTracker.js"));

/*****Routes******/
const ThemeRoutes = [
  {
    path: "/login",
    element: <Login />, // Bu ayrı kalacak
  },
  {
    path: "/register",
    element: <Register />, // Bu da
  },
  {
    path: "/",
    element: (
      <RequireAuth>
        <FullLayout />
      </RequireAuth>
    ),
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

    ],
  },
];

export default ThemeRoutes;
