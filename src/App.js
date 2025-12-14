import React, { useEffect } from 'react';
import { useRoutes } from 'react-router-dom';
import Themeroutes from './routes/Router.js';
import "./assets/scss/style.scss";
import './App.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ConfirmProvider } from './components/ConfirmContext';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { useLanguage } from './context/LanguageContext.js';
import applyTheme from './utils/theme';

const App = () => {
  useEffect(() => {
    // Hata yönetimi için window error event listener'ını ekliyoruz
    const errorHandler = (e) => {
      console.error('Bir hata oluştu:', e.error.message);
      // React'un listener'ının çalışmasını engelliyoruz
      e.preventDefault();
    };

    window.addEventListener('error', errorHandler);

    return () => {
      // Component unmount olduğunda event listener'ı kaldırıyoruz
      window.removeEventListener('error', errorHandler);
    };
  }, []);

  // apply saved theme prefs on app start
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('theme_prefs') || '{}');
      // Set default if not set
      if (!localStorage.getItem('theme_prefs')) {
        const defaultTheme = { dark: false, primary: 'indigo' };
        localStorage.setItem('theme_prefs', JSON.stringify(defaultTheme));
      }
      applyTheme(saved);
    } catch (e) {
      console.error('Theme apply failed', e);
    }
  }, []);

  const routing = useRoutes(Themeroutes);
  const { lang } = useLanguage();

  return (
    <div>
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={lang}>
        <ConfirmProvider>
          <ToastContainer />
          {routing}
        </ConfirmProvider>
      </LocalizationProvider>
    </div>
  );
}

export default App;
