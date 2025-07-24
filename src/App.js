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

  const routing = useRoutes(Themeroutes);

  return (
    <div className="dark">
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <ConfirmProvider>
          <ToastContainer />
          {routing}
        </ConfirmProvider>
      </LocalizationProvider>
    </div>
  );
}

export default App;
