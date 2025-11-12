const BASE_URL = "https://psgc.gitlab.io/api";

const mapOptions = (collection) =>
  collection.map((item) => ({
    value: item.code,
    label: item.name
  }));

export const getRegions = async () => {
  const response = await fetch(`${BASE_URL}/regions/`);
  if (!response.ok) {
    throw new Error("Failed to fetch regions");
  }
  const data = await response.json();
  return mapOptions(data);
};

export const getProvincesByRegion = async (regionCode) => {
  const response = await fetch(`${BASE_URL}/regions/${regionCode}/provinces/`);
  if (!response.ok) {
    throw new Error("Failed to fetch provinces");
  }
  const data = await response.json();
  return mapOptions(data);
};

export const getCitiesByProvince = async (provinceCode) => {
  const response = await fetch(
    `${BASE_URL}/provinces/${provinceCode}/cities-municipalities/`
  );
  if (!response.ok) {
    throw new Error("Failed to fetch cities/municipalities");
  }
  const data = await response.json();
  return mapOptions(data);
};

export const getBarangaysByCity = async (cityCode) => {
  const response = await fetch(
    `${BASE_URL}/cities-municipalities/${cityCode}/barangays/`
  );
  if (!response.ok) {
    throw new Error("Failed to fetch barangays");
  }
  const data = await response.json();
  return mapOptions(data);
};
