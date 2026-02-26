import { useEffect, useRef, useState } from "react";
import { Icon } from "@iconify/react";
import { useDevicesStore, useRealtimeStore } from "@/stores/useStore";
import { motion, AnimatePresence } from "framer-motion";
import { wsApi } from "@/api/ws-api";

const fallbackConfig = {
  FALL_DETECTION: {
    config: {
      enabled: true,
      fallAngleThreshold: 10.0,
      fallConfirmationDelay: 3000
    }
  },

  OBSTACLE_DETECTION: {
    config: {
      enabled: true,
      obstacleDistanceThreshold: 100.0,
      measurementInterval: 1000
    }
  },

  EDGE_DETECTION: {
    config: {
      enabled: true,
      edgeBeepMin: 400,
      edgeBeepMax: 708,
      edgeContinuous: 709,
      pointDownAngle: 30.0
    }
  },

  VOICE_ENGINE: {
    config: {
      enabled: true,
      volume: 0.3,
      speechSpeed: 150,
      voiceType: "en-f5"
    }
  },

  VISUAL_RECOGNITION: {
    config: {
      enabled: true,
      alertType: "COMBINED",
      recognitionInterval: 3000
    }
  },

  GPS_TRACKING: {
    config: {
      enabled: true
    }
  }
};
const DEVICE_COMPONENT_SCHEMA = {
  FALL_DETECTION: {
    enabled: true,
    config: {
      fallAngleThreshold: "fallAngleThreshold",
      fallConfirmationDelay: "fallConfirmationDelay"
    }
  },

  OBSTACLE_DETECTION: {
    enabled: true,
    config: {
      obstacleDistanceThreshold: "obstacleDistanceThreshold"
    }
  },

  EDGE_DETECTION: {
    enabled: true,
    config: {
      edgeBeepMin: "edgeBeepMin",
      edgeBeepMax: "edgeBeepMax",
      edgeContinuous: "edgeContinuous",
      pointDownAngle: "pointDownAngle"
    }
  },

  VOICE_ENGINE: {
    enabled: true,
    config: {
      volume: "volume",
      speechSpeed: "speechSpeed",
      voiceType: "voiceType"
    }
  },

  VISUAL_RECOGNITION: {
    enabled: true,
    config: {
      alertType: "alertType",
      recognitionInterval: "recognitionInterval"
    }
  },

  GPS_TRACKING: {
    enabled: true,
    config: {}
  }
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
    codeName: "FALL_DETECTION",
    type: "sensor",
    description: "Detect cane tilt and fall events",
    icon: "mdi:human-cane",
    configurable: true,
    configOptions: {
      fallAngleThreshold: [
        { label: "8° (Very Sensitive)", value: 8 },
        { label: "10° (Default)", value: 10 },
        { label: "15° (Stable Safety)", value: 15 },
        { label: "20° (Low Sensitivity)", value: 20 }
      ],

      fallConfirmationDelay: [
        { label: "2000 ms (Fast Alert)", value: 2000 },
        { label: "3000 ms (Default)", value: 3000 },
        { label: "5000 ms (Stable Confirmation)", value: 5000 }
      ]

      // buzzerPattern: [
      //   "Continuous Alarm",
      //   "Slow Pulse Alert",
      //   "Fast Pulse Alert",
      //   "Voice Alert Only"
      // ]
    }
  },
  {
    id: 2,
    name: "Obstacle Detection",
    codeName: "OBSTACLE_DETECTION",
    type: "sensor",
    description: "Front obstacle distance monitoring",
    icon: "mdi:radar",
    configurable: true,
    configOptions: {
      obstacleDistanceThreshold: [
        { label: "50 cm (High Safety)", value: 50 },
        { label: "100 cm (Default)", value: 100 },
        { label: "150 cm (Navigation Preview)", value: 150 },
        { label: "200 cm (Long Detection)", value: 200 }
      ],

      measurementInterval: [
        { label: "200 ms (Fast Scan)", value: 200 },
        { label: "300 ms (Default)", value: 300 },
        { label: "500 ms (Stable Scan)", value: 500 },
        { label: "1000 ms (Energy Saving)", value: 1000 }
      ]

      // buzzerResponsePattern: [
      //   "Continuous Warning",
      //   "Pulsing Warning",
      //   "Voice Guidance Only"
      // ]
    }
  },
  {
    id: 3,
    name: "Ground & Stair Safety",
    codeName: "EDGE_DETECTION",
    type: "sensor",
    description: "Detect stairs, holes, and dangerous ground elevation changes",
    icon: "mdi:stairs",
    configurable: true,
    configOptions: {
      stairSafetyDistance: [
        {
          label: "High Sensitivity (Maximum Safety)",
          value: 400,
          description: "Early warning — detect edge very far"
        },
        {
          label: "Medium Sensitivity (Recommended Default)",
          value: 500,
          description: "Balanced walking safety"
        },
        {
          label: "Low Sensitivity (Normal Walking)",
          value: 708,
          description: "Warning activates closer to edge"
        },
        {
          label: "Critical Sensitivity (Drop-off Alarm Mode)",
          value: 709,
          description: "Only trigger on potential hole or cliff"
        }
      ]
      // buzzerResponsePattern: [
      //   "Continuous Alert",
      //   "Pulsing Alert",
      //   "Adaptive Distance Tone",
      //   "Voice Guidance Only"
      // ]
    }
  },
  {
    id: 4,
    name: "Visual Recognition",
    codeName: "VISUAL_RECOGNITION",
    type: "sensor",
    description: "Real-time object recognition",
    icon: "mdi:eye",
    configurable: true,
    configOptions: {
      alertType: [
        { label: "Vibration Alert", value: "vibration" },
        { label: "Voice Guidance", value: "voice" },
        { label: "Combined Alert (Default)", value: "combined" }
      ],
      recognitionInterval: [
        { label: "3s (Fast)", value: 3000 },
        { label: "5s (Default)", value: 5000 },
        { label: "8s (Slow)", value: 8000 }
      ]
    }
  },
  {
    id: 5,
    name: "GPS Module",
    codeName: "GPS_MODULE",
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
    codeName: "ESP32_WROOM_32D",
    type: "controller",
    description: "Dual-core WiFi & Bluetooth MCU",
    icon: "mdi:chip",
    configurable: false
  },
  {
    id: 7,
    name: "Raspberry Pi 4",
    codeName: "RASPBERRY_PI_4",
    type: "controller",
    description: "Single-board computer",
    icon: "mdi:raspberry-pi",
    configurable: false
  }
];

// Voice Control Panel Component
const VoiceControlPanel = ({ isOnline, deviceConfig, onVoiceConfigChange }) => {
  const config = deviceConfig?.config ?? {};

  const speechSpeed = config.speechSpeed ?? 150;
  const voiceType = config.voiceType ?? "en+f5";
  const volume = config.volume ?? 0.3;

  const [isPlaying, setIsPlaying] = useState(false);
  const debounceRef = useRef(null);
  const [previewText, setPreviewText] = useState(
    "Hello, this is a voice preview"
  );

  const uiVolume = Math.round((volume || 0) * 100);
  const isMuted = uiVolume === 0;

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

  // useEffect(() => {
  //   if (!isOnline) return;

  //   if (debounceRef.current) {
  //     clearTimeout(debounceRef.current);
  //   }

  //   debounceRef.current = setTimeout(() => {
  //     onVoiceConfigChange?.({
  //       volume,
  //       speechSpeed,
  //       speakingVoice: selectedVoice,
  //       muted: isMuted
  //     });
  //   }, 600);

  //   return () => {
  //     if (debounceRef.current) {
  //       clearTimeout(debounceRef.current);
  //     }
  //   };
  // }, [volume, speechSpeed, selectedVoice, isMuted]);

  const handleVolumeChange = (e) => {
    const uiVolume = parseInt(e.target.value);

    onVoiceConfigChange?.({
      ...deviceConfig,
      config: {
        ...deviceConfig?.config,
        volume: uiVolume / 100
      }
    });
  };

  const handleSpeedChange = (e) => {
    const newSpeed = parseInt(e.target.value);

    onVoiceConfigChange?.({
      ...deviceConfig,
      config: {
        ...deviceConfig?.config,
        speechSpeed: newSpeed
      }
    });
  };
  const handleVoiceChange = (voiceId) => {
    onVoiceConfigChange?.({
      config: {
        ...deviceConfig?.config,
        voiceType: voiceId
      }
    });
  };

  const toggleMute = () => {
    const uiVolume = Math.round((volume || 0) * 100);

    const isCurrentlyMuted = uiVolume === 0;

    const newVolume = isCurrentlyMuted ? 75 : 0;

    onVoiceConfigChange?.({
      ...deviceConfig,
      config: {
        ...deviceConfig?.config,
        volume: newVolume / 100,
        muted: !isCurrentlyMuted
      }
    });
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
            {uiVolume}%
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
              value={uiVolume}
              onChange={handleVolumeChange}
              disabled={!isOnline}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: `linear-gradient(to right, #2563eb 0%, #2563eb ${uiVolume}%, #e5e7eb ${uiVolume}%, #e5e7eb 100%)`
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
                voiceType === voice.id
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

const ConfigModal = ({ component, deviceConfig, isOpen, onClose, onSave }) => {
  const [config, setConfig] = useState({});
  const [customRange, setCustomRange] = useState({ min: 2, max: 400 });

  useEffect(() => {
    if (!isOpen || !component) return;

    const schemaOptions = component?.configOptions || {};
    const storedConfig = deviceConfig.config || {};

    const hydrated = {};

    Object.entries(schemaOptions).forEach(([key, options]) => {
      const middlewareValue = storedConfig?.[key];

      const match = options.find(
        (o) => Number(o.value) === Number(middlewareValue)
      );

      hydrated[key] = match ? Number(match.value) : Number(options?.[0]?.value);
    });

    setConfig(hydrated);
  }, [isOpen, component, deviceConfig]);

  const handleSave = async () => {
    if (!component) return;

    await onSave({
      [component.codeName]: {
        ...deviceConfig?.[component.codeName],
        config: {
          ...deviceConfig?.[component.codeName]?.config,
          ...config
        }
      }
    });

    onClose?.();
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
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
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
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                min={customRange.min + 1}
                max="400"
              />
            </div>
          </div>

          <div className="mt-2 p-3 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-700">
              <strong>
                {customRange.min}cm - {customRange.max}cm
              </strong>
            </p>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col">
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
                <h3 className="text-lg font-semibold">
                  Configure {component.name}
                </h3>
                <p className="text-xs text-gray-500">{component.description}</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg"
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
                      value={config[key] ?? ""}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          [key]: Number(e.target.value)
                        }))
                      }
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg appearance-none bg-white pr-10"
                    >
                      {options.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )
            )}

            {renderCustomInput()}

            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-700">
                Configuration Note
              </p>
              <p className="text-xs text-gray-600 mt-1">
                Changes will take effect immediately.
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg"
            >
              Cancel
            </button>

            <button
              onClick={handleSave}
              className="flex-1 px-4 py-3 bg-primary-100 text-white rounded-lg hover:bg-primary-700"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Component Card (keep existing code)
const ComponentCard = ({
  component,
  deviceConfig,
  onTogglePower,
  onConfigure
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div
      layout
      className={`rounded-xl border-2 transition-all duration-300 hover:shadow-lg ${
        component.isOnline
          ? "border-primary-200 bg-gradient-to-br from-primary-50 to-white"
          : "border-gray-200 bg-white"
      }`}
    >
      <div className="p-3 sm:p-4 w-full">
        <div className="flex items-start justify-between mb-3 sm:mb-4">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-lg flex-shrink-0 ${
                component.isOnline
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
                component.isOnline ? "bg-green-500 animate-pulse" : "bg-red-500"
              }`}
            />
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`text-xs sm:text-sm font-medium ${
                  component.isOnline ? "text-green-600" : "text-red-600"
                }`}
              >
                {component.isOnline ? "Online" : "Offline"}
              </span>
              <span className="hidden sm:inline text-gray-400">•</span>
              <span className="text-xs text-gray-500">
                {component.isOnline ? "Connected" : "Disconnected"}
              </span>
            </div>
          </div>
          {component.configurable && (
            <button
              onClick={() => onTogglePower(component.codeName)}
              className={`px-3 py-2 sm:px-4 sm:py-2 rounded-lg flex items-center justify-center gap-2 transition-all text-sm font-medium ${
                deviceConfig.enabled
                  ? "bg-red-50 text-red-600 hover:bg-red-100 active:bg-red-200"
                  : "bg-green-50 text-green-600 hover:bg-green-100 active:bg-green-200"
              }`}
              aria-label={`${deviceConfig.enabled ? "Power off" : "Power on"} ${component.name}`}
            >
              <Icon
                icon={deviceConfig.enabled ? "mdi:power" : "mdi:power-off"}
                className="w-4 h-4"
              />
              <span className="hidden sm:inline">
                {deviceConfig.enabled ? "Power Off" : "Power On"}
              </span>
              <span className="inline sm:hidden">
                {deviceConfig.enabled ? "Off" : "On"}
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

const buildFullSnapshot = (globalConfig, deviceId) => {
  const components = Object.entries(DEVICE_COMPONENT_SCHEMA).map(
    ([codeName, schema]) => {
      const sourceComponent = globalConfig?.[codeName] || {};

      const component = {
        codeName,
        enabled: sourceComponent?.config?.enabled ?? schema.enabled ?? true,
        config: {}
      };

      Object.entries(schema.config).forEach(([_, firmwareKey]) => {
        const value =
          sourceComponent?.config?.[firmwareKey] ??
          globalConfig?.[firmwareKey] ??
          fallbackConfig?.[codeName]?.config?.[firmwareKey] ??
          0; // HARDWARE SAFE DEFAULT

        component.config[firmwareKey] = value;
      });

      return component;
    }
  );

  return {
    deviceId,
    configVersion: Date.now(),
    components
  };
};

function Advanced() {
  const [components, setComponents] = useState(componentsData);
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { componentHealth, deviceConfig, setDeviceConfig } = useRealtimeStore();
  const { selectedDevice } = useDevicesStore();

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

  const handleDeviceStateUpdate = async (partialUpdate = {}) => {
    if (!selectedDevice?.deviceSerialNumber) return;

    // setIsLoading(true);
    console.log("Partial Update:", partialUpdate);

    try {
      const fullConfig = {
        ...deviceConfig,
        ...partialUpdate
      };

      setDeviceConfig(fullConfig);

      const snapshot = buildFullSnapshot(
        fullConfig,
        selectedDevice.deviceSerialNumber
      );

      console.log("Updating device state with snapshot:", snapshot);

      // await wsApi.updateDeviceState(snapshot);
    } catch (error) {
      console.error("Update failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = (codeName) => {
    if (!deviceConfig?.[codeName]) return;

    const component = deviceConfig[codeName];

    handleDeviceStateUpdate({
      [codeName]: {
        ...component,
        config: {
          ...component.config,
          enabled: !component.config.enabled
        }
      }
    });
  };
  useEffect(() => {
    wsApi.emit("requestDeviceConfig");
  }, []);

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
          deviceConfig={deviceConfig["VOICE_ENGINE"] || {}}
          onVoiceConfigChange={(config) =>
            handleDeviceStateUpdate({
              components: {
                ...deviceConfig?.components,
                VOICE_ENGINE: {
                  ...deviceConfig?.components?.VOICE_ENGINE,
                  config: {
                    volume: config.volume,
                    speechSpeed: config.speechSpeed,
                    voiceType: config.voiceType
                  }
                }
              }
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
              deviceConfig={deviceConfig?.[component.codeName]?.config || {}}
              onTogglePower={handleToggle}
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
        deviceConfig={deviceConfig?.[selectedComponent?.codeName] || {}}
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        onSave={handleDeviceStateUpdate}
      />
    </main>
  );
}

export default Advanced;
