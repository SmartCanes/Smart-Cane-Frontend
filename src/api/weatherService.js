// src/api/WeatherService.js
import i18n from "@/i18n";

export const DEFAULT_LOCATION = {
  lat: 14.7218,
  lon: 121.0512,
  name: "Novaliches"
};

const BASE_URL = "https://api.open-meteo.com/v1/forecast";
const GEO_URL = "https://geocoding-api.open-meteo.com/v1/search";

// Helper for determining if a weather code indicates rain (for alerts and recommendations)
const RAIN_CODES = [
  51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99
];
const STORM_CODES = [95, 96, 99];
const STRONG_WIND_THRESHOLD = 35;
const t = (key, options) => i18n.t(key, { ns: "pages", ...options });

const resolveWeatherLocale = (language) => {
  const lang = language || i18n.resolvedLanguage || i18n.language || "en";
  if (lang.startsWith("tl")) return "tl-PH";
  if (lang.startsWith("ceb")) return "en-PH";
  return "en-US";
};

// 0. Search locations via Open-Meteo Geocoding API
export const searchLocations = async (query) => {
  if (!query || query.trim().length < 2) return [];
  try {
    const locale = resolveWeatherLocale();
    const geocodingLang = locale.startsWith("tl") ? "tl" : "en";
    const res = await fetch(
      `${GEO_URL}?name=${encodeURIComponent(query.trim())}&count=12&language=${geocodingLang}&format=json&countryCode=PH`
    );
    if (!res.ok) throw new Error("Geocoding failed");
    const data = await res.json();
    return (data.results || [])
      .filter((r) => r.country_code === "PH" || r.country === "Philippines")
      .slice(0, 6)
      .map((r) => ({
        id: r.id,
        name: r.name,
        display: [r.name, r.admin1, r.country].filter(Boolean).join(", "),
        lat: r.latitude,
        lon: r.longitude
      }));
  } catch (err) {
    console.error("Geocoding error:", err);
    return [];
  }
};

// 1. EXISTING: For RecentAlert (Current Weather)
export const fetchWeatherAlert = async () => {
  try {
    const response = await fetch(
      `${BASE_URL}?latitude=${DEFAULT_LOCATION.lat}&longitude=${DEFAULT_LOCATION.lon}&current_weather=true`
    );
    if (!response.ok) throw new Error("Failed to fetch current weather");
    const data = await response.json();

    const code = data.current_weather.weathercode;
    const isRaining = RAIN_CODES.includes(code);
    const temp = Math.round(data.current_weather.temperature);

    return {
      isRaining,
      temp,
      title: isRaining
        ? t("weatherService.alertTitle")
        : t("weatherService.updateTitle"),
      message: isRaining
        ? t("weatherService.rainInLocation", { location: DEFAULT_LOCATION.name })
        : t("weatherService.clearSkies", {
            location: DEFAULT_LOCATION.name,
            temp
          })
    };
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const fetchImportantWeatherAlert = async (
  lat = DEFAULT_LOCATION.lat,
  lon = DEFAULT_LOCATION.lon,
  locationName = DEFAULT_LOCATION.name
) => {
  try {
    const response = await fetch(
      `${BASE_URL}?latitude=${lat}&longitude=${lon}&current=temperature_2m,weathercode,wind_speed_10m&timezone=auto&forecast_days=1`
    );

    if (!response.ok)
      throw new Error("Failed to fetch important weather alert");

    const data = await response.json();
    const code = data.current?.weathercode;
    const temp = Math.round(data.current?.temperature_2m ?? 0);
    const windSpeed = Math.round(data.current?.wind_speed_10m ?? 0);

    const isStorm = STORM_CODES.includes(code);
    const isRain = RAIN_CODES.includes(code);
    const isWindy = windSpeed >= STRONG_WIND_THRESHOLD;

    if (!isStorm && !isRain && !isWindy) {
      return null;
    }

    const roundedLat = Number(lat).toFixed(2);
    const roundedLon = Number(lon).toFixed(2);

    if (isStorm) {
      return {
        type: "storm",
        temp,
        windSpeed,
        locationName,
        dedupeKey: `weather:${roundedLat}:${roundedLon}:storm`
      };
    }

    if (isRain) {
      return {
        type: "rain",
        temp,
        windSpeed,
        locationName,
        dedupeKey: `weather:${roundedLat}:${roundedLon}:rain`
      };
    }

    return {
      type: "wind",
      temp,
      windSpeed,
      locationName,
      dedupeKey: `weather:${roundedLat}:${roundedLon}:wind`
    };
  } catch (error) {
    console.error("Important weather alert error:", error);
    return null;
  }
};

// Helper: describe a weather code as short text
export const getWeatherLabel = (code) => {
  if (code === 0) return t("weatherService.labels.clearSky");
  if (code === 1) return t("weatherService.labels.mainlyClear");
  if (code === 2) return t("weatherService.labels.partlyCloudy");
  if (code === 3) return t("weatherService.labels.overcast");
  if ([45, 48].includes(code)) return t("weatherService.labels.foggy");
  if ([51, 53, 55].includes(code)) return t("weatherService.labels.drizzle");
  if ([61, 63, 65].includes(code)) return t("weatherService.labels.rain");
  if ([71, 73, 75].includes(code)) return t("weatherService.labels.snowfall");
  if ([80, 81, 82].includes(code)) return t("weatherService.labels.rainShowers");
  if ([95, 96, 99].includes(code)) return t("weatherService.labels.thunderstorm");
  return t("weatherService.labels.overcast");
};

// Helper: icon + color for a weather code
export const getWeatherIcon = (code) => {
  if (RAIN_CODES.includes(code))
    return { icon: "solar:cloud-rain-bold-duotone", color: "text-blue-500" };
  if (code === 0 || code === 1)
    return { icon: "solar:sun-bold-duotone", color: "text-yellow-500" };
  if (code <= 3)
    return { icon: "solar:cloud-bold-duotone", color: "text-gray-400" };
  return { icon: "solar:sun-fog-bold-duotone", color: "text-yellow-500" };
};

// 3. Fetch weather details for a specific date (past or future)
export const fetchWeatherForDate = async (
  lat = DEFAULT_LOCATION.lat,
  lon = DEFAULT_LOCATION.lon,
  dateStr // "YYYY-MM-DD"
) => {
  try {
    const response = await fetch(
      `${BASE_URL}?latitude=${lat}&longitude=${lon}` +
        `&daily=weathercode,temperature_2m_max,temperature_2m_min,` +
        `apparent_temperature_max,sunrise,sunset,uv_index_max,` +
        `precipitation_probability_max,wind_speed_10m_max,precipitation_sum` +
        `&timezone=auto&start_date=${dateStr}&end_date=${dateStr}`
    );
    if (!response.ok) throw new Error("Failed to fetch date weather");
    const data = await response.json();
    if (!data.daily?.time?.length) return null;

    const d = data.daily;
    const code = d.weathercode[0];

    const formatTime = (isoString) => {
      if (!isoString) return "—";
      return new Date(isoString).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
      });
    };

    return {
      weatherCode: code,
      label: getWeatherLabel(code),
      ...getWeatherIcon(code),
      tempMax: Math.round(d.temperature_2m_max[0]),
      tempMin: Math.round(d.temperature_2m_min[0]),
      feelsLike: `${Math.round(d.apparent_temperature_max[0])}°C`,
      sunrise: formatTime(d.sunrise[0]),
      sunset: formatTime(d.sunset[0]),
      uvIndex: d.uv_index_max[0] ?? "—",
      precipProbability: `${d.precipitation_probability_max[0] ?? 0}%`,
      precipSum: `${(d.precipitation_sum[0] ?? 0).toFixed(1)} mm`,
      windMax: `${d.wind_speed_10m_max[0] ?? "—"} km/h`
    };
  } catch (err) {
    console.error("Date weather error:", err);
    return null;
  }
};

export const fetchFullWeatherForecast = async (
  lat = DEFAULT_LOCATION.lat,
  lon = DEFAULT_LOCATION.lon,
  language
) => {
  try {
    const locale = resolveWeatherLocale(language);
    // Request daily forecast: code, max temp, min temp, rain chance, sunrise, sunset, uv_index
    // Request current weather: temp, humidity, apparent_temp, pressure, wind_speed, visibility
    const response = await fetch(
      `${BASE_URL}?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,surface_pressure,wind_speed_10m,visibility,weathercode&daily=weathercode,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_probability_max&timezone=auto&forecast_days=14`
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
      if (c === 0) return t("weatherService.labels.clearSky");
      if (c <= 3) return t("weatherService.labels.partlyCloudy");
      if (RAIN_CODES.includes(c)) return t("weatherService.labels.rainyShowers");
      return t("weatherService.labels.overcast");
    };

    let recommendation = "";
    if (!canGoOutside) {
      recommendation = t("weatherService.recommendation.heavyRain");
    } else {
      // 0 = Clear sky, 1 = Mainly clear
      if (tomCode === 0 || tomCode === 1) {
        recommendation = t("weatherService.recommendation.sunny");
      }
      // 2 = Partly cloudy, 3 = Overcast
      else if (tomCode === 2 || tomCode === 3) {
        recommendation = t("weatherService.recommendation.cloudy");
      } else {
        recommendation = t("weatherService.recommendation.safeWalk");
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

    // --- 3. Two-Week Forecast (14 Days) ---
    const weekly = data.daily.time.map((time, index) => {
      const code = data.daily.weathercode[index];
      const max = Math.round(data.daily.temperature_2m_max[index]);
      const min = Math.round(data.daily.temperature_2m_min[index]);
      const date = new Date(time);
      const dayName = date.toLocaleDateString(locale, { weekday: "short" });
      const dateLabel = date.toLocaleDateString(locale, {
        month: "short",
        day: "numeric"
      });

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
        dateLabel,
        temp: `${Math.round((max + min) / 2)}°C`,
        tempMax: `${max}°C`,
        tempMin: `${min}°C`,
        weatherCode: code,
        label: getWeatherLabel(code),
        precipProbability: `${data.daily.precipitation_probability_max[index] ?? 0}%`,
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
