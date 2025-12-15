import axios from 'axios';
import { logoutRef } from "../context/usercontext.tsx";
import { toast } from "react-toastify";

const isLocalhost = window.location.hostname === "localhost";

const axiosInstance = axios.create({
  baseURL: isLocalhost
    ? "http://localhost:3001/api"
    : "https://vetcaretr.com/api",
});

// REQUEST
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// RESPONSE
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const status = error.response.status;
      const code = error.response.data?.code;
      const silentDemoBlocked = Boolean((error.config as any)?.silentDemoBlocked);

      // ⭐ DEMO USER BLOCK — bu işlem hiçbir yere gitmesin
      if (code === "DEMO_USER_BLOCKED") {
        if (!silentDemoBlocked) {
          toast.info("Demo hesabı ile bu işlemi yapamazsınız.");
        }
        return Promise.reject({ __demo_blocked: true });   // ❗ özel işaret
      }

      // ⭐ TOKEN EXPIRED
      if (status === 401 || status === 403) {
        toast.error("Oturumunuzun süresi doldu. Lütfen tekrar giriş yapın.");
        localStorage.clear();
        logoutRef();
        window.location.href = "/login";
        return Promise.reject({ __auth_error: true });
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
