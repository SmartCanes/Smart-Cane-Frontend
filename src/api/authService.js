import { authCheckApi } from ".";
import { handleRequest } from "./requestHandler";

export const loginApi = (payload) =>
  handleRequest(() => authCheckApi.post("/auth/login", payload));

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

export const forgotPasswordApi = (email) =>
  handleRequest(() =>
    authCheckApi.post("/auth/forgot-password/request", { email })
  );

export const forgotPasswordVerifyApi = (email, otp_code) =>
  handleRequest(() =>
    authCheckApi.post("/auth/forgot-password/verify", {
      email,
      otp_code
    })
  );

export const forgotPasswordResetApi = (email, new_password, confirm_password) =>
  handleRequest(() =>
    authCheckApi.post("/auth/forgot-password/reset", {
      email,
      new_password,
      confirm_password
    })
  );
