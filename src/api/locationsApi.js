import { api } from "./index.js";
import { handleRequest } from "./requestHandler.js";

const BASE_URL = "https://psgc.gitlab.io/api";

const mapOptions = (collection) =>
  collection.map((item) => ({
    value: item.code,
    label: item.name
  }));

export const getRegions = () =>
  handleRequest(async () => {
    const data = await api.get(`${BASE_URL}/regions/`);
    return mapOptions(data);
  });

export const getProvincesByRegion = (regionCode) =>
  handleRequest(async () => {
    const data = await api.get(`${BASE_URL}/regions/${regionCode}/provinces/`);
    return mapOptions(data);
  });

export const getCitiesByProvince = (provinceCode) =>
  handleRequest(async () => {
    const data = await api.get(
      `${BASE_URL}/provinces/${provinceCode}/cities-municipalities/`
    );
    return mapOptions(data);
  });

export const getBarangaysByCity = (cityCode) =>
  handleRequest(async () => {
    const data = await api.get(
      `${BASE_URL}/cities-municipalities/${cityCode}/barangays/`
    );
    return mapOptions(data);
  });

export const getLocation = (query) =>
  handleRequest(async () => {
    const data = await api.get(
      `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=5&bbox=116.87,4.59,126.6,21.21`
    );
    return data;
  });
