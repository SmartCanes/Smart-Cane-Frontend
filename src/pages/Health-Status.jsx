import { useEffect, useState } from "react";
import ComponentIcon from "@/assets/images/component-icon.svg";
import { useRealtimeStore } from "@/stores/useStore";
import { motion } from "framer-motion";

const componentIdMap = {
  1: "mpuStatus",
  2: "infraredStatus",
  3: "ultrasonicStatus",
  4: "esp32Status",
  5: "raspberryPiStatus",
  6: "gpsStatus"
};
const componentsData = [
  {
    id: 1,
    name: "MPU-6050 Accelerometer"
  },
  {
    id: 2,
    name: "Time-of-Flight IR Distance Sensor"
  },
  {
    id: 3,
    name: "Ultrasonic Sensor"
  },
  {
    id: 4,
    name: "ESP32-WROOM-32D"
  },
  {
    id: 5,
    name: "Raspberry Pi 4 Model B"
  }
];

const ComponentCard = ({ component, status }) => {
  return (
    <div
      className={`rounded-lg shadow-sm border p-5 hover:shadow-md transition-shadow h-full md:min-h-[200px] flex flex-col ${
        status
          ? "bg-primary-100 border-primary-100"
          : "bg-white border-gray-200"
      }`}
    >
      <div className="flex items-start gap-3 mb-4">
        <div className="flex-shrink-0">
          <img
            src={ComponentIcon}
            alt="Component Icon"
            className={`w-5 h-5 md:w-7 md:h-7 ${status ? "brightness-0 invert" : ""}`}
          />
        </div>

        <div className="flex-1 min-w-0">
          <h3
            className={`font-poppins font-medium text-md md:text-[20px] leading-tight ${
              status ? "text-white" : "text-gray-900"
            }`}
          >
            {component.name}
          </h3>
        </div>
      </div>

      <div
        className={`border-t border-dashed mb-3 mt-auto ${
          status ? "border-white/20" : "border-gray-300"
        }`}
      ></div>

      <div className="flex items-center gap-2">
        <span
          className={`text-sm ${status ? "text-green-400" : "text-gray-400"}`}
        >
          •
        </span>
        <span
          className={`font-poppins text-sm ${
            status ? "text-green-400" : "text-gray-400"
          }`}
        >
          {component.status}
        </span>
      </div>
    </div>
  );
};

function HealthStatus() {
  const [components, setComponents] = useState(componentsData);
  const { componentHealth } = useRealtimeStore();

  useEffect(() => {
    console.log(componentHealth);
    setComponents((prev) =>
      prev.map((component) => {
        const healthKey = componentIdMap[component.id];

        if (!healthKey) {
          return { ...component, status: "Unknown" };
        }

        const isOnline = Boolean(componentHealth[healthKey]);

        return {
          ...component,
          status: isOnline ? "Online" : "Offline"
        };
      })
    );
  }, [componentHealth]);

  return (
    <motion.main
      className="bg-white md:bg-[#f9fafb] rounded-t-[32px] md:rounded-none min-h-[calc(100vh-var(--header-height)-var(--mobile-nav-height))] md:min-h-[calc(100vh-var(--header-height))] md:max-h-[calc(100vh-var(--header-height))] overflow-y-visible md:overflow-y-auto p-6 pb-[calc(var(--mobile-nav-height)+1.5rem)] md:pb-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <h1 className="text-2xl font-bold text-primary-100 font-poppins text-navy-900 mb-2 md:mb-5">
        Component Health Status
      </h1>

      <p className="text-[14px] text-gray-600 mb-10 md:mb-20 md:hidden">
        Check the status of your device components.
      </p>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 md:gap-6  md:w-full mx-auto"></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-6 md:w-full h-full">
        {components.map((component) => (
          <ComponentCard
            key={component.id}
            component={component}
            status={component.status === "Online"}
          />
        ))}
      </div>
    </motion.main>
  );
}

export default HealthStatus;
