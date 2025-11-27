import { useEffect, useMemo, useState } from "react";
import { Icon } from "@iconify/react";
import { fetchFullWeatherForecast } from "@/api/WeatherService";

// 👇 FIX 1: Import Components (Para mawala ang "DashboardSide is not defined")
import Header from "./Header";
import DashboardSide from "./DashboardSide";
import SimulationPanel from "./components/SimulationPanel"; // Siguraduhing nagawa mo na ito

// 👇 FIX 2: Import Notification Manager
import { triggerSmartCaneNotification } from "@/utils/NotificationManager";

const WeatherDetailItem = ({ label, value }) => (
  <div className="bg-gray-50 rounded-xl p-4 flex flex-col gap-1">
    <span className="text-xs font-bold text-[#11285A] uppercase tracking-wide">{label}:</span>
    <span className="text-sm font-medium text-gray-600">{value}</span>
  </div>
);

const WeatherBoard = () => {
  // 👇 FIX 3: Define States (Para mawala ang "setLoading is not defined")
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const loadForecast = async () => {
      setLoading(true); // Ito ang hinahanap ng error mo kanina

      const data = await fetchFullWeatherForecast();

      if (isMounted && data) {
        setWeatherData(data);
        setLoading(false);

        // --- AUTOMATIC NOTIFICATION LOGIC ---
        // Kapag bawal lumabas, mag-no-notify agad pag-load ng page
        if (!data.tomorrow.canGoOutside) {
          triggerSmartCaneNotification(
            "WEATHER",
            `Warning: ${data.tomorrow.recommendation}`
          );
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
    if (!weatherData?.tomorrow?.date) return "Tomorrow";
    const dateValue = new Date(weatherData.tomorrow.date);
    return dateValue.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric"
    });
  }, [weatherData]);

  // Visuals Logic
  const visuals = useMemo(() => {
    if (!weatherData?.tomorrow) return {};
    if (weatherData.tomorrow.canGoOutside) {
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
  }, [weatherData]);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* 1. SIDEBAR */}
      <DashboardSide />

      {/* 2. MAIN SECTION */}
      <div className="flex-1 flex flex-col">
        {/* 3. HEADER */}
        <Header userName="Zander" isOnline={true} notificationCount={3} />

        {/* 4. WEATHER CONTENT */}
        <main className="flex-1 overflow-y-auto bg-white p-8 relative">
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
          ) : weatherData ? (
            <div className="max-w-5xl space-y-8">
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
                    {weatherData.tomorrow.recommendation}
                  </p>
                </div>
              </div>

              {/* TODAY'S WEATHER GRID */}
              <div>
                <h3 className="text-lg font-bold text-[#11285A] mb-2">Today's Weather</h3>
                <p className="text-sm text-gray-500 mb-4">Here are the other information you might need on our weather</p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <WeatherDetailItem label="Sunrise" value={weatherData.today.sunrise} />
                  <WeatherDetailItem label="Sunset" value={weatherData.today.sunset} />
                  <WeatherDetailItem label="Humidity" value={weatherData.today.humidity} />
                  <WeatherDetailItem label="Wind" value={weatherData.today.wind} />
                  <WeatherDetailItem label="Feels Like" value={weatherData.today.feelsLike} />
                  <WeatherDetailItem label="Pressure" value={weatherData.today.pressure} />
                  <WeatherDetailItem label="Visibility" value={weatherData.today.visibility} />
                  <WeatherDetailItem label="UV Index" value={weatherData.today.uvIndex} />
                </div>
              </div>

              {/* WEEKLY FORECAST */}
              <div>
                <h3 className="text-lg font-bold text-[#11285A] mb-2">Weekly Forecast</h3>
                <p className="text-sm text-gray-500 mb-4">Here are the summary of the whole weather this week</p>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
                  {weatherData.weekly.map((day, idx) => (
                    <div key={idx} className="bg-gray-50 rounded-2xl p-4 flex flex-col items-center justify-center gap-3 hover:bg-gray-100 transition-colors">
                      <span className="text-sm font-bold text-[#11285A]">{day.day}</span>
                      <Icon icon={day.icon} className={`text-3xl ${day.color}`} />
                      <span className="text-sm font-medium text-gray-600">{day.temp}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 bg-red-50 rounded-2xl border border-red-100 text-center">
              <p className="text-red-500">Failed to load weather data.</p>
            </div>
          )}

          {/* 👇 FIX 4: Simulation Panel (Nasa baba ng content) */}
          <SimulationPanel />
        </main>
      </div>
    </div>
  );
};

export default WeatherBoard;
