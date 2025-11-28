import { api } from ".";
import { handleRequest } from "./requestHandler";

export const loginApi = (username, password) =>
  handleRequest(() => api.post("/auth/login", { username, password }));

export const registerApi = (payload) =>
  handleRequest(() => api.post("/auth/register", payload));

export const checkCredentialsApi = (payload) =>
  handleRequest(() => api.post("/auth/check-credentials", payload));

export const verifyTokenApi = (token) =>
  handleRequest(() =>
    api.get("/auth/verify-token", {
      headers: { Authorization: `Bearer ${token}` }
    })
  );

export const sendOTPApi = (email) =>
  handleRequest(() => api.post("/auth/send-otp", { email }));

export const verifyOTPApi = (email, otp_code) =>
  handleRequest(() => api.post("/auth/verify-otp", { email, otp_code }));
