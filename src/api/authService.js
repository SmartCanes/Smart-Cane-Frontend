import { authCheckApi } from ".";
import { handleRequest } from "./requestHandler";

export const loginApi = (username, password) =>
  handleRequest(() => authCheckApi.post("/auth/login", { username, password }));

export const logoutApi = () =>
  handleRequest(() => authCheckApi.post("/auth/logout"));

export const registerApi = (payload) =>
  handleRequest(() => authCheckApi.post("/auth/register", payload));

export const verifyAuthApi = () =>
  handleRequest(() =>
    authCheckApi.get("/auth/verify-token", { withCredentials: true })
  );

export const checkCredentialsApi = (payload) =>
  handleRequest(() => authCheckApi.post("/auth/check-credentials", payload));

export const sendOTPApi = (email) =>
  handleRequest(() => authCheckApi.post("/auth/send-otp", { email }));

export const verifyOTPApi = (email, otp_code) =>
  handleRequest(() =>
    authCheckApi.post("/auth/verify-otp", { email, otp_code })
  );
