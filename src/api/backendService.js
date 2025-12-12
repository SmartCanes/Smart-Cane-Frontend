import { backendApi } from "./index.js";
import { handleRequest } from "./requestHandler.js";

// Guardian
export const getGuardiansByVIP = (vip_id) =>
  handleRequest(() => backendApi.get(`/guardian?vip_id=${vip_id}`));

export const getGuardianById = (guardian_id) =>
  handleRequest(() => backendApi.get(`/guardian/${guardian_id}`));

export const updateGuardian = (payload) =>
  handleRequest(() => backendApi.put(`/guardian/profile/`, payload));

export const getMyProfile = () =>
  handleRequest(() => backendApi.get("/guardian/profile/"));

// VIP
export const getVIPs = () => handleRequest(() => backendApi.get("/vip"));

export const getVIPById = (id) =>
  handleRequest(() => backendApi.get(`/vip/${id}`));

export const createVIP = (payload) =>
  handleRequest(() => backendApi.post("/vip", payload));

// Device
export const pairDevice = (payload) =>
  handleRequest(() => backendApi.post("/device/pair", payload));

export const validateDeviceSerial = (serial_number) =>
  handleRequest(() =>
    backendApi.get(`/device/validate?device_serial=${serial_number}`)
  );
