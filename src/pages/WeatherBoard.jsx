import { useEffect, useMemo, useState } from "react";
import { Icon } from "@iconify/react";

import { fetchFullWeatherForecast } from "@/api/weatherService";

const WeatherBoard = () => {
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const loadForecast = async () => {
      setLoading(true);

      const data = await fetchFullWeatherForecast();

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
  }, []);

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
      if (forecast.tomorrow.weatherCode === 0 || forecast.tomorrow.weatherCode === 1) {
        mainIcon = "solar:sun-bold-duotone";
      }
      // 2, 3: Cloudy
      else if (forecast.tomorrow.weatherCode === 2 || forecast.tomorrow.weatherCode === 3) {
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
            <span>Assisi St., Novaliches (Synchronized)</span>
          </div>
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
                <span className="text-gray-800 text-xs font-bold">
                  Sunset:
                </span>
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
                <span className="text-gray-800 text-xs font-bold">
                  Wind:
                </span>
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
                  <Icon
                    icon={day.icon}
                    className={`text-2xl ${day.color}`}
                  />
                  <span className="text-xs text-gray-500">
                    {day.temp}
                  </span>
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
      />
    </main>
  );
};

const CalendarOverlay = ({ isOpen, onClose }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  if (!isOpen) return null;

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const startDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1; // Mon start

  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const handlePrev = () => setCurrentMonth(new Date(year, month - 1, 1));
  const handleNext = () => setCurrentMonth(new Date(year, month + 1, 1));

  const renderCells = () => {
    const cells = [];
    // Prev Month
    for (let i = 0; i < startDay; i++) {
      const d = daysInPrevMonth - startDay + i + 1;
      cells.push(
        <div
          key={`prev-${d}`}
          className="h-14 flex items-center justify-center text-gray-400 bg-white"
        >
          {d}
        </div>
      );
    }
    // Current Month
    const today = new Date();
    for (let i = 1; i <= daysInMonth; i++) {
      const isToday =
        today.getDate() === i &&
        today.getMonth() === month &&
        today.getFullYear() === year;
      cells.push(
        <div
          key={`curr-${i}`}
          className={`h-14 flex items-center justify-center text-sm font-medium transition-colors
          ${isToday ? "bg-[#4B5EAA] text-white" : "bg-white text-gray-700 hover:bg-gray-50"}
        `}
        >
          {i}
        </div>
      );
    }
    // Next Month
    const totalSlots = 42;
    const filled = startDay + daysInMonth;
    const remaining = totalSlots - filled;
    for (let i = 1; i <= remaining; i++) {
      cells.push(
        <div
          key={`next-${i}`}
          className="h-14 flex items-center justify-center text-gray-300 bg-gray-50/50"
        >
          {i}
        </div>
      );
    }
    return cells;
  };

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-[2rem] p-6 w-full max-w-[400px] shadow-2xl animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-8 px-2">
          <h2 className="text-2xl font-bold text-gray-900">
            {currentMonth.toLocaleDateString("en-US", {
              month: "long",
              year: "numeric"
            })}
          </h2>
          <div className="flex gap-1">
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
          </div>
        </div>

        {/* Days Header */}
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
      </div>
    </div>
  );
};

export default WeatherBoard;
