import axios from "axios";

// Set the backend URL
const BACKEND_URL =
  import.meta.env.VITE_BACKEND_API_URL || "http://127.0.0.1:5000/api";

export const backendApi = axios.create({
  baseURL: BACKEND_URL,
  headers: {
    "Content-Type": "application/json"
  }
});

export const api = axios.create({
  headers: {
    "Content-Type": "application/json"
  }
});
