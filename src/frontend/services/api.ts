import axios, { AxiosError, AxiosInstance } from "axios";

const BASE_URL =
  (import.meta as { env?: { VITE_API_URL?: string } }).env?.VITE_API_URL ||
  "http://localhost:3001";

export const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("ogmop_token");
  if (token) {
    config.headers = config.headers || {};
    (config.headers as Record<string, string>).Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err: AxiosError) => {
    const message =
      (err.response?.data as { error?: string } | undefined)?.error ||
      err.message ||
      "Неизвестная ошибка";
    return Promise.reject(new Error(message));
  }
);

export async function getHealth(): Promise<{ status: string; project: string }> {
  const res = await api.get("/api/health");
  return res.data;
}

export default api;