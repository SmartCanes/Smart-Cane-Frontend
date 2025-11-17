import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { fetchWeatherAlert } from "@/api/WeatherService"; // Import yung service

const RecentAlerts = () => {
  const [weather, setWeather] = useState(null);

  useEffect(() => {
    const loadWeather = async () => {
      const data = await fetchWeatherAlert();
      setWeather(data);
    };
    loadWeather();
  }, []);

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 w-full font-poppins">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">
        Recent Alerts
      </h3>

      <div className="space-y-4">
        {/* ------------------------------------------------------ */}
        {/* SAFE ARRIVAL NOTIFICATION (Static - Hindi Ginalaw)     */}
        {/* ------------------------------------------------------ */}
        <div className="bg-[#E9F9EE] border border-[#D4F4E0] rounded-xl p-4 flex items-start gap-4">
          <div className="w-10 h-10 flex-shrink-0 bg-[#16A34A]/10 rounded-full flex items-center justify-center shadow-sm">
            <Icon
              icon="iconamoon:check-bold"
              className="text-[#16A34A] text-2xl"
            />
          </div>
          <div>
            <p className="font-medium text-[#166534] text-sm">
              Safe arrival notification
            </p>
            <p className="text-[#16A34A] text-xs">
              Arrived at destination - 10:30 AM
            </p>
          </div>
        </div>

        {weather ? (
          // DYNAMIC: changing color for Rain (Orange) or Clear (Blue)
          <div
            className={`border rounded-xl p-4 flex items-start gap-4 transition-colors ${
              weather.isRaining
                ? "bg-[#FEF6E6] border-[#FCEACC]" // EXACT ORANGE STYLE SA IMAGE
                : "bg-blue-50 border-blue-100" // BLUE STYLE (Kapag Clear)
            }`}
          >
            <div
              className={`w-10 h-10 flex-shrink-0 rounded-full flex items-center justify-center shadow-sm ${
                weather.isRaining ? "bg-[#EA580C]/10" : "bg-blue-500/10"
              }`}
            >
              <Icon
                icon={
                  weather.isRaining ? "fa7-solid:cloud-rain" : "fa6-solid:sun"
                }
                className={`text-2xl ${
                  weather.isRaining ? "text-[#EA580C]" : "text-blue-600"
                }`}
              />
            </div>
            <div>
              <p
                className={`font-semibold text-sm ${
                  weather.isRaining ? "text-[#9A3412]" : "text-blue-800"
                }`}
              >
                {weather.title}
              </p>
              <p
                className={`text-xs ${
                  weather.isRaining ? "text-[#EA580C]" : "text-blue-600"
                }`}
              >
                {weather.message} ({weather.temp}°C)
              </p>
            </div>
          </div>
        ) : (
          // LOADING STATE (Habang kinukuha pa ang weather)
          <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 flex items-center justify-center gap-2 text-gray-400 text-xs">
            <Icon icon="eos-icons:loading" className="animate-spin" />
            <span>Checking Assisi St. weather...</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentAlerts;
