import { backendApi } from "./index.js";
import { handleRequest } from "./requestHandler.js";

// Guardian
export const getGuardiansByVIP = (vip_id) =>
  handleRequest(() => backendApi.get(`/guardian?vip_id=${vip_id}`));

export const getGuardianById = (guardian_id) =>
  handleRequest(() => backendApi.get(`/guardian/${guardian_id}`));

export const updateGuardian = (payload) =>
  handleRequest(() => backendApi.put(`/guardian/profile`, payload));

export const getMyProfile = () =>
  handleRequest(() => backendApi.get("/guardian/profile"));

export const getVIPs = () => handleRequest(() => backendApi.get("/vip"));

// VIP's
export const updateVIP = (deviceId, payload) =>
  handleRequest(() => backendApi.put(`/vip/${deviceId}`, payload));

export const deleteVIP = (deviceId) =>
  handleRequest(() => backendApi.delete(`/vip/${deviceId}`));

// Device
export const getDevices = () =>
  handleRequest(() => backendApi.get("/device/list"));

export const getDeviceGuardians = (deviceId) =>
  handleRequest(() => backendApi.get(`/device/${deviceId}/guardians`));

export const getAllDeviceGuardians = () =>
  handleRequest(() => backendApi.get(`/device/guardians`));

export const getPendingInvites = () =>
  handleRequest(() => backendApi.get(`/device/pending-invites`));

export const modifyGuardianRole = (deviceId, guardianId, payload) =>
  handleRequest(() =>
    backendApi.put(`/device/${deviceId}/guardians/${guardianId}/role`, payload)
  );

export const modifyGuardianRelationship = (deviceId, guardianId, payload) =>
  handleRequest(() =>
    backendApi.put(
      `/device/${deviceId}/guardians/${guardianId}/relationship`,
      payload
    )
  );

export const toggleEmergencyContact = (deviceId, guardianId) =>
  handleRequest(() =>
    backendApi.put(`/device/${deviceId}/guardians/${guardianId}/emergency`)
  );

export const removeGuardianFromDevice = (deviceId, guardianId) =>
  handleRequest(() =>
    backendApi.delete(`/device/${deviceId}/guardians/${guardianId}`)
  );

export const assignVipToDevice = (deviceId, payload) =>
  handleRequest(() => backendApi.post(`/device/vip/${deviceId}`, payload));

export const pairDevice = (payload) =>
  handleRequest(() => backendApi.post("/device/pair", payload));

export const unpairDevice = (deviceId) =>
  handleRequest(() => backendApi.post(`/device/unpair/${deviceId}`));

export const updateDeviceName = (deviceId, payload) =>
  handleRequest(() => backendApi.put(`/device/${deviceId}/name`, payload));

export const updateDeviceLastActive = (deviceId, payload) =>
  handleRequest(() =>
    backendApi.put(`/device/${deviceId}/last_active_at`, payload)
  );

export const validateDeviceSerial = (serial_number) =>
  handleRequest(() =>
    backendApi.get(`/device/validate?device_serial=${serial_number}`)
  );

//OTP's
// Registration OTP:
export const sendRegistrationOTP = (email) =>
  handleRequest(() =>
    backendApi.post("/auth/send-otp", { email, purpose: "registration" })
  );

export const verifyRegistrationOTP = (email, otp_code) =>
  handleRequest(() =>
    backendApi.post("/auth/verify-otp", {
      email,
      otp_code,
      purpose: "registration"
    })
  );

export const inviteGuardianLink = (deviceId, payload) =>
  handleRequest(() =>
    backendApi.post(`/device/${deviceId}/invite-guardian`, payload)
  );

export const verifyGuardianInvite = (token) =>
  handleRequest(() => backendApi.get(`/device/accept-invite/${token}`));

export const decodeInviteToken = (token) =>
  handleRequest(() => backendApi.get(`/device/decode-invite/${token}`));

// Change Email
export const requestEmailChangeOTP = (new_email) =>
  handleRequest(() =>
    backendApi.post("/auth/profile/change-email/request", { new_email })
  );

export const verifyEmailChangeOTP = (new_email, otp_code) =>
  handleRequest(() =>
    backendApi.post("/auth/profile/change-email/verify", {
      new_email,
      otp_code
    })
  );

// Forgot Password
export const forgotPasswordRequest = (email) =>
  handleRequest(() =>
    backendApi.post("/auth/forgot-password/request", { email })
  );

export const verifyForgotPasswordOTP = (email, otp_code) =>
  handleRequest(() =>
    backendApi.post("/auth/forgot-password/verify", { email, otp_code })
  );

export const resetPassword = (email, new_password) =>
  handleRequest(() =>
    backendApi.post("/auth/forgot-password/reset", { email, new_password })
  );

export const uploadProfileImage = (imageFile) => {
  const formData = new FormData();
  formData.append("image", imageFile);

  return handleRequest(() =>
    backendApi.post("/guardian/profile/image", formData, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    })
  );
};

// Upload/Retreive VIP img
export const uploadVIPImage = (vipId, imageFile) => {
  const formData = new FormData();
  formData.append("image", imageFile);

  return handleRequest(() =>
    backendApi.post(`/vip/${vipId}/image`, formData, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    })
  );
};

// account history
export const getAccountHistory = () =>
  handleRequest(() => backendApi.get("/guardian/history"));