import { useState } from "react";
import ComponentIcon from "@/assets/images/component-icon.svg";
import { motion } from "framer-motion";

const componentsData = [
  {
    id: 1,
    name: "IMU Sensor",
    status: "Offline"
  },
  {
    id: 2,
    name: "Time-of-Flight IR Distance Sensor",
    status: "Online"
  },
  {
    id: 3,
    name: "Waterproof Ultrasonic Sensor",
    status: "Offline"
  },
  {
    id: 4,
    name: "ESP32-WROOM-32D",
    status: "Online"
  },
  {
    id: 5,
    name: "PI Camera 3 (CSI Interface)",
    status: "Offline"
  },
  {
    id: 6,
    name: "Raspberry Pi 4 Model B",
    status: "Online"
  },
  {
    id: 7,
    name: "ESP32-WROOM-32D",
    status: "Offline"
  }
];

const ComponentCard = ({ component }) => {
  const isOnline = component.status === "Online";

  return (
    <div
      className={`rounded-lg shadow-sm border p-5 hover:shadow-md transition-shadow h-full md:min-h-[200px] flex flex-col ${
        isOnline
          ? "bg-primary-100 border-primary-100"
          : "bg-white border-gray-200"
      }`}
    >
      <div className="flex items-start gap-3 mb-4">
        <div className="flex-shrink-0">
          <img
            src={ComponentIcon}
            alt="Component Icon"
            className={`w-5 h-5 md:w-7 md:h-7 ${isOnline ? "brightness-0 invert" : ""}`}
          />
        </div>

        <div className="flex-1 min-w-0">
          <h3
            className={`font-poppins font-medium text-[10px] md:text-[20px] leading-tight ${
              isOnline ? "text-white" : "text-gray-900"
            }`}
          >
            {component.name}
          </h3>
        </div>
      </div>

      <div
        className={`border-t border-dashed mb-3 mt-auto ${
          isOnline ? "border-white/20" : "border-gray-300"
        }`}
      ></div>

      <div className="flex items-center gap-2">
        <span
          className={`text-xs ${
            isOnline ? "text-green-400" : "text-gray-400"
          }`}
        >
          •
        </span>
        <span
          className={`font-poppins text-xs ${
            isOnline ? "text-green-400" : "text-gray-400"
          }`}
        >
          {component.status}
        </span>
      </div>
    </div>
  );
};

function Components() {
  const [components] = useState(componentsData);

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

      <p className="text-[14px] text-gray-600 mb-10 md:mb-20 md:hidden">Check the status of your device components.</p>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 md:gap-6  md:w-full mx-auto">
        {components.map((component) => (
          <ComponentCard key={component.id} component={component} />
        ))}
      </div>
    </motion.main>
  );
}

export default Components;