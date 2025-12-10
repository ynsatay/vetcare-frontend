const hostname = window.location.hostname;

const isLocal =
  hostname === "localhost" ||
  hostname === "127.0.0.1" ||
  hostname === "";

export const BASE_URL = isLocal
  ? "http://localhost:3001/api"
  : "https://vetcaretr.com/api";
