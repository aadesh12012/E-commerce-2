import axios from "axios";

// Get API base URL from environment variables or use default
const baseURL = import.meta.env.VITE_API_BASE_URL || "https://e-commerce-2-backend-omws.onrender.com";

console.log("API Base URL:", baseURL);
console.log("Environment:", import.meta.env.MODE);

const api = axios.create({
  baseURL,
  withCredentials: true,  // Always send cookies for authentication
  timeout: 30000,         // 30 second timeout
});

// Request interceptor to add any additional headers
api.interceptors.request.use(
  (config) => {
    // Add request logging in development
    if (import.meta.env.DEV) {
      console.log(`📤 ${config.method.toUpperCase()} ${config.url}`);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    if (import.meta.env.DEV) {
      console.log(`📥 Response from ${response.config.url}:`, response.status);
    }
    return response;
  },
  (error) => {
    // Handle auth errors
    if (error.response?.status === 401) {
      console.warn("⚠️ Unauthorized - redirecting to login");
      localStorage.removeItem("user");
      // Optionally redirect to login page
      window.location.href = "/";
    }

    // Handle CORS errors
    if (error.message === "Network Error" && !error.response) {
      console.error("❌ Network error - CORS or connection issue");
    }

    return Promise.reject(error);
  }
);

export default api;

