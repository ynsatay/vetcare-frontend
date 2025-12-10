const hostname = window.location.hostname;

// Log ekledik
console.log("Current Hostname:", hostname);

const isLocal =
  hostname === "localhost" ||
  hostname === "127.0.0.1" ||
  hostname === "";

// Local kontrol logu
console.log("isLocal:", isLocal);

export const BASE_URL = isLocal
  ? "http://localhost:3001/api"
  : "https://vetcaretr.com/api";

// Sonuç olarak hangi URL kullanılıyor onu da logla
console.log("BASE_URL:", BASE_URL);
