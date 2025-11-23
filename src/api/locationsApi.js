import { api } from "./http";
const BASE_URL = "https://psgc.gitlab.io/api";

const mapOptions = (collection) =>
  collection.map((item) => ({
    value: item.code,
    label: item.name
  }));

export const getRegions = async () => {
  try {
    const { data } = await api.get(`${BASE_URL}/regions/`);
    return mapOptions(data);
  } catch (err) {
    console.error("Failed to fetch regions", err);
    throw err;
  }
};

export const getProvincesByRegion = async (regionCode) => {
  try {
    const { data } = await api.get(
      `${BASE_URL}/regions/${regionCode}/provinces/`
    );
    return mapOptions(data);
  } catch (err) {
    console.error("Failed to fetch provinces", err);
    throw err;
  }
};

export const getCitiesByProvince = async (provinceCode) => {
  try {
    const { data } = await api.get(
      `${BASE_URL}/provinces/${provinceCode}/cities-municipalities/`
    );
    return mapOptions(data);
  } catch (err) {
    console.error("Failed to fetch cities/municipalities", err);
    throw err;
  }
};

export const getBarangaysByCity = async (cityCode) => {
  try {
    const { data } = await api.get(
      `${BASE_URL}/cities-municipalities/${cityCode}/barangays/`
    );
    return mapOptions(data);
  } catch (err) {
    console.error("Failed to fetch barangays", err);
    throw err;
  }
};

export const getLocation = async (query) => {
  try {
    const { data } = await api.get(
      `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=5&bbox=116.87,4.59,126.6,21.21`
    );
    return data;
  } catch (err) {
    console.error("Failed to fetch location", err);
    throw err;
  }
};
