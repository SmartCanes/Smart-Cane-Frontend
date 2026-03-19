import { useState, useEffect, useMemo } from "react";
import { Icon } from "@iconify/react";
import { fetchWeatherAlert } from "@/api/weatherService";
import { useDeviceLogsStore, useDevicesStore } from "@/stores/useStore";

const toValidDate = (raw) => {
  if (!raw) return null;
  const str = typeof raw === "string" ? raw.replace(" ", "T") : String(raw);
  const withZ = !str.endsWith("Z") && !str.includes("+") ? `${str}Z` : str;
  const date = new Date(withZ);
  return Number.isNaN(date.getTime()) ? null : date;
};

const formatAlertTime = (raw) => {
  const date = toValidDate(raw);
  if (!date) return "—";

  return date.toLocaleTimeString("en-PH", {
    timeZone: "Asia/Manila",
    hour: "numeric",
    minute: "2-digit",
    hour12: true
  });
};

const getNotificationStyle = (color) => {
  switch (color) {
    case "green":
      return {
        card: "bg-[#E9F9EE] border-[#D4F4E0]",
        iconWrap: "bg-[#16A34A]/10",
        iconColor: "text-[#16A34A]",
        titleColor: "text-[#166534]",
        messageColor: "text-[#16A34A]"
      };
    case "orange":
      return {
        card: "bg-[#FEF6E6] border-[#FCEACC]",
        iconWrap: "bg-[#EA580C]/10",
        iconColor: "text-[#EA580C]",
        titleColor: "text-[#9A3412]",
        messageColor: "text-[#EA580C]"
      };
    case "red":
      return {
        card: "bg-red-50 border-red-100",
        iconWrap: "bg-red-500/10",
        iconColor: "text-red-600",
        titleColor: "text-red-800",
        messageColor: "text-red-600"
      };
    case "blue":
      return {
        card: "bg-blue-50 border-blue-100",
        iconWrap: "bg-blue-500/10",
        iconColor: "text-blue-600",
        titleColor: "text-blue-800",
        messageColor: "text-blue-600"
      };
    case "indigo":
      return {
        card: "bg-indigo-50 border-indigo-100",
        iconWrap: "bg-indigo-500/10",
        iconColor: "text-indigo-600",
        titleColor: "text-indigo-800",
        messageColor: "text-indigo-600"
      };
    case "purple":
      return {
        card: "bg-purple-50 border-purple-100",
        iconWrap: "bg-purple-500/10",
        iconColor: "text-purple-600",
        titleColor: "text-purple-800",
        messageColor: "text-purple-600"
      };
    default:
      return {
        card: "bg-gray-50 border-gray-100",
        iconWrap: "bg-gray-500/10",
        iconColor: "text-gray-500",
        titleColor: "text-gray-700",
        messageColor: "text-gray-500"
      };
  }
};

const RecentAlerts = () => {
  const [weather, setWeather] = useState(null);

  const { selectedDevice } = useDevicesStore();
  const { getDeviceLogs } = useDeviceLogsStore();
  const deviceLogs = getDeviceLogs(selectedDevice?.deviceId);

  useEffect(() => {
    const loadWeather = async () => {
      try {
        const data = await fetchWeatherAlert();
        setWeather(data);
      } catch (error) {
        console.error("Failed to load weather alert:", error);
      }
    };

    loadWeather();
  }, []);

  const latestAlerts = useMemo(() => {
    const recentDeviceLogs = [...deviceLogs]
      .sort((a, b) => {
        const aTime = toValidDate(a.timestamp)?.getTime() ?? 0;
        const bTime = toValidDate(b.timestamp)?.getTime() ?? 0;
        return bTime - aTime;
      })
      .slice(0, weather ? 2 : 3)
      .map((item) => ({
        id: item.id,
        type: "device-log",
        title: item.title,
        message: item.message,
        icon: item.icon || "ph:bell",
        color: item.color || "gray",
        timestamp: item.timestamp
      }));

    const weatherAlert = weather
      ? [
          {
            id: "weather-alert",
            type: "weather",
            title: weather.title,
            message: `${weather.message} (${weather.temp}°C)`,
            icon: weather.isRaining ? "fa7-solid:cloud-rain" : "fa6-solid:sun",
            color: weather.isRaining ? "orange" : "blue",
            timestamp: weather.timestamp || new Date().toISOString()
          }
        ]
      : [];

    return [...weatherAlert, ...recentDeviceLogs];
  }, [deviceLogs, weather]);

  const isWeatherLoading = weather === null;

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 w-full font-poppins">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">
        Recent Alerts
      </h3>

      <div className="space-y-4">
        {latestAlerts.length > 0 ? (
          latestAlerts.map((alert) => {
            if (alert.type === "weather") {
              return (
                <div
                  key={alert.id}
                  className={`border rounded-xl p-4 flex items-start gap-4 transition-colors ${
                    weather?.isRaining
                      ? "bg-[#FEF6E6] border-[#FCEACC]"
                      : "bg-blue-50 border-blue-100"
                  }`}
                >
                  <div
                    className={`w-10 h-10 flex-shrink-0 rounded-full flex items-center justify-center shadow-sm ${
                      weather?.isRaining ? "bg-[#EA580C]/10" : "bg-blue-500/10"
                    }`}
                  >
                    <Icon
                      icon={alert.icon}
                      className={`text-2xl ${
                        weather?.isRaining ? "text-[#EA580C]" : "text-blue-600"
                      }`}
                    />
                  </div>
                  <div>
                    <p
                      className={`font-semibold text-sm ${
                        weather?.isRaining ? "text-[#9A3412]" : "text-blue-800"
                      }`}
                    >
                      {alert.title}
                    </p>
                    <p
                      className={`text-xs ${
                        weather?.isRaining ? "text-[#EA580C]" : "text-blue-600"
                      }`}
                    >
                      {alert.message} - {formatAlertTime(alert.timestamp)}
                    </p>
                  </div>
                </div>
              );
            }

            const style = getNotificationStyle(alert.color);

            return (
              <div
                key={alert.id}
                className={`border rounded-xl p-4 flex items-start gap-4 transition-colors ${style.card}`}
              >
                <div
                  className={`w-10 h-10 flex-shrink-0 rounded-full flex items-center justify-center shadow-sm ${style.iconWrap}`}
                >
                  <Icon
                    icon={alert.icon}
                    className={`text-2xl ${style.iconColor}`}
                  />
                </div>
                <div>
                  <p className={`font-semibold text-sm ${style.titleColor}`}>
                    {alert.title}
                  </p>
                  <p className={`text-xs ${style.messageColor}`}>
                    {alert.message}
                  </p>
                </div>
              </div>
            );
          })
        ) : isWeatherLoading ? (
          <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 flex items-center justify-center gap-2 text-gray-400 text-xs">
            <Icon icon="eos-icons:loading" className="animate-spin" />
            <span>Checking Novaliches weather...</span>
          </div>
        ) : (
          <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 flex items-center justify-center gap-2 text-gray-400 text-xs">
            <Icon icon="ph:bell-slash" />
            <span>No recent alerts</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentAlerts;
