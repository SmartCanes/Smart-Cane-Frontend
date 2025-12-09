import { api } from "./index.js";
import { handleRequest } from "./requestHandler.js";

const BASE_URL = "https://psgc.gitlab.io/api";
const LOCAL_STORAGE_KEY = "locationData";

export const fetchLocationOptions = async () => {
  const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (cached) {
    return JSON.parse(cached);
  }

  try {
    const NCR_REGION_CODE = "130000000";
    const citiesRes = await api.get(
      `${BASE_URL}/regions/${NCR_REGION_CODE}/cities/`
    );
    const cities = Array.isArray(citiesRes.data)
      ? citiesRes.data
      : citiesRes.data.data;

    // Fetch barangays for each city
    const barangayRequests = cities.map((city) => {
      const cityCode = city.code || city.cityCode;
      return api.get(`${BASE_URL}/cities/${cityCode}/barangays/`);
    });

    const barangaysResponses = await Promise.all(barangayRequests);

    const grouped = cities.map((city, index) => {
      const cityCode = city.code || city.cityCode;
      const cityName = city.name || city.cityName;

      const barangaysArray = Array.isArray(barangaysResponses[index].data)
        ? barangaysResponses[index].data
        : barangaysResponses[index].data.data;

      return {
        cityCode,
        cityName,
        barangays: barangaysArray.map((b) => ({
          value: b.code,
          label: b.name,
          villages: []
        }))
      };
    });

    const locationData = {
      provinces: [
        { value: NCR_REGION_CODE, label: "Metro Manila" }
        // Add other provinces if needed
      ],
      citiesByProvince: {
        [NCR_REGION_CODE]: grouped.map((c) => ({
          value: c.cityCode,
          label: c.cityName
        }))
      },
      barangaysByCity: grouped.reduce((acc, c) => {
        acc[c.cityCode] = c.barangays;
        return acc;
      }, {})
    };

    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(locationData));
    return locationData;
  } catch (error) {
    console.error("Failed to fetch locations:", error);
    return { provinces: [], citiesByProvince: {}, barangaysByCity: {} };
  }
};

export const getLocation = (query) =>
  handleRequest(async () => {
    const res = await api.get(
      `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=5&bbox=116.87,4.59,126.6,21.21`
    );
    return res;
  });
