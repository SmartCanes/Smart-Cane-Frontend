// src/api/WeatherService.js

// 📍 CENTRALIZED COORDINATES (Assisi St, Novaliches)
// Ito ang gagamitin ng both RecentAlert at WeatherBoard para synchronize.
const LOC_COORDS = {
  lat: 14.7218,
  lon: 121.0512
};

const BASE_URL = "https://api.open-meteo.com/v1/forecast";

// Helper: List ng Weather Codes na bawal lumabas (Ulan/Bagyo)
const RAIN_CODES = [
  51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99
];

// 1. EXISTING: For RecentAlert (Current Weather)
export const fetchWeatherAlert = async () => {
  try {
    const response = await fetch(
      `${BASE_URL}?latitude=${LOC_COORDS.lat}&longitude=${LOC_COORDS.lon}&current_weather=true`
    );
    if (!response.ok) throw new Error("Failed to fetch current weather");
    const data = await response.json();

    const code = data.current_weather.weathercode;
    const isRaining = RAIN_CODES.includes(code);
    const temp = Math.round(data.current_weather.temperature);

    return {
      isRaining,
      temp,
      title: isRaining ? "Weather alert" : "Weather update",
      message: isRaining
        ? "Rain expected / Raining in Assisi St."
        : `Clear skies in Assisi St. (${temp}°C)`
    };
  } catch (error) {
    console.error(error);
    return null;
  }
};

// 2. NEW: For WeatherBoard (Tomorrow's Forecast)
export const fetchTomorrowForecast = async () => {
  try {
    // Request daily forecast: code, max temp, min temp, rain chance
    const response = await fetch(
      `${BASE_URL}?latitude=${LOC_COORDS.lat}&longitude=${LOC_COORDS.lon}&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto`
    );

    if (!response.ok) throw new Error("Failed to fetch forecast");

    const data = await response.json();

    // Note: Index 0 = Today, Index 1 = Tomorrow
    const tomorrowIndex = 1;

    const code = data.daily.weathercode[tomorrowIndex];
    const tempMax = Math.round(data.daily.temperature_2m_max[tomorrowIndex]);
    const tempMin = Math.round(data.daily.temperature_2m_min[tomorrowIndex]);
    const precipProb = data.daily.precipitation_probability_max[tomorrowIndex];
    const dateStr = data.daily.time[tomorrowIndex];

    // Logic: Bawal lumabas kung Umuulan (RainCode) OR mataas ang chance ng ulan (>50%)
    const isRaining = RAIN_CODES.includes(code);
    const highRainChance = precipProb > 50;
    const canGoOutside = !isRaining && !highRainChance;

    // Weather Description Helper
    const getWeatherDesc = (c) => {
      if (c === 0) return "Clear Sky";
      if (c <= 3) return "Partly Cloudy";
      if (RAIN_CODES.includes(c)) return "Rainy / Showers";
      return "Overcast";
    };

    return {
      date: dateStr,
      tempMax,
      tempMin,
      precipProbability: precipProb,
      description: getWeatherDesc(code),
      canGoOutside, // Ito ang gagamitin ng UI para sa Green/Red status
      recommendation: canGoOutside
        ? "Tomorrow looks safe for a walk. Use your iCane as usual."
        : "Heavy rain or showers expected tomorrow. Better to stay indoors."
    };
  } catch (error) {
    console.error("Forecast Error:", error);
    return null;
  }
};
