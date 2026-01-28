import axios from "axios";

const BASE_URL =
  import.meta.env.VITE_BACKEND_API_URL || "http://localhost:5000/api";

const WS_URL =
  import.meta.env.VITE_MIDDLEWARE_WS_URL || "http://localhost:3000";

if (!BASE_URL) {
  throw new Error("VITE_BACKEND_API_URL is not defined");
}

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" }
});

export const backendApi = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true
});

export const authCheckApi = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true
});

export const refreshApi = axios.create({
  baseURL: BASE_URL + "/auth",
  withCredentials: true,
  headers: { "Content-Type": "application/json" }
});

export const middlewareApi = axios.create({
  baseURL: WS_URL,
  headers: { "Content-Type": "application/json" }
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error = null) => {
  failedQueue.forEach((prom) => (error ? prom.reject(error) : prom.resolve()));
  failedQueue = [];
};

import { useUserStore } from "@/stores/useStore";

backendApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => backendApi(originalRequest));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await refreshApi.post("/refresh");
        processQueue();
        return backendApi(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        useUserStore.getState().clearUser();
        window.location.replace("/login");
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);
