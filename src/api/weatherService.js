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

// 2. NEW: For WeatherBoard (Full Forecast)
export const fetchFullWeatherForecast = async () => {
  try {
    // Request daily forecast: code, max temp, min temp, rain chance, sunrise, sunset, uv_index
    // Request current weather: temp, humidity, apparent_temp, pressure, wind_speed, visibility
    const response = await fetch(
      `${BASE_URL}?latitude=${LOC_COORDS.lat}&longitude=${LOC_COORDS.lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,surface_pressure,wind_speed_10m,visibility,weathercode&daily=weathercode,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_probability_max&timezone=auto&forecast_days=7`
    );

    if (!response.ok) throw new Error("Failed to fetch forecast");

    const data = await response.json();

    // --- 1. Tomorrow's Forecast (Main Card) ---
    const tomorrowIndex = 1;
    const tomCode = data.daily.weathercode[tomorrowIndex];
    const tomTempMax = Math.round(data.daily.temperature_2m_max[tomorrowIndex]);
    const tomTempMin = Math.round(data.daily.temperature_2m_min[tomorrowIndex]);
    const tomPrecip = data.daily.precipitation_probability_max[tomorrowIndex];
    const tomDate = data.daily.time[tomorrowIndex];

    // Logic: Bawal lumabas kung Umuulan (RainCode) OR mataas ang chance ng ulan (>50%)
    const isRainingTom = RAIN_CODES.includes(tomCode);
    const highRainChanceTom = tomPrecip > 50;
    const canGoOutside = !isRainingTom && !highRainChanceTom;

    // Weather Description Helper
    const getWeatherDesc = (c) => {
      if (c === 0) return "Clear Sky";
      if (c <= 3) return "Partly Cloudy";
      if (RAIN_CODES.includes(c)) return "Rainy / Showers";
      return "Overcast";
    };

    let recommendation = "";
    if (!canGoOutside) {
      recommendation = "Heavy rain or showers expected tomorrow. Better to stay indoors.";
    } else {
      // 0 = Clear sky, 1 = Mainly clear
      if (tomCode === 0 || tomCode === 1) {
        recommendation = "It will be sunny tomorrow. Don't forget to bring an umbrella and stay hydrated.";
      } 
      // 2 = Partly cloudy, 3 = Overcast
      else if (tomCode === 2 || tomCode === 3) {
        recommendation = "It will be cloudy tomorrow. A good day for a walk.";
      } 
      else {
        recommendation = "Tomorrow looks safe for a walk. Use your iCane as usual.";
      }
    }

    const tomorrow = {
      date: tomDate,
      tempMax: tomTempMax,
      tempMin: tomTempMin,
      precipProbability: tomPrecip,
      description: getWeatherDesc(tomCode),
      canGoOutside,
      recommendation,
      weatherCode: tomCode // Add this to help with icon selection in UI
    };

    // --- 2. Today's Weather Details ---
    const current = data.current;
    const todayDaily = {
      sunrise: data.daily.sunrise[0],
      sunset: data.daily.sunset[0],
      uvIndex: data.daily.uv_index_max[0]
    };

    const formatTime = (isoString) => {
      if (!isoString) return "-----";
      const date = new Date(isoString);
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
      });
    };

    const today = {
      sunrise: formatTime(todayDaily.sunrise),
      sunset: formatTime(todayDaily.sunset),
      humidity: `${current.relative_humidity_2m}%`,
      wind: `${current.wind_speed_10m} km/h`,
      feelsLike: `${Math.round(current.apparent_temperature)}°C`,
      pressure: `${Math.round(current.surface_pressure)} hPa`,
      visibility: `${(current.visibility / 1000).toFixed(1)} km`,
      uvIndex: todayDaily.uvIndex
    };

    // --- 3. Weekly Forecast (7 Days) ---
    const weekly = data.daily.time.map((time, index) => {
      const code = data.daily.weathercode[index];
      const max = Math.round(data.daily.temperature_2m_max[index]);
      const min = Math.round(data.daily.temperature_2m_min[index]);
      const date = new Date(time);
      const dayName = date.toLocaleDateString("en-US", { weekday: "short" });

      // Determine icon based on weather code
      let icon = "solar:sun-fog-bold-duotone"; // Default
      let color = "text-yellow-500";

      if (RAIN_CODES.includes(code)) {
        icon = "solar:cloud-rain-bold-duotone";
        color = "text-blue-500";
      } else if (code > 3) {
        icon = "solar:cloud-bold-duotone";
        color = "text-gray-500";
      }

      return {
        day: dayName,
        temp: `${Math.round((max + min) / 2)}°C`,
        icon,
        color
      };
    });

    return { tomorrow, today, weekly };
  } catch (error) {
    console.error("Forecast Error:", error);
    return null;
  }
};
