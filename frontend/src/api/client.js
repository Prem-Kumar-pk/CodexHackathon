import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:4000/api",
  timeout: 20000
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("supportHubToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export function getSocketUrl() {
  return import.meta.env.VITE_SOCKET_URL || "http://localhost:4000";
}
