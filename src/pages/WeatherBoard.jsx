import { useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "@iconify/react";

import {
  DEFAULT_LOCATION,
  fetchFullWeatherForecast,
  fetchWeatherForDate,
  getWeatherIcon,
  searchLocations
} from "@/api/weatherService";

const WeatherBoard = () => {
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

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
    let iconColor = "text-emerald-500";
    let bgColor = "bg-emerald-50";
    let borderColor = "border-emerald-100";
    let titleColor = "text-emerald-700";

    if (!forecast.tomorrow.canGoOutside) {
      mainIcon = "solar:cloud-rain-bold-duotone";
      buttonLabel = "Stay Indoors";
      iconColor = "text-orange-500";
      bgColor = "bg-orange-50";
      borderColor = "border-orange-100";
      titleColor = "text-orange-700";
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
      buttonLabel,
      iconColor,
      bgColor,
      borderColor,
      titleColor
    };
  }, [forecast]);

  const todayDate = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric"
  });

  return (
    <main className="bg-white md:bg-[#f9fafb] rounded-t-[32px] md:rounded-none min-h-[calc(100vh-var(--header-height)-var(--mobile-nav-height))] md:min-h-[calc(100vh-var(--header-height))] md:max-h-[calc(100vh-var(--header-height))] overflow-y-visible md:overflow-y-auto p-6 pb-[calc(var(--mobile-nav-height)+1.5rem)] md:pb-6">
      <div className="mx-auto space-y-6 min-h-full">
        <div>
          <h1 className="text-2xl font-bold text-[#11285A] mb-1">
            Weather Forecast
          </h1>
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <Icon icon="carbon:location-filled" />
            <span>{location.name}</span>
          </div>
        </div>

        {/* LOCATION SEARCH BAR */}
        <div ref={searchRef} className="relative">
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2.5 shadow-sm focus-within:ring-2 focus-within:ring-blue-400 focus-within:border-blue-400 transition-all">
            <Icon icon="carbon:search" className="text-gray-400 text-lg shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchResults.length > 0 && setIsDropdownOpen(true)}
              placeholder="Search a city or place..."
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
          <div className="flex flex-col items-center justify-center h-[300px] gap-3">
            <Icon
              icon="eos-icons:loading"
              className="text-4xl text-primary-100 animate-spin"
            />
            <p className="text-gray-400 text-sm">Checking forecast...</p>
          </div>
        ) : forecast ? (
          <div className="flex flex-col gap-6">
            {/* MOBILE RECOMMENDATION CARD */}
            <div className="md:hidden bg-[#11285A] rounded-[2rem] p-5 flex flex-row items-center gap-4 shadow-lg relative overflow-hidden">
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
                <h2 className="text-2xl font-bold text-white mb-1 truncate">
                  {visuals.buttonLabel}
                </h2>
                <p className="text-white/80 text-xs leading-relaxed line-clamp-2">
                  {forecast.tomorrow.recommendation}
                </p>
              </div>
            </div>

            {/* DESKTOP RECOMMENDATION CARD */}
            <div
              className={`hidden md:flex rounded-3xl border-2 p-8 flex-col md:flex-row items-center gap-6 transition-all ${visuals.bgColor} ${visuals.borderColor}`}
            >
              <div
                className={`w-24 h-24 rounded-full bg-white flex items-center justify-center shadow-sm ${visuals.iconColor}`}
              >
                <Icon icon={visuals.mainIcon} className="text-6xl" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                  <span
                    className={`px-3 py-1 rounded-full bg-white text-xs font-bold uppercase tracking-wider shadow-sm ${visuals.titleColor}`}
                  >
                    TOMORROW{" "}
                    {formattedDate ? `- ${formattedDate.toUpperCase()}` : ""}
                  </span>
                </div>
                <h2 className={`text-3xl font-bold mb-2 ${visuals.titleColor}`}>
                  {visuals.buttonLabel}
                </h2>
                <p className="text-gray-600 text-sm md:text-base">
                  {forecast.tomorrow.recommendation}
                </p>
              </div>
            </div>

            {/* DATE SELECTOR */}
            <div
              onClick={() => setIsCalendarOpen(true)}
              className="cursor-pointer hover:bg-gray-50 transition-colors flex items-center gap-3 px-4 py-3 bg-white border border-gray-200 rounded-xl shadow-sm max-w-fit"
            >
              <Icon
                icon="solar:calendar-linear"
                className="text-gray-500 text-xl"
              />
              <span className="text-sm font-medium text-gray-600">
                Today - {todayDate}
              </span>
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
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-gray-50 rounded-2xl p-5 flex flex-col items-start justify-center gap-2 border border-gray-100">
                <span className="text-gray-800 text-xs font-bold">
                  Sunrise:
                </span>
                <span className="text-sm text-gray-500">
                  {forecast.today.sunrise}
                </span>
              </div>
              <div className="bg-gray-50 rounded-2xl p-5 flex flex-col items-start justify-center gap-2 border border-gray-100">
                <span className="text-gray-800 text-xs font-bold">Sunset:</span>
                <span className="text-sm text-gray-500">
                  {forecast.today.sunset}
                </span>
              </div>
              <div className="bg-gray-50 rounded-2xl p-5 flex flex-col items-start justify-center gap-2 border border-gray-100">
                <span className="text-gray-800 text-xs font-bold">
                  Humidity:
                </span>
                <span className="text-sm text-gray-500">
                  {forecast.today.humidity}
                </span>
              </div>
              <div className="bg-gray-50 rounded-2xl p-5 flex flex-col items-start justify-center gap-2 border border-gray-100">
                <span className="text-gray-800 text-xs font-bold">Wind:</span>
                <span className="text-sm text-gray-500">
                  {forecast.today.wind}
                </span>
              </div>
              <div className="bg-gray-50 rounded-2xl p-5 flex flex-col items-start justify-center gap-2 border border-gray-100">
                <span className="text-gray-800 text-xs font-bold">
                  Feels Like:
                </span>
                <span className="text-sm text-gray-500">
                  {forecast.today.feelsLike}
                </span>
              </div>
              <div className="bg-gray-50 rounded-2xl p-5 flex flex-col items-start justify-center gap-2 border border-gray-100">
                <span className="text-gray-800 text-xs font-bold">
                  Pressure:
                </span>
                <span className="text-sm text-gray-500">
                  {forecast.today.pressure}
                </span>
              </div>
              <div className="bg-gray-50 rounded-2xl p-5 flex flex-col items-start justify-center gap-2 border border-gray-100">
                <span className="text-gray-800 text-xs font-bold">
                  Visibility:
                </span>
                <span className="text-sm text-gray-500">
                  {forecast.today.visibility}
                </span>
              </div>
              <div className="bg-gray-50 rounded-2xl p-5 flex flex-col items-start justify-center gap-2 border border-gray-100">
                <span className="text-gray-800 text-xs font-bold">
                  UV Index:
                </span>
                <span className="text-sm text-gray-500">
                  {forecast.today.uvIndex}
                </span>
              </div>
            </div>

            {/* WEEKLY FORECAST HEADER */}
            <div>
              <h3 className="text-lg font-bold text-[#11285A]">
                Weekly Forecast
              </h3>
              <p className="text-xs text-gray-500">
                Here are the summary of the whole weather this week
              </p>
            </div>

            {/* WEEKLY FORECAST GRID */}
            <div className="grid grid-cols-4 md:grid-cols-7 gap-3">
              {forecast.weekly.map((day, index) => (
                <div
                  key={index}
                  className="bg-gray-50 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 border border-gray-100"
                >
                  <span className="text-xs font-bold text-[#11285A]">
                    {day.day}
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

      <CalendarOverlay
        isOpen={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
        forecast={forecast}
        location={location}
      />
    </main>
  );
};

const CalendarOverlay = ({ isOpen, onClose, forecast, location }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null); // "YYYY-MM-DD"
  const [dateWeather, setDateWeather] = useState(null);
  const [isLoadingDate, setIsLoadingDate] = useState(false);

  // Reset selection when closed
  useEffect(() => {
    if (!isOpen) {
      setSelectedDate(null);
      setDateWeather(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const startDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const handlePrev = () => {
    setSelectedDate(null);
    setDateWeather(null);
    setCurrentMonth(new Date(year, month - 1, 1));
  };
  const handleNext = () => {
    setSelectedDate(null);
    setDateWeather(null);
    setCurrentMonth(new Date(year, month + 1, 1));
  };

  const toDateStr = (y, m, d) =>
    `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

  const handleDayClick = async (day) => {
    const dateStr = toDateStr(year, month, day);
    setSelectedDate(dateStr);
    setDateWeather(null);
    setIsLoadingDate(true);
    const data = await fetchWeatherForDate(location?.lat, location?.lon, dateStr);
    setDateWeather(data);
    setIsLoadingDate(false);
  };

  const renderCells = () => {
    const cells = [];
    const today = new Date();
    const todayStr = toDateStr(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );

    for (let i = 0; i < startDay; i++) {
      const d = daysInPrevMonth - startDay + i + 1;
      cells.push(
        <div
          key={`prev-${d}`}
          className="h-12 flex items-center justify-center text-gray-300 bg-white text-sm"
        >
          {d}
        </div>
      );
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = toDateStr(year, month, i);
      const isToday = dateStr === todayStr;
      const isSelected = dateStr === selectedDate;

      cells.push(
        <div
          key={`curr-${i}`}
          onClick={() => handleDayClick(i)}
          className={`h-12 flex items-center justify-center text-sm font-medium transition-all cursor-pointer select-none
            ${
              isSelected
                ? "bg-[#11285A] text-white"
                : isToday
                  ? "bg-[#4B5EAA] text-white"
                  : "bg-white text-gray-700 hover:bg-blue-50"
            }`}
        >
          {i}
        </div>
      );
    }

    const totalSlots = 42;
    const remaining = totalSlots - startDay - daysInMonth;
    for (let i = 1; i <= remaining; i++) {
      cells.push(
        <div
          key={`next-${i}`}
          className="h-12 flex items-center justify-center text-gray-300 bg-gray-50/50 text-sm"
        >
          {i}
        </div>
      );
    }
    return cells;
  };

  const selectedLabel = selectedDate
    ? new Date(selectedDate + "T12:00:00").toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric"
      })
    : null;

  const { icon: dIcon, color: dColor } = selectedDate && dateWeather
    ? getWeatherIcon(dateWeather.weatherCode)
    : { icon: "solar:sun-fog-bold-duotone", color: "text-gray-300" };

  return (
    <div
      className="fixed inset-0 z-[999] flex items-start md:items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className={`bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row transition-all duration-300 w-full my-auto ${
          selectedDate ? "max-w-[780px]" : "max-w-[420px]"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── LEFT: Calendar ── */}
        <div className="p-6 flex-shrink-0 w-full md:w-[420px]">
          {/* Header */}
          <div className="flex justify-between items-center mb-6 px-1">
            <h2 className="text-2xl font-bold text-gray-900">
              {currentMonth.toLocaleDateString("en-US", {
                month: "long",
                year: "numeric"
              })}
            </h2>
            <div className="flex items-center gap-1">
              <button
                onClick={handlePrev}
                className="p-2 hover:bg-gray-100 rounded-full text-gray-600 transition-colors"
              >
                <Icon icon="solar:alt-arrow-left-linear" className="text-xl" />
              </button>
              <button
                onClick={handleNext}
                className="p-2 hover:bg-gray-100 rounded-full text-gray-600 transition-colors"
              >
                <Icon icon="solar:alt-arrow-right-linear" className="text-xl" />
              </button>
              <button
                onClick={onClose}
                className="ml-1 p-2 hover:bg-red-50 rounded-full text-gray-400 hover:text-red-500 transition-colors"
                aria-label="Close"
              >
                <Icon icon="ph:x-bold" className="text-xl" />
              </button>
            </div>
          </div>

          {/* Day labels */}
          <div className="grid grid-cols-7 mb-2">
            {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((d) => (
              <div
                key={d}
                className="text-center font-bold text-gray-900 text-sm py-2"
              >
                {d}
              </div>
            ))}
          </div>

          {/* Grid */}
          <div className="grid grid-cols-7 border border-gray-200 rounded-xl overflow-hidden bg-gray-200 gap-[1px]">
            {renderCells()}
          </div>

          {!selectedDate && (
            <p className="text-center text-xs text-gray-400 mt-4">
              Tap any date to see its weather
            </p>
          )}
        </div>

        {/* ── RIGHT: Date Detail Panel ── */}
        {selectedDate && (
          <div className="flex-1 bg-[#f9fafb] border-t md:border-t-0 md:border-l border-gray-100 p-6 flex flex-col gap-4 min-w-0">
            {isLoadingDate ? (
              <div className="flex flex-col items-center justify-center h-full gap-3 py-10">
                <Icon
                  icon="eos-icons:loading"
                  className="text-4xl text-[#4B5EAA] animate-spin"
                />
                <p className="text-sm text-gray-400">Loading weather...</p>
              </div>
            ) : dateWeather ? (
              <>
                {/* Date label + icon */}
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center shrink-0">
                    <Icon icon={dIcon} className={`text-4xl ${dColor}`} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">
                      {selectedLabel}
                    </p>
                    <p className="text-xl font-bold text-[#11285A]">
                      {dateWeather.label}
                    </p>
                    <p className="text-sm text-gray-500">
                      {dateWeather.tempMax}°C ↑ &nbsp; {dateWeather.tempMin}°C ↓
                    </p>
                  </div>
                </div>

                {/* Detail grid */}
                <div className="grid grid-cols-2 gap-2 mt-1">
                  {[
                    {
                      label: "Sunrise",
                      value: dateWeather.sunrise,
                      icon: "solar:sunrise-bold-duotone",
                      color: "text-orange-400"
                    },
                    {
                      label: "Sunset",
                      value: dateWeather.sunset,
                      icon: "solar:sunset-bold-duotone",
                      color: "text-orange-500"
                    },
                    {
                      label: "Feels Like",
                      value: dateWeather.feelsLike,
                      icon: "solar:temperature-bold-duotone",
                      color: "text-red-400"
                    },
                    {
                      label: "Wind Max",
                      value: dateWeather.windMax,
                      icon: "solar:wind-bold-duotone",
                      color: "text-blue-400"
                    },
                    {
                      label: "Rain Chance",
                      value: dateWeather.precipProbability,
                      icon: "solar:cloud-rain-bold-duotone",
                      color: "text-blue-500"
                    },
                    {
                      label: "Precipitation",
                      value: dateWeather.precipSum,
                      icon: "solar:drop-bold-duotone",
                      color: "text-cyan-500"
                    },
                    {
                      label: "UV Index",
                      value: dateWeather.uvIndex,
                      icon: "solar:sun-bold-duotone",
                      color: "text-yellow-500"
                    }
                  ].map(({ label, value, icon, color }) => (
                    <div
                      key={label}
                      className="bg-white rounded-xl p-3 flex items-center gap-2.5 border border-gray-100"
                    >
                      <Icon icon={icon} className={`text-2xl shrink-0 ${color}`} />
                      <div>
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">
                          {label}
                        </p>
                        <p className="text-sm font-bold text-gray-700">{value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-2 py-10">
                <Icon
                  icon="solar:cloud-cross-bold-duotone"
                  className="text-5xl text-gray-300"
                />
                <p className="text-sm text-gray-400">No data available</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default WeatherBoard;
