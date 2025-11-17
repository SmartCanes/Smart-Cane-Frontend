import { useEffect, useMemo, useState } from "react";
import { Icon } from "@iconify/react";
import { fetchTomorrowForecast } from "@/api/WeatherService";

// Import Layout Components
import Header from "@/ui/components/Header";
import DashboardSide from "@/ui/components/DashboardSide";

const WeatherBoard = () => {
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const loadForecast = async () => {
      setLoading(true);
      const data = await fetchTomorrowForecast();
      if (isMounted) {
        setForecast(data);
        setLoading(false);
      }
    };
    loadForecast();
    return () => {
      isMounted = false;
    };
  }, []);

  // Format Date
  const formattedDate = useMemo(() => {
    if (!forecast?.date) return "Tomorrow";
    const dateValue = new Date(forecast.date);
    return dateValue.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric"
    });
  }, [forecast]);

  // Visuals Logic
  const visuals = useMemo(() => {
    if (!forecast) return {};
    if (forecast.canGoOutside) {
      return {
        mainIcon: "solar:sun-fog-bold-duotone",
        iconColor: "text-emerald-500",
        bgColor: "bg-emerald-50",
        borderColor: "border-emerald-100",
        titleColor: "text-emerald-700",
        buttonLabel: "Safe to Walk"
      };
    } else {
      return {
        mainIcon: "solar:cloud-rain-bold-duotone",
        iconColor: "text-orange-500",
        bgColor: "bg-orange-50",
        borderColor: "border-orange-100",
        titleColor: "text-orange-700",
        buttonLabel: "Stay Indoors"
      };
    }
  }, [forecast]);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* 1. SIDEBAR */}
      <DashboardSide />

      {/* 2. MAIN SECTION */}
      <div className="flex-1 flex flex-col">
        {/* 3. HEADER */}
        <Header
          userName="Zander"
          isOnline={true}
          notificationCount={3} // Pwede mo gawing dynamic later
          onNotificationClick={() => console.log("Notif clicked")}
          onProfileClick={() => console.log("Profile clicked")}
        />

        {/* 4. WEATHER CONTENT (Scrollable) */}
        <main className="flex-1 overflow-y-auto bg-white p-8">
          {/* Header Title inside Content */}
          <div className="mb-8">
            <h1 className="text-3xl font-semibold text-gray-900 font-poppins mb-2">
              Weather Forecast
            </h1>
            <div className="flex items-center gap-2 text-gray-500 text-sm font-poppins">
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
              <p className="text-gray-400 font-poppins text-sm">
                Checking forecast...
              </p>
            </div>
          ) : forecast ? (
            <div className="grid gap-6 max-w-3xl">
              {/* RECOMMENDATION CARD */}
              <div
                className={`rounded-3xl border-2 p-8 flex flex-col md:flex-row items-center gap-6 transition-all ${visuals.bgColor} ${visuals.borderColor}`}
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
                      Tomorrow • {formattedDate}
                    </span>
                  </div>
                  <h2
                    className={`text-3xl font-bold mb-2 ${visuals.titleColor}`}
                  >
                    {visuals.buttonLabel}
                  </h2>
                  <p className="text-gray-600 font-poppins text-sm md:text-base">
                    {forecast.recommendation}
                  </p>
                </div>
              </div>

              {/* DETAILS GRID */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 rounded-2xl p-5 flex flex-col items-center justify-center gap-2 border border-gray-100">
                  <Icon
                    icon="solar:thermometer-bold"
                    className="text-2xl text-red-400"
                  />
                  <span className="text-gray-400 text-xs uppercase tracking-wide">
                    Max Temp
                  </span>
                  <span className="text-xl font-bold text-gray-700">
                    {forecast.tempMax}°C
                  </span>
                </div>
                <div className="bg-gray-50 rounded-2xl p-5 flex flex-col items-center justify-center gap-2 border border-gray-100">
                  <Icon
                    icon="solar:thermometer-bold"
                    className="text-2xl text-blue-400"
                  />
                  <span className="text-gray-400 text-xs uppercase tracking-wide">
                    Min Temp
                  </span>
                  <span className="text-xl font-bold text-gray-700">
                    {forecast.tempMin}°C
                  </span>
                </div>
                <div className="bg-gray-50 rounded-2xl p-5 flex flex-col items-center justify-center gap-2 border border-gray-100">
                  <Icon
                    icon="carbon:rain-drop"
                    className="text-2xl text-blue-500"
                  />
                  <span className="text-gray-400 text-xs uppercase tracking-wide">
                    Rain Chance
                  </span>
                  <span className="text-xl font-bold text-gray-700">
                    {forecast.precipProbability}%
                  </span>
                </div>
                <div className="bg-gray-50 rounded-2xl p-5 flex flex-col items-center justify-center gap-2 border border-gray-100">
                  <Icon
                    icon="fluent:weather-partly-cloudy-day-24-regular"
                    className="text-2xl text-yellow-500"
                  />
                  <span className="text-gray-400 text-xs uppercase tracking-wide">
                    Condition
                  </span>
                  <span className="text-lg font-bold text-gray-700 whitespace-nowrap">
                    {forecast.description}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 bg-red-50 rounded-2xl border border-red-100 text-center">
              <p className="text-red-500">Failed to load weather data.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default WeatherBoard;
