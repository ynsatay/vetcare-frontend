const isLocal = window.location.hostname === "localhost";

export const BASE_URL = isLocal
  ? "http://localhost:3001/api"
  : "https://vetcaretr.com/api";
