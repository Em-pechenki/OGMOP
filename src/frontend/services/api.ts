import axios, { AxiosError, AxiosInstance } from "axios";
import { isMockMode, mockRequest } from "@frontend/services/mockBackend";

const BASE_URL =
  (import.meta as { env?: { VITE_API_URL?: string } }).env?.VITE_API_URL ||
  "http://localhost:3001";

const realApi: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

realApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("ogmop_token");
  if (token) {
    config.headers = config.headers || {};
    (config.headers as Record<string, string>).Authorization = `Bearer ${token}`;
  }
  return config;
});

realApi.interceptors.response.use(
  (res) => res,
  (err: AxiosError) => {
    const message =
      (err.response?.data as { error?: string } | undefined)?.error ||
      err.message ||
      "Network error";
    return Promise.reject(new Error(message));
  }
);

// Unified api object: uses mock backend on GitHub Pages (no server)
const mockMode = isMockMode();

function toAxiosResponse(data: any, status = 200) {
  return { data, status, statusText: "OK", headers: {}, config: {} as any };
}

export const api: any = mockMode
  ? {
      get: async (url: string, config?: any) => {
        const res = await mockRequest("GET", url, undefined, config?.params);
        return toAxiosResponse(res.data, res.status || 200);
      },
      post: async (url: string, body?: any) => {
        const res = await mockRequest("POST", url, body);
        return toAxiosResponse(res.data, res.status || 200);
      },
      put: async (url: string, body?: any) => {
        const res = await mockRequest("PUT", url, body);
        return toAxiosResponse(res.data, res.status || 200);
      },
      patch: async (url: string, body?: any) => {
        const res = await mockRequest("PATCH", url, body);
        return toAxiosResponse(res.data, res.status || 200);
      },
      delete: async (url: string) => {
        const res = await mockRequest("DELETE", url);
        return toAxiosResponse(res.data, res.status || 200);
      },
    }
  : realApi;

export async function getHealth(): Promise<{ status: string; project: string }> {
  const res = await api.get("/api/health");
  return res.data;
}

export default api;