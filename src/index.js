import React, { Suspense } from "react";
// import ReactDOM from "react-dom";
import { createRoot } from 'react-dom/client';
import "./assets/scss/style.scss";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { BrowserRouter  } from "react-router-dom";
import Loader from "./layouts/loader/Loader";
import { AuthContextProvider } from "./context/usercontext.tsx";

const rootElement = document.getElementById('root');
const root = createRoot(rootElement);

root.render(

  <Suspense fallback={<Loader />}>
    <AuthContextProvider>
      <BrowserRouter  >
        <App />
      </BrowserRouter >
    </AuthContextProvider>
  </Suspense>

);

reportWebVitals();
