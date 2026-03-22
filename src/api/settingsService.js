import { middlewareApi } from "./index.js";
import { handleRequest } from "./requestHandler.js";

export const getGuardianSettings = (guardianId) =>
  handleRequest(() => middlewareApi.get(`/guardian/${guardianId}/settings`));

export const updateGuardianSettings = (guardianId, payload) =>
  handleRequest(() =>
    middlewareApi.put(`/guardian/${guardianId}/settings`, payload)
  );
