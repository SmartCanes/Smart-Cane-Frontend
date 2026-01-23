import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { useRealtimeStore } from "@/stores/useStore";
import { motion, AnimatePresence } from "framer-motion";

// Component type definitions
const componentIdMap = {
  1: "mpuStatus",
  2: "infraredStatus",
  3: "ultrasonicStatus",
  4: "esp32Status",
  5: "gpsStatus",
  6: "raspberryPiStatus"
};

const componentsData = [
  {
    id: 1,
    name: "MPU-6050 Accelerometer",
    type: "sensor",
    description: "3-axis gyroscope and accelerometer",
    icon: "mdi:axis-arrow",
    configurable: true,
    configOptions: {
      sampleRate: ["100 Hz", "250 Hz", "500 Hz", "1000 Hz"],
      range: ["±2g", "±4g", "±8g", "±16g"],
      filterBandwidth: [
        "260 Hz",
        "184 Hz",
        "94 Hz",
        "44 Hz",
        "21 Hz",
        "10 Hz",
        "5 Hz"
      ]
    }
  },
  {
    id: 2,
    name: "VL53L0X Time-of-Flight",
    type: "sensor",
    description: "Infrared laser distance sensor",
    icon: "mdi:laser-pointer",
    configurable: true,
    configOptions: {
      distanceMode: ["Default", "High Accuracy", "Long Range", "High Speed"],
      timingBudget: ["20 ms", "33 ms", "50 ms", "100 ms"],
      interMeasurement: ["0 ms", "10 ms", "20 ms", "30 ms"],
      roiSize: ["4x4", "8x8", "12x12", "16x16"]
    }
  },
  {
    id: 3,
    name: "Ultrasonic Sensor",
    type: "sensor",
    description: "HC-SR04 distance measurement",
    icon: "mdi:radar",
    configurable: true,
    configOptions: {
      range: [
        "Default",
        "Short (2-50cm)",
        "Medium (20-200cm)",
        "Long (100-400cm)",
        "Custom"
      ],
      measurementInterval: ["100 ms", "250 ms", "500 ms", "1000 ms", "2000 ms"],
      triggerPulse: ["10 µs", "20 µs", "30 µs"]
    }
  },
  {
    id: 4,
    name: "ESP32-WROOM-32D",
    type: "controller",
    description: "Dual-core WiFi & Bluetooth MCU",
    icon: "mdi:chip",
    configurable: true,
    configOptions: {
      wifiMode: ["Station", "Access Point", "Station+AP"],
      powerSave: ["None", "Light", "Modem Sleep", "Deep Sleep"],
      cpuFrequency: ["80 MHz", "160 MHz", "240 MHz"],
      flashSpeed: ["40 MHz", "80 MHz"]
    }
  },
  {
    id: 5,
    name: "NEO-6M GPS Module",
    type: "sensor",
    description: "Global positioning system",
    icon: "mdi:satellite-variant",
    configurable: true,
    configOptions: {
      updateRate: ["1 Hz", "5 Hz", "10 Hz"],
      powerMode: ["Max Performance", "Eco", "Backup"],
      measurementRate: ["1 per second", "2 per second", "5 per second"]
    }
  },
  {
    id: 6,
    name: "Raspberry Pi 4",
    type: "controller",
    description: "Single-board computer",
    icon: "mdi:raspberry-pi",
    configurable: true,
    configOptions: {
      cpuGovernor: ["Performance", "Ondemand", "Powersave", "Conservative"],
      overclock: ["None", "Moderate (1.5GHz)", "High (1.8GHz)", "Custom"],
      memorySplit: ["Default", "256MB GPU", "512MB GPU", "768MB GPU"]
    }
  }
];

const ConfigModal = ({ component, isOpen, onClose, onSave }) => {
  const [config, setConfig] = useState({});
  const [customRange, setCustomRange] = useState({ min: 2, max: 400 });
  const [customFrequency, setCustomFrequency] = useState("");

  useEffect(() => {
    const defaults = {};
    Object.keys(component?.configOptions || {}).forEach((key) => {
      defaults[key] = component.configOptions[key][0];
    });
    setConfig(defaults);
  }, [component]);

  const handleSave = async () => {
    try {
      await fetch("/api/component/configure", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          componentId: component.id,
          componentName: component.name,
          configuration: config,
          customValues: {
            range: config.range === "Custom" ? customRange : null,
            frequency: config.overclock === "Custom" ? customFrequency : null
          },
          timestamp: new Date().toISOString()
        })
      });

      onSave(component.id, config);
      onClose();

      console.log("Configuration saved successfully");
    } catch (error) {
      console.error("Failed to save configuration:", error);
    }
  };

  if (!isOpen || !component) return null;

  const renderCustomInput = () => {
    if (config.range === "Custom") {
      return (
        <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm font-medium text-gray-700">
            Custom Range Configuration
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-600 mb-1">
                Minimum Distance (cm)
              </label>
              <input
                type="number"
                value={customRange.min}
                onChange={(e) =>
                  setCustomRange((prev) => ({
                    ...prev,
                    min: Math.max(2, parseInt(e.target.value) || 2)
                  }))
                }
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                min="2"
                max="400"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">
                Maximum Distance (cm)
              </label>
              <input
                type="number"
                value={customRange.max}
                onChange={(e) =>
                  setCustomRange((prev) => ({
                    ...prev,
                    max: Math.min(400, parseInt(e.target.value) || 400)
                  }))
                }
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                min={customRange.min + 1}
                max="400"
              />
            </div>
          </div>
          <div className="mt-2 p-3 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-700">
              <Icon icon="mdi:information" className="inline mr-1 w-4 h-4" />
              Custom range set to:{" "}
              <strong>
                {customRange.min}cm - {customRange.max}cm
              </strong>
            </p>
          </div>
        </div>
      );
    }

    if (config.overclock === "Custom") {
      return (
        <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm font-medium text-gray-700">
            Custom Overclock Frequency
          </p>
          <div>
            <label className="block text-xs text-gray-600 mb-1">
              Frequency (MHz)
            </label>
            <input
              type="number"
              value={customFrequency}
              onChange={(e) => setCustomFrequency(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Enter frequency in MHz"
              min="1200"
              max="2000"
              step="100"
            />
            <p className="text-xs text-gray-500 mt-1">
              Recommended: 1500-1800 MHz. Higher values may require cooling.
            </p>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col"
      >
        <div className="p-4 sm:p-6 flex-1 overflow-y-auto">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-100 rounded-lg">
                <Icon
                  icon={component.icon}
                  className="w-5 h-5 text-primary-600"
                />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
                  Configure {component.name}
                </h3>
                <p className="text-xs sm:text-sm text-gray-500">
                  {component.description}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Close configuration"
            >
              <Icon icon="mdi:close" className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <div className="space-y-4 sm:space-y-6">
            {Object.entries(component.configOptions || {}).map(
              ([key, options]) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                    {key.replace(/([A-Z])/g, " $1").trim()}
                  </label>
                  <div className="relative">
                    <select
                      value={config[key] || ""}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          [key]: e.target.value
                        }))
                      }
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none bg-white pr-10"
                    >
                      {options.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                    <Icon
                      icon="mdi:chevron-down"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
                    />
                  </div>
                </div>
              )
            )}

            {renderCustomInput()}

            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-start gap-2">
                <Icon
                  icon="mdi:information"
                  className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5"
                />
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Configuration Note
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    Changes will take effect immediately. Some configurations
                    may require a component restart.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 text-sm sm:text-base border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex-1 px-4 py-3 text-sm sm:text-base bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium flex items-center justify-center gap-2"
            >
              <Icon icon="mdi:check" className="w-4 h-4 sm:w-5 sm:h-5" />
              Save Changes
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// Component Card
const ComponentCard = ({ component, isOnline, onTogglePower, onConfigure }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div
      layout
      className={`rounded-xl border-2 transition-all duration-300 hover:shadow-lg ${
        isOnline
          ? "border-primary-200 bg-gradient-to-br from-primary-50 to-white"
          : "border-gray-200 bg-white"
      }`}
    >
      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between mb-3 sm:mb-4">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-lg flex-shrink-0 ${
                isOnline
                  ? "bg-primary-100 text-primary-600"
                  : "bg-gray-100 text-gray-400"
              }`}
            >
              <Icon icon={component.icon} className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                {component.name}
              </h3>
              <p className="text-xs text-gray-500 truncate">
                {component.description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            {component.configurable && (
              <button
                onClick={() => onConfigure(component)}
                className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label={`Configure ${component.name}`}
              >
                <Icon
                  icon="mdi:cog"
                  className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500"
                />
              </button>
            )}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label={isExpanded ? "Collapse details" : "Expand details"}
            >
              <Icon
                icon="mdi:chevron-down"
                className={`w-4 h-4 sm:w-5 sm:h-5 text-gray-500 transition-transform ${
                  isExpanded ? "rotate-180" : ""
                }`}
              />
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3 sm:mb-4">
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full flex-shrink-0 ${
                isOnline ? "bg-green-500 animate-pulse" : "bg-red-500"
              }`}
            />
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`text-xs sm:text-sm font-medium ${
                  isOnline ? "text-green-600" : "text-red-600"
                }`}
              >
                {isOnline ? "Online" : "Offline"}
              </span>
              <span className="hidden sm:inline text-gray-400">•</span>
              <span className="text-xs text-gray-500">
                {isOnline ? "Connected" : "Disconnected"}
              </span>
            </div>
          </div>

          <button
            onClick={() => onTogglePower(component.id)}
            className={`px-3 py-2 sm:px-4 sm:py-2 rounded-lg flex items-center justify-center gap-2 transition-all text-sm font-medium ${
              isOnline
                ? "bg-red-50 text-red-600 hover:bg-red-100 active:bg-red-200"
                : "bg-green-50 text-green-600 hover:bg-green-100 active:bg-green-200"
            }`}
            aria-label={`${isOnline ? "Power off" : "Power on"} ${component.name}`}
          >
            <Icon
              icon={isOnline ? "mdi:power" : "mdi:power-off"}
              className="w-4 h-4"
            />
            <span className="hidden sm:inline">
              {isOnline ? "Power Off" : "Power On"}
            </span>
            <span className="inline sm:hidden">{isOnline ? "Off" : "On"}</span>
          </button>
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="pt-3 sm:pt-4 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">Component Type</p>
                    <div className="flex items-center gap-2">
                      <Icon
                        icon={
                          component.type === "sensor"
                            ? "mdi:sensor"
                            : "mdi:chip"
                        }
                        className="w-4 h-4 text-gray-600"
                      />
                      <p className="text-sm font-medium capitalize">
                        {component.type}
                      </p>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">Component ID</p>
                    <p className="text-sm font-medium font-mono">
                      CMP-{component.id.toString().padStart(3, "0")}
                    </p>
                  </div>
                </div>
                <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Icon
                      icon="mdi:information"
                      className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5"
                    />
                    <p className="text-xs text-blue-700">
                      {component.configurable
                        ? "Click the gear icon to configure sensor parameters and performance settings."
                        : "This component is currently read-only."}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

const api = {
  togglePower: async (componentId, powerState) => {
    return fetch("/api/component/power", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`
      },
      body: JSON.stringify({
        componentId,
        powerState,
        timestamp: new Date().toISOString()
      })
    });
  },

  saveConfiguration: async (componentId, config) => {
    return fetch("/api/component/configure", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`
      },
      body: JSON.stringify({
        componentId,
        config,
        timestamp: new Date().toISOString()
      })
    });
  },

  getComponentMetrics: async (componentId) => {
    return fetch(`/api/component/${componentId}/metrics`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    }).then((res) => res.json());
  }
};

function Advanced() {
  const [components, setComponents] = useState(componentsData);
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { componentHealth } = useRealtimeStore();

  useEffect(() => {
    setComponents((prev) =>
      prev.map((component) => {
        const healthKey = componentIdMap[component.id];
        const isOnline = healthKey
          ? Boolean(componentHealth?.[healthKey])
          : false;

        return {
          ...component,
          isOnline,
          lastSeen: new Date().toISOString(),
          uptime: isOnline ? "100%" : "0%"
        };
      })
    );
  }, [componentHealth]);

  const handleTogglePower = async (componentId) => {
    setIsLoading(true);
    try {
      const component = components.find((c) => c.id === componentId);
      const newPowerState = !component.isOnline;

      setComponents((prev) =>
        prev.map((c) =>
          c.id === componentId
            ? {
                ...c,
                isOnline: newPowerState,
                status: newPowerState ? "Starting..." : "Stopping..."
              }
            : c
        )
      );

      await api.togglePower(componentId, newPowerState);

      setComponents((prev) =>
        prev.map((c) =>
          c.id === componentId
            ? {
                ...c,
                isOnline: newPowerState,
                status: newPowerState ? "Online" : "Offline"
              }
            : c
        )
      );
    } catch (error) {
      console.error("Failed to toggle power:", error);
      setComponents((prev) =>
        prev.map((c) =>
          c.id === componentId
            ? {
                ...c,
                isOnline: !components.find((comp) => comp.id === componentId)
                  .isOnline,
                status: components.find((comp) => comp.id === componentId)
                  .isOnline
                  ? "Online"
                  : "Offline"
              }
            : c
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfigure = (component) => {
    setSelectedComponent(component);
    setIsConfigModalOpen(true);
  };

  const handleSaveConfig = async (componentId, config) => {
    setIsLoading(true);
    try {
      await api.saveConfiguration(componentId, config);
      // You can add a toast notification here
      console.log("Configuration saved successfully");
    } catch (error) {
      console.error("Failed to save config:", error);
      // You can add error toast here
    } finally {
      setIsLoading(false);
    }
  };

  const onlineCount = components.filter((c) => c.isOnline).length;

  return (
    <main className="bg-white md:bg-[#f9fafb] rounded-t-[32px] md:rounded-none min-h-[calc(100vh-var(--header-height)-var(--mobile-nav-height))] md:min-h-[calc(100vh-var(--header-height))] md:max-h-[calc(100vh-var(--header-height))] overflow-y-visible md:overflow-y-auto p-6 pb-[calc(var(--mobile-nav-height)+1.5rem)] md:pb-6">
      <div className="mx-auto w-full space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 sm:mb-8">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 font-poppins">
              Component Management
            </h2>
            <p className="text-sm sm:text-base text-gray-600">
              Monitor and configure your device components in real-time
            </p>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border w-full md:w-auto">
            <div className="flex items-center justify-around md:justify-start md:gap-6">
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-primary-600">
                  {onlineCount}
                </div>
                <div className="text-xs sm:text-sm text-gray-500">Online</div>
              </div>
              <div className="h-10 w-px bg-gray-200 hidden md:block" />
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-gray-900">
                  {components.length}
                </div>
                <div className="text-xs sm:text-sm text-gray-500">Total</div>
              </div>
              <div className="h-10 w-px bg-gray-200 hidden md:block" />
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-yellow-600">
                  {Math.round((onlineCount / components.length) * 100)}%
                </div>
                <div className="text-xs sm:text-sm text-gray-500">Health</div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {/* <div className="bg-gradient-to-r from-primary-50 to-blue-50 rounded-xl p-4 border border-primary-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-100 rounded-lg">
                <Icon icon="mdi:flash" className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-gray-600">
                  Power Consumption
                </p>
                <p className="text-base sm:text-lg font-semibold">12.4W</p>
              </div>
            </div>
          </div> */}

          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Icon
                  icon="mdi:check-circle"
                  className="w-5 h-5 text-green-600"
                />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-gray-600">
                  System Health
                </p>
                <p className="text-base sm:text-lg font-semibold">Excellent</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-4 border border-orange-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Icon
                  icon="mdi:alert-circle"
                  className="w-5 h-5 text-orange-600"
                />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-gray-600">
                  Active Alerts
                </p>
                <p className="text-base sm:text-lg font-semibold">0</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Component Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <AnimatePresence>
          {components.map((component) => (
            <ComponentCard
              key={component.id}
              component={component}
              isOnline={component.isOnline}
              onTogglePower={handleTogglePower}
              onConfigure={handleConfigure}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 flex flex-col items-center gap-4">
            <Icon
              icon="mdi:loading"
              className="w-8 h-8 text-primary-600 animate-spin"
            />
            <p className="text-gray-700">Processing request...</p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {components.length === 0 && (
        <div className="text-center py-12 sm:py-16">
          <div className="w-16 h-16 sm:w-24 sm:h-24 mx-auto mb-4 sm:mb-6 bg-gray-100 rounded-full flex items-center justify-center">
            <Icon
              icon="mdi:chip"
              className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400"
            />
          </div>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
            No Components Found
          </h3>
          <p className="text-gray-600 max-w-md mx-auto text-sm sm:text-base">
            Connect your hardware components to get started with monitoring and
            configuration.
          </p>
          <button className="mt-4 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm sm:text-base">
            <Icon icon="mdi:plus" className="inline mr-2 w-4 h-4" />
            Add Component
          </button>
        </div>
      )}

      {/* Configuration Modal */}
      <ConfigModal
        component={selectedComponent}
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        onSave={handleSaveConfig}
      />
    </main>
  );
}

export default Advanced;
