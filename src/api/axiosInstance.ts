import axios from 'axios';
import { logoutRef } from "../context/usercontext.tsx";

const axiosInstance = axios.create({
  baseURL: 'http://vatcare-backend-production.up.railway.app/api',
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
       window.alert('Oturumunuzun süresi doldu. Lütfen tekrar giriş yapın.');
      localStorage.clear();
      logoutRef();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);


export default axiosInstance;