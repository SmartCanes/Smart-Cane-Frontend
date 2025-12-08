import { useState } from "react";
import ComponentIcon from "@/assets/images/component-icon.svg";
import { motion } from "framer-motion";

const componentsData = [
  {
    id: 1,
    name: "IMU Sensor",
    status: "Disconnect"
  },
  {
    id: 2,
    name: "Time-of-Flight IR Distance Sensor",
    status: "Connected"
  },
  {
    id: 3,
    name: "Waterproof Ultrasonic Sensor",
    status: "Disconnect"
  },
  {
    id: 4,
    name: "ESP32-WROOM-32D",
    status: "Connected"
  },
  {
    id: 5,
    name: "PI Camera 3 (CSI Interface)",
    status: "Disconnect"
  },
  {
    id: 6,
    name: "Raspberry Pi 4 Model B",
    status: "Connected"
  },
  {
    id: 7,
    name: "ESP32-WROOM-32D",
    status: "Disconnect"
  }
];

const ComponentCard = ({ component }) => {
  const isConnected = component.status === "Connected";

  return (
    <div
      className={`rounded-lg shadow-sm border p-5 hover:shadow-md transition-shadow h-full flex flex-col ${
        isConnected
          ? "bg-primary-100 border-primary-100"
          : "bg-white border-gray-200"
      }`}
    >
      <div className="flex items-start gap-3 mb-4">
        <div className="flex-shrink-0">
          <img
            src={ComponentIcon}
            alt="Component Icon"
            className={`w-7 h-7 ${isConnected ? "brightness-0 invert" : ""}`}
          />
        </div>

        <div className="flex-1 min-w-0">
          <h3
            className={`font-poppins font-medium text-sm leading-tight ${
              isConnected ? "text-white" : "text-gray-900"
            }`}
          >
            {component.name}
          </h3>
        </div>
      </div>

      <div
        className={`border-t border-dashed mb-3 mt-auto ${
          isConnected ? "border-white/20" : "border-gray-300"
        }`}
      ></div>

      <div className="flex items-center gap-2">
        <span
          className={`text-xs ${
            isConnected ? "text-green-400" : "text-gray-400"
          }`}
        >
          •
        </span>
        <span
          className={`font-poppins text-xs ${
            isConnected ? "text-green-400" : "text-gray-400"
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
      <h1 className="text-2xl font-bold font-poppins text-navy-900 mb-6 md:mb-11">
        Health Status of Components
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 max-w-3xl mx-auto">
        {components.map((component) => (
          <ComponentCard key={component.id} component={component} />
        ))}
      </div>
    </motion.main>
  );
}

export default Components;