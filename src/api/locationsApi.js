import { api } from "./index.js";
import { handleRequest } from "./requestHandler.js";

const BASE_URL = "https://psgc.gitlab.io/api";

const mapOptions = (collection) => {
  if (!Array.isArray(collection)) {
    console.warn("mapOptions expects an array but got:", collection);
    return [];
  }
  return collection.map((item) => ({
    value: item.code,
    label: item.name,
    ...item
  }));
};

export const fetchMetroManila = () =>
  handleRequest(async () => {
    const NCR_REGION_CODE = "130000000";

    // Fetch cities/municipalities in NCR
    const citiesRes = await api.get(
      `${BASE_URL}/regions/${NCR_REGION_CODE}/provinces/`
    );

    // Provinces in NCR (usually just "Metro Manila" as a province)
    const provinces = mapOptions(citiesRes.data);

    // For each province, fetch its cities/municipalities
    const citiesPromises = provinces.map((prov) =>
      api.get(`${BASE_URL}/provinces/${prov.value}/cities-municipalities/`)
    );

    const citiesResults = await Promise.all(citiesPromises);

    const cities = citiesResults.flatMap((res) => mapOptions(res.data));

    // Fetch barangays for all cities
    const barangaysPromises = cities.map((city) =>
      api.get(`${BASE_URL}/cities-municipalities/${city.value}/barangays/`)
    );

    const barangaysResults = await Promise.all(barangaysPromises);
    const barangays = barangaysResults.flatMap((res) => mapOptions(res.data));

    return {
      region: {
        value: NCR_REGION_CODE,
        label: "National Capital Region (NCR)"
      },
      provinces,
      cities,
      barangays
    };
  });

export const getLocation = (query) =>
  handleRequest(async () => {
    const res = await api.get(
      `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=5&bbox=116.87,4.59,126.6,21.21`
    );
    return res;
  });
