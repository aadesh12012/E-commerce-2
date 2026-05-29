import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "https://e-commerce-2-backend-omws.onrender.com",
  withCredentials: true,
});

export default api;

