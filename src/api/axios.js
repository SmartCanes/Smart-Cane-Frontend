import axios from "axios";

// Set the backend URL
const API_URL = "http://127.0.0.1:5000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json"
  }
});

export default api;
