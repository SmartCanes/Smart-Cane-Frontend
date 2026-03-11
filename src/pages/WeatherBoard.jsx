import { useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "@iconify/react";

import {
  DEFAULT_LOCATION,
  fetchFullWeatherForecast,
  searchLocations
} from "@/api/weatherService";

const WeatherBoard = () => {
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedForecastDay, setSelectedForecastDay] = useState(null);

  // Location search state
  const [location, setLocation] = useState(DEFAULT_LOCATION);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const searchRef = useRef(null);
  const debounceRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Debounced geocoding search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSearchResults([]);
      setIsDropdownOpen(false);
      return;
    }
    setIsSearching(true);
    debounceRef.current = setTimeout(async () => {
      const results = await searchLocations(searchQuery);
      setSearchResults(results);
      setIsDropdownOpen(results.length > 0);
      setIsSearching(false);
    }, 400);
    return () => clearTimeout(debounceRef.current);
  }, [searchQuery]);

  const handleSelectLocation = (result) => {
    setLocation({ lat: result.lat, lon: result.lon, name: result.display });
    setSearchQuery("");
    setSearchResults([]);
    setIsDropdownOpen(false);
  };

  const handleUseDefaultLocation = () => {
    setLocation(DEFAULT_LOCATION);
    setSearchQuery("");
    setSearchResults([]);
    setIsDropdownOpen(false);
  };

  const closeForecastModal = () => setSelectedForecastDay(null);

  useEffect(() => {
    let isMounted = true;
    const loadForecast = async () => {
      setLoading(true);

      const data = await fetchFullWeatherForecast(location.lat, location.lon);

      if (isMounted && data) {
        setForecast(data);
        setLoading(false);

        if (!data.tomorrow.canGoOutside) {
          // triggerSmartCaneNotification(
          //   "WEATHER",
          //   `Warning: ${data.tomorrow.recommendation}`
          // );
        }
      }
    };
    loadForecast();
    return () => {
      isMounted = false;
    };
  }, [location]);

  // Format Date Logic
  const formattedDate = useMemo(() => {
    if (!forecast?.tomorrow?.date) return "";
    const dateValue = new Date(forecast.tomorrow.date);
    return dateValue.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric"
    });
  }, [forecast]);

  // Visuals Logic
  const visuals = useMemo(() => {
    if (!forecast?.tomorrow) return {};

    let mainIcon = "solar:sun-fog-bold-duotone";
    let buttonLabel = "Safe to Walk";
    if (!forecast.tomorrow.canGoOutside) {
      mainIcon = "solar:cloud-rain-bold-duotone";
      buttonLabel = "Stay Indoors";
    } else {
      // 0, 1: Sunny
      if (
        forecast.tomorrow.weatherCode === 0 ||
        forecast.tomorrow.weatherCode === 1
      ) {
        mainIcon = "solar:sun-bold-duotone";
      }
      // 2, 3: Cloudy
      else if (
        forecast.tomorrow.weatherCode === 2 ||
        forecast.tomorrow.weatherCode === 3
      ) {
        mainIcon = "solar:cloud-bold-duotone";
      }
    }

    return {
      mainIcon,
      buttonLabel
    };
  }, [forecast]);

  return (
    <main className="bg-white md:bg-[#f9fafb] rounded-t-[32px] md:rounded-none min-h-[calc(100vh-var(--header-height)-var(--mobile-nav-height))] md:min-h-[calc(100vh-var(--header-height))] md:max-h-[calc(100vh-var(--header-height))] overflow-y-visible md:overflow-y-auto p-6 pb-[calc(var(--mobile-nav-height)+1.5rem)] md:pb-6">
      <div className="mx-auto space-y-6 min-h-full">
        <div data-tour="tour-weather-main">
          <h1 className="text-2xl font-bold text-[#11285A] mb-1">
            Weather Forecast
          </h1>
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <Icon icon="carbon:location-filled" />
            <span>{location.name}</span>
          </div>
        </div>

        {/* LOCATION SEARCH BAR */}
        <div data-tour="tour-weather-search" ref={searchRef} className="relative space-y-2 md:max-w-xl">
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2.5 shadow-sm focus-within:ring-2 focus-within:ring-blue-400 focus-within:border-blue-400 transition-all">
            <Icon
              icon="carbon:search"
              className="text-gray-400 text-lg shrink-0"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() =>
                searchResults.length > 0 && setIsDropdownOpen(true)
              }
              placeholder="Search a city or place in the Philippines..."
              className="flex-1 bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400"
            />
            {isSearching && (
              <Icon
                icon="eos-icons:loading"
                className="text-gray-400 animate-spin shrink-0"
              />
            )}
            {searchQuery && !isSearching && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setIsDropdownOpen(false);
                }}
                className="text-gray-400 hover:text-gray-600 shrink-0"
              >
                <Icon icon="ph:x-bold" className="text-sm" />
              </button>
            )}
          </div>

          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500">
              Default location: {DEFAULT_LOCATION.name}
            </p>
            <button
              type="button"
              onClick={handleUseDefaultLocation}
              className="text-xs font-semibold text-[#11285A] hover:text-[#0b1c3f] hover:underline cursor-pointer transition-colors"
            >
              Use Novaliches, Quezon City
            </button>
          </div>

          {/* AUTOCOMPLETE DROPDOWN */}
          {isDropdownOpen && searchResults.length > 0 && (
            <ul className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
              {searchResults.map((result) => (
                <li
                  key={result.id}
                  onClick={() => handleSelectLocation(result)}
                  className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 cursor-pointer transition-colors"
                >
                  <Icon
                    icon="carbon:location-filled"
                    className="text-blue-400 shrink-0"
                  />
                  <span>{result.display}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {loading ? (
          <div className="animate-pulse space-y-6">
            <div className="bg-gray-200 rounded-[2rem] h-36" />
            <div className="space-y-2">
              <div className="h-6 w-44 bg-gray-200 rounded-lg" />
              <div className="h-4 w-72 bg-gray-200 rounded-lg" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <div
                  key={`today-skeleton-${index}`}
                  className="bg-gray-100 rounded-2xl border border-gray-200 p-5 space-y-3"
                >
                  <div className="w-10 h-10 rounded-xl bg-gray-200" />
                  <div className="h-3 w-20 bg-gray-200 rounded" />
                  <div className="h-4 w-16 bg-gray-200 rounded" />
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <div className="h-6 w-44 bg-gray-200 rounded-lg" />
              <div className="h-4 w-80 bg-gray-200 rounded-lg" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-3">
              {Array.from({ length: 14 }).map((_, index) => (
                <div
                  key={`forecast-skeleton-${index}`}
                  className="bg-gray-100 rounded-2xl border border-gray-200 p-4 space-y-2"
                >
                  <div className="h-3 w-12 bg-gray-200 rounded mx-auto" />
                  <div className="h-3 w-14 bg-gray-200 rounded mx-auto" />
                  <div className="h-7 w-7 rounded-full bg-gray-200 mx-auto" />
                  <div className="h-3 w-10 bg-gray-200 rounded mx-auto" />
                </div>
              ))}
            </div>
          </div>
        ) : forecast ? (
          <div className="flex flex-col gap-6">
            {/* RECOMMENDATION CARD */}
            <div className="bg-[#11285A] rounded-[2rem] p-5 md:p-6 flex flex-row items-center gap-4 shadow-lg relative overflow-hidden">
              <div className="w-20 h-20 min-w-[5rem] rounded-full bg-white flex items-center justify-center shadow-md z-10">
                <Icon
                  icon={visuals.mainIcon}
                  className="text-4xl text-[#11285A]"
                />
              </div>

              <div className="flex-1 z-10 min-w-0">
                <div className="inline-block bg-white rounded-lg px-3 py-1 mb-2 max-w-full">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#11285A] whitespace-nowrap block overflow-hidden text-ellipsis">
                    TOMORROW{" "}
                    {formattedDate ? `• ${formattedDate.toUpperCase()}` : ""}
                  </span>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-1 truncate">
                  {visuals.buttonLabel}
                </h2>
                <p className="text-white/80 text-xs md:text-sm leading-relaxed line-clamp-2">
                  {forecast.tomorrow.recommendation}
                </p>
              </div>
            </div>

            {/* TODAY'S WEATHER HEADER */}
            <div>
              <h3 className="text-lg font-bold text-[#11285A]">
                Today's Weather
              </h3>
              <p className="text-xs text-gray-500">
                Here are the other information you might need on our weather
              </p>
            </div>

            {/* DETAILS GRID */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 rounded-2xl p-5 flex flex-col items-start justify-center gap-2 border border-gray-100">
                <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                  <Icon
                    icon="mdi:weather-sunset-up"
                    className="text-orange-600 text-2xl"
                  />
                </div>
                <span className="text-gray-800 text-xs font-bold">
                  Sunrise:
                </span>
                <span className="text-sm text-gray-500">
                  {forecast.today.sunrise}
                </span>
              </div>
              <div className="bg-gray-50 rounded-2xl p-5 flex flex-col items-start justify-center gap-2 border border-gray-100">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
                  <Icon
                    icon="mdi:weather-sunset-down"
                    className="text-indigo-600 text-2xl"
                  />
                </div>
                <span className="text-gray-800 text-xs font-bold">Sunset:</span>
                <span className="text-sm text-gray-500">
                  {forecast.today.sunset}
                </span>
              </div>
              <div className="bg-gray-50 rounded-2xl p-5 flex flex-col items-start justify-center gap-2 border border-gray-100">
                <div className="w-10 h-10 rounded-xl bg-cyan-100 flex items-center justify-center">
                  <Icon
                    icon="mdi:water-percent"
                    className="text-cyan-600 text-2xl"
                  />
                </div>
                <span className="text-gray-800 text-xs font-bold">
                  Humidity:
                </span>
                <span className="text-sm text-gray-500">
                  {forecast.today.humidity}
                </span>
              </div>
              <div className="bg-gray-50 rounded-2xl p-5 flex flex-col items-start justify-center gap-2 border border-gray-100">
                <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center">
                  <Icon
                    icon="mdi:weather-windy"
                    className="text-teal-600 text-2xl"
                  />
                </div>
                <span className="text-gray-800 text-xs font-bold">Wind:</span>
                <span className="text-sm text-gray-500">
                  {forecast.today.wind}
                </span>
              </div>
              <div className="bg-gray-50 rounded-2xl p-5 flex flex-col items-start justify-center gap-2 border border-gray-100">
                <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center">
                  <Icon
                    icon="mdi:thermometer-lines"
                    className="text-rose-600 text-2xl"
                  />
                </div>
                <span className="text-gray-800 text-xs font-bold">
                  Feels Like:
                </span>
                <span className="text-sm text-gray-500">
                  {forecast.today.feelsLike}
                </span>
              </div>
              <div className="bg-gray-50 rounded-2xl p-5 flex flex-col items-start justify-center gap-2 border border-gray-100">
                <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
                  <Icon icon="mdi:gauge" className="text-violet-600 text-2xl" />
                </div>
                <span className="text-gray-800 text-xs font-bold">
                  Pressure:
                </span>
                <span className="text-sm text-gray-500">
                  {forecast.today.pressure}
                </span>
              </div>
              <div className="bg-gray-50 rounded-2xl p-5 flex flex-col items-start justify-center gap-2 border border-gray-100">
                <div className="w-10 h-10 rounded-xl bg-sky-100 flex items-center justify-center">
                  <Icon
                    icon="mdi:eye-outline"
                    className="text-sky-600 text-2xl"
                  />
                </div>
                <span className="text-gray-800 text-xs font-bold">
                  Visibility:
                </span>
                <span className="text-sm text-gray-500">
                  {forecast.today.visibility}
                </span>
              </div>
              <div className="bg-gray-50 rounded-2xl p-5 flex flex-col items-start justify-center gap-2 border border-gray-100">
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                  <Icon
                    icon="mdi:weather-sunny-alert"
                    className="text-amber-600 text-2xl"
                  />
                </div>
                <span className="text-gray-800 text-xs font-bold">
                  UV Index:
                </span>
                <span className="text-sm text-gray-500">
                  {forecast.today.uvIndex}
                </span>
              </div>
            </div>

            {/* 2-WEEK FORECAST HEADER */}
            <div>
              <h3 className="text-lg font-bold text-[#11285A]">
                2-Week Forecast
              </h3>
              <p className="text-xs text-gray-500">
                Here is the weather outlook for the next 14 days
              </p>
            </div>

            {/* 2-WEEK FORECAST GRID */}
            <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-3">
              {forecast.weekly.map((day, index) => (
                <div
                  key={index}
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedForecastDay(day)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setSelectedForecastDay(day);
                    }
                  }}
                  className="bg-gray-50 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 border border-gray-100 cursor-pointer hover:bg-blue-50 hover:border-blue-200 transition-colors"
                >
                  <span className="text-xs font-bold text-[#11285A]">
                    {day.day}
                  </span>
                  <span className="text-[11px] text-gray-500">
                    {day.dateLabel}
                  </span>
                  <Icon icon={day.icon} className={`text-2xl ${day.color}`} />
                  <span className="text-xs text-gray-500">{day.temp}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-8 bg-red-50 rounded-2xl border border-red-100 text-center">
            <p className="text-red-500">Failed to load weather data.</p>
          </div>
        )}
        {/* SIMULATION PANEL */}
        {/* <SimulationPanel /> */}
      </div>

      {selectedForecastDay && (
        <div
          className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 p-4"
          onClick={closeForecastModal}
        >
          <div
            className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-gray-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
                  <Icon
                    icon={selectedForecastDay.icon}
                    className={`text-3xl ${selectedForecastDay.color}`}
                  />
                </div>
                <div>
                  <p className="text-sm text-gray-500">
                    {selectedForecastDay.day}, {selectedForecastDay.dateLabel}
                  </p>
                  <h4 className="text-lg font-bold text-[#11285A]">
                    {selectedForecastDay.label}
                  </h4>
                </div>
              </div>
              <button
                type="button"
                onClick={closeForecastModal}
                className="text-gray-500 hover:text-gray-700 cursor-pointer"
                aria-label="Close forecast details"
              >
                <Icon icon="ph:x-bold" className="text-lg" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                <p className="text-[11px] text-gray-500 uppercase font-semibold">
                  High
                </p>
                <p className="text-base font-bold text-[#11285A]">
                  {selectedForecastDay.tempMax}
                </p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                <p className="text-[11px] text-gray-500 uppercase font-semibold">
                  Low
                </p>
                <p className="text-base font-bold text-[#11285A]">
                  {selectedForecastDay.tempMin}
                </p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                <p className="text-[11px] text-gray-500 uppercase font-semibold">
                  Average
                </p>
                <p className="text-base font-bold text-[#11285A]">
                  {selectedForecastDay.temp}
                </p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                <p className="text-[11px] text-gray-500 uppercase font-semibold">
                  Rain Chance
                </p>
                <p className="text-base font-bold text-[#11285A]">
                  {selectedForecastDay.precipProbability}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default WeatherBoard;
