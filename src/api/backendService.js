import { backendApi } from "./index.js";
import { handleRequest } from "./requestHandler.js";

// Guardian
export const getGuardiansByVIP = (vip_id) =>
  handleRequest(() => backendApi.get(`/guardian?vip_id=${vip_id}`));

export const getGuardianById = (guardian_id) =>
  handleRequest(() => backendApi.get(`/guardian/${guardian_id}`));

export const updateGuardian = (guardian_id, payload) =>
  handleRequest(() => backendApi.put(`/guardian/${guardian_id}`, payload));

// VIP
export const getVIPs = () => handleRequest(() => backendApi.get("/vip"));

export const getVIPById = (id) =>
  handleRequest(() => backendApi.get(`/vip/${id}`));

export const createVIP = (payload) =>
  handleRequest(() => backendApi.post("/vip", payload));
