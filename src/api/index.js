import axios from "axios";

const BASE_URL =
  import.meta.env.VITE_BACKEND_API_URL || "http://localhost:5000/api";

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

const refreshApi = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" }
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};

backendApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes("/auth/refresh")
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: () => resolve(backendApi(originalRequest)),
            reject
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await refreshApi.post("/auth/refresh");
        processQueue();
        return backendApi(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        window.location.replace("/login");
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
