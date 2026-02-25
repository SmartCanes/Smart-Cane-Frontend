import { useEffect, useRef, useState } from "react";
import { Icon } from "@iconify/react";
import { useRealtimeStore } from "@/stores/useStore";
import { motion, AnimatePresence } from "framer-motion";
import { wsApi } from "@/api/ws-api";
import { interval } from "date-fns";

const DEVICE_CONFIG_SCHEMA = {
  fallAngleThreshold: "fallAngleThreshold",
  fallConfirmationDelay: "fallConfirmationDelay",
  obstacleDistanceThreshold: "obstacleDistanceThreshold",
  pointDownAngle: "pointDownAngle",
  edgeBeepMin: "edgeBeepMin",
  edgeBeepMax: "edgeBeepMax",
  edgeContinuous: "edgeContinuous",

  volume: "volumeLevel",
  speechSpeed: "speechSpeed",
  voiceType: "speakingVoice",

  enableFallDetection: "enableFallDetection",
  enableEdgeDetection: "enableEdgeDetection",
  enableObstacleDetection: "enableObstacleDetection",
  enableGPS: "enableGPS"
};

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
    name: "Fall Detection",
    type: "sensor",
    description: "Detect cane tilt and fall events",
    icon: "mdi:human-cane",
    configurable: true,
    configOptions: {
      fallAngleThreshold: [
        "8° (Very Sensitive)",
        "10° (Default)",
        "15° (Stable Safety)",
        "20° (Low Sensitivity)"
      ],

      fallConfirmationDelay: [
        "2000 ms (Fast Alert)",
        "3000 ms (Default)",
        "5000 ms (Stable Confirmation)"
      ],

      buzzerPattern: [
        "Continuous Alarm",
        "Slow Pulse Alert",
        "Fast Pulse Alert",
        "Voice Alert Only"
      ]
    }
  },
  {
    id: 2,
    name: "Obstacle Detection",
    type: "sensor",
    description: "Front obstacle distance monitoring",
    icon: "mdi:radar",
    configurable: true,
    configOptions: {
      detectionDistanceThreshold: [
        "50 cm (High Safety)",
        "100 cm (Default)",
        "150 cm (Navigation Preview)",
        "200 cm (Long Detection)"
      ],

      measurementInterval: [
        "200 ms (Fast Scan)",
        "300 ms (Default)",
        "500 ms (Stable Scan)",
        "1000 ms (Energy Saving)"
      ],

      buzzerResponsePattern: [
        "Continuous Warning",
        "Pulsing Warning",
        "Voice Guidance Only"
      ]
    }
  },
  {
    id: 3,
    name: "Ground & Stair Safety",
    type: "sensor",
    description: "Detect stairs, holes, and dangerous ground elevation changes",
    icon: "mdi:stairs",
    configurable: true,
    configOptions: {
      stairSafetyDistance: [
        "30 cm (Maximum Safety)",
        "50 cm (Recommended Default)",
        "70 cm (Normal Walking)",
        "100 cm (Long Preview Cane)"
      ],
      buzzerResponsePattern: [
        "Continuous Alert",
        "Pulsing Alert",
        "Adaptive Distance Tone",
        "Voice Guidance Only"
      ]
    }
  },
  {
    id: 4,
    name: "Visual Recognition",
    type: "sensor",
    description: "Real-time object recognition",
    icon: "mdi:eye",
    configurable: true,
    configOptions: {
      alertType: ["Audio Alert", "Vibration Alert", "Voice Guidance"],
      recognitionSensitivity: [
        "High (More False Positives)",
        "Medium (Balanced)",
        "Low (Fewer False Positives)"
      ],
      interval: ["3s (Fast)", "5s (Default)", "8s (Slow)"]
    }
  },
  {
    id: 5,
    name: "GPS Module",
    type: "sensor",
    description: "Global positioning system",
    icon: "mdi:satellite-variant",
    configurable: false
    // configOptions: {
    //   updateRate: ["1 Hz", "5 Hz", "10 Hz"],
    //   powerMode: ["Max Performance", "Eco", "Backup"],
    //   measurementRate: ["1 per second", "2 per second", "5 per second"]
    // }
  },
  {
    id: 6,
    name: "ESP32-WROOM-32D",
    type: "controller",
    description: "Dual-core WiFi & Bluetooth MCU",
    icon: "mdi:chip",
    configurable: false
  },
  {
    id: 7,
    name: "Raspberry Pi 4",
    type: "controller",
    description: "Single-board computer",
    icon: "mdi:raspberry-pi",
    configurable: false
  }
];

// Voice Control Panel Component
const VoiceControlPanel = ({ isOnline, onVoiceConfigChange }) => {
  const [volume, setVolume] = useState(75);
  const [speechSpeed, setSpeechSpeed] = useState(175);
  const [selectedVoice, setSelectedVoice] = useState("en-us");
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const debounceRef = useRef(null);
  const [previewText, setPreviewText] = useState(
    "Hello, this is a voice preview"
  );

  const voiceTypes = [
    {
      id: "en+f1",
      name: "Female Voice 1",
      icon: "mdi:microphone",
      gender: "female"
    },
    {
      id: "en+f2",
      name: "Female Voice 2",
      icon: "mdi:microphone",
      gender: "female"
    },
    {
      id: "en+f3",
      name: "Female Voice 3",
      icon: "mdi:microphone",
      gender: "female"
    },
    {
      id: "en+f4",
      name: "Female Voice 4",
      icon: "mdi:microphone",
      gender: "female"
    },
    {
      id: "en+f5",
      name: "Female Voice 5",
      icon: "mdi:microphone",
      gender: "female"
    },

    {
      id: "en+m1",
      name: "Male Voice 1",
      icon: "mdi:microphone",
      gender: "male"
    },
    {
      id: "en+m2",
      name: "Male Voice 2",
      icon: "mdi:microphone",
      gender: "male"
    },
    {
      id: "en+m3",
      name: "Male Voice 3",
      icon: "mdi:microphone",
      gender: "male"
    },
    {
      id: "en+m4",
      name: "Male Voice 4",
      icon: "mdi:microphone",
      gender: "male"
    },
    {
      id: "en+m5",
      name: "Male Voice 5",
      icon: "mdi:microphone",
      gender: "male"
    },
    {
      id: "en+m6",
      name: "Male Voice 6",
      icon: "mdi:microphone",
      gender: "male"
    },
    {
      id: "en+m7",
      name: "Male Voice 7",
      icon: "mdi:microphone",
      gender: "male"
    }
  ];

  useEffect(() => {
    if (!isOnline) return;

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      onVoiceConfigChange?.({
        volume,
        speechSpeed,
        speakingVoice: selectedVoice,
        muted: isMuted
      });
    }, 600);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [volume, speechSpeed, selectedVoice, isMuted]);

  const handleVolumeChange = (e) => {
    const newVolume = parseInt(e.target.value);
    setVolume(newVolume);
    if (newVolume === 0) {
      setIsMuted(true);
    } else {
      setIsMuted(false);
    }
    console.log("Volume changed:", newVolume);
  };

  const handleSpeedChange = (e) => {
    const newSpeed = parseInt(e.target.value);
    setSpeechSpeed(newSpeed);
    console.log("Speech speed changed:", newSpeed);
  };

  const handleVoiceChange = (voiceId) => {
    setSelectedVoice(voiceId);
    console.log("Voice type changed:", voiceId);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (!isMuted) {
      setVolume(0);
    } else {
      setVolume(75);
    }
    console.log("Mute toggled:", !isMuted);
  };

  const playPreview = () => {
    setIsPlaying(true);
    console.log("Playing preview:", previewText);
    setTimeout(() => setIsPlaying(false), 2000);
  };

  const getVolumeIcon = () => {
    if (isMuted || volume === 0) return "mdi:volume-off";
    if (volume < 30) return "mdi:volume-low";
    if (volume < 70) return "mdi:volume-medium";
    return "mdi:volume-high";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border-2 p-4 sm:p-6 ${
        isOnline
          ? "border-primary-200 bg-gradient-to-br from-primary-50/50 to-white"
          : "border-gray-200 bg-gray-50"
      }`}
    >
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div className="flex items-center gap-3">
          <div
            className={`p-2 sm:p-3 rounded-xl ${
              isOnline ? "bg-primary-100" : "bg-gray-200"
            }`}
          >
            <Icon
              icon="mdi:voice"
              className={`w-5 h-5 sm:w-6 sm:h-6 ${
                isOnline ? "text-primary-600" : "text-gray-500"
              }`}
            />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">
              Voice Control
            </h3>
            <p className="text-xs sm:text-sm text-gray-500">
              Adjust speech and audio settings
            </p>
          </div>
        </div>
        <div
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            isOnline
              ? "bg-green-100 text-green-700"
              : "bg-gray-100 text-gray-500"
          }`}
        >
          {isOnline ? "Active" : "Offline"}
        </div>
      </div>

      {/* Volume Control */}
      <div className="mb-5 sm:mb-6">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs sm:text-sm font-medium text-gray-700 flex items-center gap-2">
            <Icon icon="mdi:volume-high" className="w-4 h-4 text-gray-500" />
            Volume Level
          </label>
          <span className="text-xs sm:text-sm font-semibold text-primary-600 bg-primary-50 px-2 py-1 rounded">
            {volume}%
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={toggleMute}
            className={`p-2 rounded-lg transition-colors ${
              isMuted
                ? "bg-red-100 text-red-600"
                : "hover:bg-gray-100 text-gray-600"
            }`}
            aria-label={isMuted ? "Unmute" : "Mute"}
          >
            <Icon icon={getVolumeIcon()} className="w-5 h-5" />
          </button>
          <div className="flex-1 relative">
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={handleVolumeChange}
              disabled={!isOnline}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: `linear-gradient(to right, #2563eb 0%, #2563eb ${volume}%, #e5e7eb ${volume}%, #e5e7eb 100%)`
              }}
            />
          </div>
        </div>
      </div>

      {/* Speech Speed Control */}
      <div className="mb-5 sm:mb-6">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs sm:text-sm font-medium text-gray-700 flex items-center gap-2">
            <Icon icon="mdi:speedometer" className="w-4 h-4 text-gray-500" />
            Speech Speed
          </label>
          <span className="text-xs sm:text-sm font-semibold text-primary-600 bg-primary-50 px-2 py-1 rounded">
            {speechSpeed} WPM
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Icon icon="mdi:turtle" className="w-5 h-5 text-gray-400" />
          <input
            type="range"
            min="80"
            max="350"
            value={speechSpeed}
            onChange={handleSpeedChange}
            disabled={!isOnline}
            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: `linear-gradient(to right, #2563eb 0%, #2563eb ${((speechSpeed - 80) / (350 - 80)) * 100}%, #e5e7eb ${((speechSpeed - 80) / (350 - 80)) * 100}%, #e5e7eb 100%)`
            }}
          />
          <Icon icon="mdi:rabbit" className="w-5 h-5 text-gray-400" />
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1 px-2">
          <span>Slow</span>
          <span>Normal</span>
          <span>Fast</span>
        </div>
      </div>

      {/* Voice Type Selection */}
      <div className="mb-5 sm:mb-6">
        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-3">
          <div className="flex items-center gap-2">
            <Icon icon="mdi:account-voice" className="w-4 h-4 text-gray-500" />
            Voice Type
          </div>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {voiceTypes.map((voice) => (
            <button
              key={voice.id}
              onClick={() => handleVoiceChange(voice.id)}
              disabled={!isOnline}
              className={`p-2 sm:p-3 rounded-xl border-2 transition-all ${
                selectedVoice === voice.id
                  ? "border-primary-500 bg-primary-50 shadow-sm"
                  : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
              } ${!isOnline && "opacity-50 cursor-not-allowed"}`}
            >
              <div className="flex items-center gap-2">
                <Icon icon={voice.icon} />
                <div className="text-left">
                  <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                    {voice.name}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">
                    {voice.gender}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Preview Section */}
      <div className="bg-gray-50 rounded-xl p-3 sm:p-4 border border-gray-200">
        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
          Preview Text
        </label>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={previewText}
            onChange={(e) => setPreviewText(e.target.value)}
            disabled={!isOnline}
            placeholder="Enter text to preview..."
            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50"
          />
          <button
            onClick={playPreview}
            disabled={!isOnline || isPlaying}
            className={`px-4 py-2 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-all ${
              isPlaying
                ? "bg-green-500 text-white"
                : "bg-primary-600 text-white hover:bg-primary-700"
            } ${(!isOnline || isPlaying) && "opacity-50 cursor-not-allowed"}`}
          >
            <Icon
              icon={isPlaying ? "mdi:loading" : "mdi:play"}
              className={`w-4 h-4 ${isPlaying ? "animate-spin" : ""}`}
            />
            {isPlaying ? "Playing..." : "Preview"}
          </button>
        </div>
      </div>

      {/* Status Bar */}
      <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <Icon icon="mdi:check-circle" className="w-4 h-4 text-green-500" />
          <span>Connected to audio device</span>
        </div>
        <div className="flex items-center gap-1">
          <Icon icon="mdi:microphone" className="w-4 h-4 text-gray-400" />
          <span>Speech ready</span>
        </div>
      </div>
    </motion.div>
  );
};

// Config Modal (keep existing code)
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
    await onSave({
      componentId: component.id,
      config: {
        ...config,
        voice: {
          volume,
          speed: speechSpeed,
          type: selectedVoice,
          muted: isMuted
        }
      }
    });
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

// Component Card (keep existing code)
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
      <div className="p-3 sm:p-4 w-full">
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
              <p className="text-xs text-gray-500 ">{component.description}</p>
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
          {component.configurable && (
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
              <span className="inline sm:hidden">
                {isOnline ? "Off" : "On"}
              </span>
            </button>
          )}
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

  const handleConfigure = (component) => {
    setSelectedComponent(component);
    setIsConfigModalOpen(true);
  };

  const handleDeviceStateUpdate = async (partialState) => {
    setIsLoading(true);

    try {
      await wsApi.updateDeviceState({
        timestamp: new Date().toISOString(),
        ...partialState
      });

      console.log("Device state updated");
    } catch (error) {
      console.error("Device state update failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const volumeToMiddlewareScale = (v) => {
    return Math.max(0, Math.min(1, v / 100));
  };

  const normalizeConfigPayload = (localConfig) => {
    return {
      fallAngleThreshold: parseFloat(localConfig.fallAngleThreshold) || 10.0,

      fallConfirmationDelay:
        parseInt(localConfig.fallConfirmationDelay) || 3000,

      obstacleDistanceThreshold:
        parseFloat(localConfig.obstacleDistanceThreshold) || 100.0,

      pointDownAngle: parseFloat(localConfig.pointDownAngle) || 30.0,

      edgeBeepMin: parseInt(localConfig.edgeBeepMin) || 400,

      edgeBeepMax: parseInt(localConfig.edgeBeepMax) || 708,

      edgeContinuous: parseInt(localConfig.edgeContinuous) || 709,

      volumeLevel: volumeToMiddlewareScale(localConfig.volume ?? 0.3),

      speechSpeed: localConfig.speechSpeed ?? 150,

      speakingVoice: localConfig.speakingVoice || "f5",

      enableFallDetection: Boolean(localConfig.enableFallDetection),

      enableEdgeDetection: Boolean(localConfig.enableEdgeDetection),

      enableObstacleDetection: Boolean(localConfig.enableObstacleDetection),

      enableGPS: Boolean(localConfig.enableGPS)
    };
  };

  const handleSaveConfig = async (payload) => {
    setIsLoading(true);

    try {
      const normalizedConfig = normalizeConfigPayload(payload.config);

      await wsApi.saveDeviceConfig({
        componentId: payload.componentId,
        config: normalizedConfig
      });

      console.log("Configuration saved");
    } catch (error) {
      console.error("Config save failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const onlineCount = components.filter((c) => c.isOnline).length;

  return (
    <main className="bg-white md:bg-[#f9fafb] rounded-t-[32px] md:rounded-none min-h-[calc(100vh-var(--header-height)-var(--mobile-nav-height))] md:min-h-[calc(100vh-var(--header-height))] md:max-h-[calc(100vh-var(--header-height))] overflow-y-visible md:overflow-y-auto p-6 pb-[calc(var(--mobile-nav-height)+1.5rem)] md:pb-6 overflow-x-hidden">
      <div className="mx-auto w-full space-y-4 sm:space-y-6 ">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4 sm:mb-8">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 font-poppins">
              Component Management
            </h2>
            <p className="text-gray-500 text-xs md:text-sm">
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

        {/* Voice Control Panel */}
        <VoiceControlPanel
          isOnline={onlineCount > 0 || true}
          onVoiceConfigChange={(config) =>
            handleDeviceStateUpdate({
              voiceConfig: config
            })
          }
        />
      </div>

      {/* Component Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 mt-6 overflow-hidden">
        <AnimatePresence>
          {components.map((component) => (
            <ComponentCard
              key={component.id}
              component={component}
              isOnline={component.isOnline}
              onTogglePower={() =>
                handleDeviceStateUpdate({
                  componentId: component.id,
                  power: !component.isOnline
                })
              }
              onConfigure={handleConfigure}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Loading Overlay */}
      {/* {isLoading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 flex flex-col items-center gap-4">
            <Icon
              icon="mdi:loading"
              className="w-8 h-8 text-primary-600 animate-spin"
            />
            <p className="text-gray-700">Processing request...</p>
          </div>
        </div>
      )} */}

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
