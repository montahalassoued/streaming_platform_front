import axios from "axios";

export const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export const api = axios.create({ baseURL: API_BASE });

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("access_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err?.response?.status === 401 && typeof window !== "undefined") {
      // token invalid; let caller handle redirect
    }
    return Promise.reject(err);
  },
);
