import { useEffect, useRef, useState } from "react";
import { Icon } from "@iconify/react";
import { useDevicesStore, useRealtimeStore } from "@/stores/useStore";
import { motion, AnimatePresence } from "framer-motion";
import { wsApi } from "@/api/ws-api";
import BluetoothManager from "@/ui/components/BluetoothManager";
import { useToast } from "@/context/ToastContext";

const POWER_OVERRIDE_ENABLED =
  String(import.meta.env.VITE_OVERRIDE).toLowerCase() === "true";

const fallbackConfig = {
  FALL_DETECTION: {
    enabled: true,
    config: {
      fallConfirmationDelay: 3000
    }
  },

  OBSTACLE_DETECTION: {
    enabled: true,
    config: {
      obstacleDistanceThreshold: 300.0,
      obstacleFeedbackPattern: 0
    }
  },

  EDGE_DETECTION: {
    enabled: true,
    config: {
      stairSafetyDistance: 300
    }
  },

  VOICE_ENGINE: {
    enabled: true,
    config: {
      volume: 0.3,
      speechSpeed: 150,
      navigation: {
        voice: "default",
        volume: 0.3,
        speechSpeed: 150
      },
      visualRecognition: {
        voice: "default",
        language: "english",
        volume: 0.3,
        speechSpeed: 150
      },
      textToSpeech: {
        voice: "default",
        volume: 0.3,
        speechSpeed: 150
      }
    }
  },

  VISUAL_RECOGNITION: {
    enabled: true,
    config: {
      recognitionInterval: 3000
    }
  },

  EMERGENCY_SYSTEM: {
    config: {
      emergencyTrigger: 3000,
      emergencyBuzzerDuration: 60000,
      emergencyBuzzerPattern: 100
    }
  },

  GPS_TRACKING: {
    enabled: true,
    config: {}
  }
};

const PI_COMPONENT_KEYS = ["VOICE_ENGINE", "VISUAL_RECOGNITION"];

const DEVICE_COMPONENT_SCHEMA = {
  FALL_DETECTION: {
    enabled: true,
    config: {
      fallConfirmationDelay: "fallConfirmationDelay"
    }
  },

  OBSTACLE_DETECTION: {
    enabled: true,
    config: {
      obstacleDistanceThreshold: "obstacleDistanceThreshold",
      obstacleFeedbackPattern: "obstacleFeedbackPattern"
    }
  },

  EDGE_DETECTION: {
    enabled: true,
    config: {
      stairSafetyDistance: "stairSafetyDistance"
    }
  },

  EMERGENCY_SYSTEM: {
    config: {
      emergencyTrigger: "emergencyTrigger",
      emergencyBuzzerDuration: "emergencyBuzzerDuration",
      emergencyBuzzerPattern: "emergencyBuzzerPattern"
    }
  }
};

const componentIdMap = {
  1: "accelerometerStatus",
  2: "obstacleDetectionStatus",
  3: "edgeDetectionStatus",
  4: "raspberryPiStatus",
  5: "esp32Status",
  6: "gpsStatus"
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
      fallConfirmationDelay: [
        { label: "3s (Default)", value: 3000 },
        { label: "2s (Fast Alert)", value: 2000 },
        { label: "5s (Stable Confirmation)", value: 5000 }
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
        { label: "Medium Sensitivity (Default)", value: 150 },
        { label: "High Sensitivity", value: 200 },
        { label: "Low Sensitivity", value: 100 }
      ],
      obstacleFeedbackPattern: [
        { label: "Continuous (Default)", value: 0 },
        { label: "Pulsing Pattern", value: 1 }
        // { label: "Buzzer Pattern", value: 2 }
      ]

      // measurementInterval: [
      //   { label: "200 ms (Fast Scan)", value: 200 },
      //   { label: "300 ms (Default)", value: 300 },
      //   { label: "500 ms (Stable Scan)", value: 500 },
      //   { label: "1000 ms (Energy Saving)", value: 1000 }
      // ]

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
          label: "High Sensitivity (Default)",
          value: 300,
          description: "Balanced walking safety"
        },
        {
          label: "Medium Sensitivity",
          value: 330,
          description: "Warning activates closer to edge"
        },
        {
          label: "Low Sensitivity",
          value: 350,
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
      recognitionInterval: [
        { label: "3s (Fast Default)", value: 3000 },
        { label: "5s (Medium)", value: 5000 },
        { label: "8s (Slow)", value: 8000 }
      ]
    }
  },
  {
    id: 5,
    name: "Emergency System",
    codeName: "EMERGENCY_SYSTEM",
    type: "sensor",
    description:
      "Automated emergency response with customizable alert patterns",
    icon: "mdi:alert-decagram",
    configurable: true,
    configOptions: {
      emergencyTrigger: [
        { label: "3 seconds (Default)", value: 3000 },
        { label: "1 second (Fast Response)", value: 1000 },
        { label: "5 seconds (Extended Confirmation)", value: 5000 }
      ],
      emergencyBuzzerDuration: [
        { label: "60 seconds (Default)", value: 60000 },
        { label: "30 seconds (Short Alert)", value: 30000 },
        { label: "120 seconds (Extended Alert)", value: 120000 },
        { label: "No Timeout (Indefinite)", value: 100000000 }
      ],
      emergencyBuzzerPattern: [
        { label: "Normal (Default)", value: 100 },
        { label: "Continuous (Maximum Urgency)", value: 0 },
        { label: "Long Pulse", value: 2000 }
      ]
    }
  },
  {
    id: 6,
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
  }
];

const VoiceControlPanel = ({
  isOnline,
  deviceConfig,
  onVoiceConfigChange,
  onPreviewVoice
}) => {
  const initialConfig = deviceConfig?.config ?? {};
  const [activeVoiceType, setActiveVoiceType] = useState("navigation");
  const [previewText, setPreviewText] = useState(
    "This is a voice preview test."
  );
  const [isSendingPreview, setIsSendingPreview] = useState(false);

  const espeakVoices = [
    { id: "default", name: "Default", type: "default" },
    { id: "+m1", name: "Male 1", type: "male" },
    { id: "+m2", name: "Male 2", type: "male" },
    { id: "+m3", name: "Male 3", type: "male" },
    { id: "+m4", name: "Male 4", type: "male" },
    { id: "+m5", name: "Male 5", type: "male" },
    { id: "+m6", name: "Male 6", type: "male" },
    { id: "+m7", name: "Male 7", type: "male" },
    { id: "+f1", name: "Female 1", type: "female" },
    { id: "+f2", name: "Female 2", type: "female" },
    { id: "+f3", name: "Female 3", type: "female" },
    { id: "+f4", name: "Female 4", type: "female" },
    { id: "+f5", name: "Female 5", type: "female" }
  ];

  const [localConfig, setLocalConfig] = useState({
    volume: initialConfig.volume ?? 0.3,
    speechSpeed: initialConfig.speechSpeed ?? 150,
    muted: initialConfig.muted ?? false,
    navigation: initialConfig.navigation ?? {
      voice: "default",
      volume: 0.3,
      speechSpeed: 150
    },
    visualRecognition: initialConfig.visualRecognition ?? {
      voice: "default",
      language: "english",
      volume: 0.3,
      speechSpeed: 150
    },
    textToSpeech: initialConfig.textToSpeech ?? {
      voice: "default",
      volume: 0.3,
      speechSpeed: 150
    }
  });

  const debounceRef = useRef(null);
  const isFirstRenderRef = useRef(true);

  useEffect(() => {
    setLocalConfig({
      volume: deviceConfig?.config?.volume ?? 0.3,
      speechSpeed: deviceConfig?.config?.speechSpeed ?? 150,
      muted: deviceConfig?.config?.muted ?? false,
      navigation: deviceConfig?.config?.navigation ?? {
        voice: "default",
        volume: 0.3,
        speechSpeed: 150
      },
      visualRecognition: deviceConfig?.config?.visualRecognition ?? {
        voice: "default",
        language: "english",
        volume: 0.3,
        speechSpeed: 150
      },
      textToSpeech: deviceConfig?.config?.textToSpeech ?? {
        voice: "default",
        volume: 0.3,
        speechSpeed: 150
      }
    });
  }, [
    deviceConfig?.config?.volume,
    deviceConfig?.config?.speechSpeed,
    deviceConfig?.config?.muted,
    deviceConfig?.config?.navigation,
    deviceConfig?.config?.visualRecognition,
    deviceConfig?.config?.textToSpeech
  ]);

  useEffect(() => {
    if (!isOnline) return;

    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      return;
    }

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      onVoiceConfigChange?.({
        ...deviceConfig,
        enabled: deviceConfig?.enabled ?? true,
        config: {
          ...deviceConfig?.config,
          volume: localConfig.volume,
          speechSpeed: localConfig.speechSpeed,
          muted: localConfig.muted,
          navigation: localConfig.navigation,
          visualRecognition: localConfig.visualRecognition,
          textToSpeech: localConfig.textToSpeech
        }
      });
    }, 500);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [
    localConfig.volume,
    localConfig.speechSpeed,
    localConfig.muted,
    localConfig.navigation,
    localConfig.visualRecognition,
    localConfig.textToSpeech,
    isOnline,
    deviceConfig,
    onVoiceConfigChange
  ]);

  const speechMin = 80;
  const speechMax = 250;
  const speechSpeed = localConfig.speechSpeed ?? 150;
  const volume = localConfig.volume ?? 0.3;
  const uiVolume = Math.round((volume || 0) * 100);
  const isMuted = uiVolume === 0 || Boolean(localConfig.muted);
  const speechPercent =
    ((speechSpeed - speechMin) / (speechMax - speechMin)) * 100;

  const handleVolumeChange = (e) => {
    const nextUiVolume = Number.parseInt(e.target.value, 10);

    setLocalConfig((prev) => ({
      ...prev,
      volume: nextUiVolume / 100,
      muted: nextUiVolume === 0
    }));
  };

  const handleSpeedChange = (e) => {
    const nextSpeed = Number.parseInt(e.target.value, 10);

    setLocalConfig((prev) => ({
      ...prev,
      speechSpeed: nextSpeed
    }));
  };

  const toggleMute = () => {
    setLocalConfig((prev) => {
      const currentUiVolume = Math.round((prev.volume || 0) * 100);
      const currentlyMuted = currentUiVolume === 0 || Boolean(prev.muted);

      return {
        ...prev,
        volume: currentlyMuted ? 0.3 : 0,
        muted: !currentlyMuted
      };
    });
  };

  const getVolumeIcon = () => {
    if (isMuted || volume === 0) return "mdi:volume-off";
    if (uiVolume < 30) return "mdi:volume-low";
    if (uiVolume < 70) return "mdi:volume-medium";
    return "mdi:volume-high";
  };

  const voiceTypes = [
    { id: "navigation", label: "Routing", icon: "mdi:navigation-variant" },
    { id: "visualRecognition", label: "Visual Recognition", icon: "mdi:eye" },
    {
      id: "textToSpeech",
      label: "TTS Notes",
      icon: "mdi:text-to-speech"
    }
  ];

  const currentVoiceConfig = localConfig[activeVoiceType] || {
    voice: "default",
    language: "english",
    volume: 0.3,
    speechSpeed: 150
  };
  const isVisualRecognition = activeVoiceType === "visualRecognition";
  const selectedLanguage = (
    currentVoiceConfig?.language || "english"
  ).toLowerCase();
  const isTagalogSelected =
    isVisualRecognition && selectedLanguage === "tagalog";
  const currentVoiceVolume = Math.round(
    (currentVoiceConfig?.volume ?? 0.3) * 100
  );
  const currentSpeechPercent =
    (((currentVoiceConfig?.speechSpeed ?? 150) - speechMin) /
      (speechMax - speechMin)) *
    100;

  const handleVoiceTypeChange = (field, value) => {
    setLocalConfig((prev) => ({
      ...prev,
      [activeVoiceType]: {
        ...prev[activeVoiceType],
        [field]: value
      }
    }));
  };

  const getVoiceIcon = (type) => {
    if (type === "male") return "mdi:face-man";
    if (type === "female") return "mdi:face-woman";
    return "mdi:account-voice";
  };

  const getSliderFill = (percent) => ({
    background: `linear-gradient(to right, #2563eb 0%, #2563eb ${percent}%, #e5e7eb ${percent}%, #e5e7eb 100%)`
  });

  const handlePreviewVoice = async () => {
    if (!isOnline || isSendingPreview) return;

    const message = previewText.trim();
    if (!message) return;

    setIsSendingPreview(true);

    try {
      await onPreviewVoice?.({
        message,
        voiceType: activeVoiceType,
        voiceConfig: {
          voice: currentVoiceConfig?.voice || "default",
          language: currentVoiceConfig?.language || "english",
          volume: currentVoiceConfig?.volume ?? localConfig.volume ?? 0.3,
          speechSpeed:
            currentVoiceConfig?.speechSpeed ?? localConfig.speechSpeed ?? 150,
          muted: isMuted
        }
      });
    } finally {
      setIsSendingPreview(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-3xl border-2 p-4 sm:p-6 lg:p-7 ${
        isOnline
          ? "border-primary-200 bg-gradient-to-br from-primary-50 via-white to-primary-50/30"
          : "border-gray-200 bg-gray-50"
      }`}
    >
      <div className="mb-5 flex flex-col gap-3 sm:mb-7 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-3 sm:gap-4">
          <div
            className={`rounded-2xl p-2.5 sm:p-3 ${
              isOnline
                ? "bg-primary-100 text-white shadow-sm"
                : "bg-gray-200 text-gray-500"
            }`}
          >
            <Icon icon="mdi:voice" className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>

          <div>
            <h3 className="text-base font-semibold text-gray-900 sm:text-lg">
              Voice Control
            </h3>
            <p className="text-xs text-gray-500 sm:text-sm">
              Configure general voice behavior and per-feature preferences
            </p>
          </div>
        </div>

        <div
          className={`inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
            isOnline
              ? "bg-green-100 text-green-700"
              : "bg-gray-100 text-gray-500"
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              isOnline ? "bg-green-500" : "bg-gray-400"
            }`}
          />
          {isOnline ? "Active" : "Offline"}
        </div>
      </div>

      <div className="mb-6 rounded-2xl border border-primary-100 bg-white/80 p-4 sm:mb-7 sm:p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h4 className="text-sm font-semibold text-gray-900 sm:text-base">
            General Voice Configuration
          </h4>
          <span className="rounded-full bg-primary-50 px-2.5 py-1 text-[11px] font-medium text-primary-700 sm:text-xs">
            Applies to all voice features
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-gray-200 bg-white p-3 sm:p-4">
            <div className="mb-2 flex items-center justify-between gap-2">
              <label className="flex items-center gap-2 text-xs font-medium text-gray-700 sm:text-sm">
                <Icon
                  icon="mdi:volume-high"
                  className="h-4 w-4 text-gray-500"
                />
                Volume Level
              </label>
              <span className="rounded-md bg-primary-50 px-2 py-1 text-xs font-semibold text-primary-600">
                {uiVolume}%
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={toggleMute}
                disabled={!isOnline}
                className={`rounded-lg p-2 transition-colors ${
                  isMuted
                    ? "bg-red-100 text-red-600"
                    : "text-gray-600 hover:bg-gray-100"
                } disabled:cursor-not-allowed disabled:opacity-50`}
                aria-label={isMuted ? "Unmute" : "Mute"}
              >
                <Icon icon={getVolumeIcon()} className="h-5 w-5" />
              </button>

              <input
                type="range"
                min="0"
                max="100"
                value={uiVolume}
                onChange={handleVolumeChange}
                disabled={!isOnline}
                className="h-2 w-full appearance-none rounded-lg bg-gray-200 accent-primary-600 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                style={getSliderFill(uiVolume)}
              />
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-3 sm:p-4">
            <div className="mb-2 flex items-center justify-between gap-2">
              <label className="flex items-center gap-2 text-xs font-medium text-gray-700 sm:text-sm">
                <Icon
                  icon="mdi:speedometer"
                  className="h-4 w-4 text-gray-500"
                />
                Speech Speed
              </label>
              <span className="rounded-md bg-primary-50 px-2 py-1 text-xs font-semibold text-primary-600">
                {speechSpeed} WPM
              </span>
            </div>

            <div className="flex items-center gap-3">
              <Icon icon="mdi:turtle" className="h-5 w-5 text-gray-400" />
              <input
                type="range"
                min={speechMin}
                max={speechMax}
                value={speechSpeed}
                onChange={handleSpeedChange}
                disabled={!isOnline}
                className="h-2 w-full appearance-none rounded-lg bg-gray-200 accent-primary-600 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                style={getSliderFill(speechPercent)}
              />
              <Icon icon="mdi:rabbit" className="h-5 w-5 text-gray-400" />
            </div>

            <div className="mt-1 flex justify-between px-1 text-[11px] text-gray-500 sm:text-xs">
              <span>Slow</span>
              <span>Normal</span>
              <span>Fast</span>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5">
        <div className="mb-4 flex items-center justify-between gap-2">
          <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-900 sm:text-base">
            <Icon icon="mdi:account-voice" className="h-4 w-4 text-gray-500" />
            Function-Specific Voice Profiles
          </h4>
          <span className="text-[11px] text-gray-500 sm:text-xs">
            Fine-tune each function
          </span>
        </div>

        <div className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
          {voiceTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => setActiveVoiceType(type.id)}
              disabled={!isOnline}
              className={`flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-xs font-medium transition-all cursor-pointer sm:text-sm ${
                activeVoiceType === type.id
                  ? "bg-primary-100 text-white shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              } disabled:cursor-not-allowed disabled:opacity-50`}
            >
              <Icon icon={type.icon} className="w-4 h-4" />
              <span className="text-center leading-tight">{type.label}</span>
            </button>
          ))}
        </div>

        <div className="space-y-4 rounded-xl bg-gray-50 p-3 sm:p-4">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-medium text-gray-700 sm:text-sm">
              Active Function
            </p>
            <span className="rounded-md bg-white px-2 py-1 text-xs font-semibold text-gray-700">
              {voiceTypes.find((type) => type.id === activeVoiceType)?.label}
            </span>
          </div>

          <div>
            {isVisualRecognition && (
              <div className="mb-4">
                <label className="mb-2 block text-xs font-medium text-gray-700">
                  Language
                </label>

                <div className="grid grid-cols-2 gap-2">
                  {["english", "tagalog"].map((language) => {
                    const isSelected = selectedLanguage === language;

                    return (
                      <button
                        key={language}
                        type="button"
                        onClick={() =>
                          handleVoiceTypeChange("language", language)
                        }
                        disabled={!isOnline}
                        className={`rounded-lg border px-3 py-2 text-xs font-medium capitalize transition-all cursor-pointer sm:text-sm ${
                          isSelected
                            ? "bg-primary-100 text-white border-primary-600"
                            : "bg-white text-gray-700 border-gray-300 hover:border-primary-300"
                        } disabled:cursor-not-allowed disabled:opacity-50`}
                      >
                        {language}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <label className="mb-2 block text-xs font-medium text-gray-700">
              Voice Selection
            </label>

            {isTagalogSelected && (
              <p className="mb-2 text-xs text-amber-700">
                Voice selection is only available for English.
              </p>
            )}

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
              {espeakVoices.map((voice) => (
                <button
                  key={voice.id}
                  onClick={() => handleVoiceTypeChange("voice", voice.id)}
                  disabled={!isOnline || isTagalogSelected}
                  className={`flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-xs transition-all cursor-pointer ${
                    currentVoiceConfig?.voice === voice.id
                      ? "bg-primary-100 text-white border-primary-600"
                      : "bg-white text-gray-700 border-gray-300 hover:border-primary-300"
                  } disabled:cursor-not-allowed disabled:opacity-50`}
                >
                  <Icon
                    icon={getVoiceIcon(voice.type)}
                    className="w-3.5 h-3.5"
                  />
                  {voice.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-xs font-medium text-gray-700">
                Volume
              </label>
              <span className="rounded bg-white px-2 py-1 text-xs font-semibold text-primary-600">
                {currentVoiceVolume}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={currentVoiceVolume}
              onChange={(e) =>
                handleVoiceTypeChange(
                  "volume",
                  Number.parseInt(e.target.value, 10) / 100
                )
              }
              disabled={!isOnline}
              className="h-2 w-full appearance-none rounded-lg bg-gray-200 accent-primary-600 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
              style={getSliderFill(currentVoiceVolume)}
            />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-xs font-medium text-gray-700">
                Speech Speed
              </label>
              <span className="rounded bg-white px-2 py-1 text-xs font-semibold text-primary-600">
                {currentVoiceConfig?.speechSpeed ?? 150} WPM
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Icon icon="mdi:turtle" className="w-4 h-4 text-gray-400" />
              <input
                type="range"
                min={speechMin}
                max={speechMax}
                value={currentVoiceConfig?.speechSpeed ?? 150}
                onChange={(e) =>
                  handleVoiceTypeChange(
                    "speechSpeed",
                    Number.parseInt(e.target.value, 10)
                  )
                }
                disabled={!isOnline}
                className="h-2 flex-1 appearance-none rounded-lg bg-gray-200 accent-primary-600 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                style={getSliderFill(currentSpeechPercent)}
              />
              <Icon icon="mdi:rabbit" className="w-4 h-4 text-gray-400" />
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-3 sm:p-4">
            <div className="mb-2 flex items-center justify-between gap-2">
              <label className="text-xs font-medium text-gray-700 sm:text-sm">
                Voice Preview
              </label>
              <span className="rounded-md bg-primary-50 px-2 py-1 text-[11px] font-medium text-primary-700 sm:text-xs">
                Test current selection
              </span>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                type="text"
                value={previewText}
                onChange={(e) => setPreviewText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handlePreviewVoice();
                  }
                }}
                disabled={!isOnline || isSendingPreview}
                maxLength={180}
                placeholder="Type text to test selected voice"
                className="h-10 flex-1 rounded-lg border border-gray-300 px-3 text-xs text-gray-700 outline-none transition focus:border-primary-300 sm:text-sm disabled:cursor-not-allowed disabled:opacity-50"
              />

              <button
                type="button"
                onClick={handlePreviewVoice}
                disabled={!isOnline || isSendingPreview || !previewText.trim()}
                className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg bg-primary-100 px-3 text-xs font-medium text-white transition hover:bg-primary-700 sm:text-sm disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Icon icon="mdi:play" className="h-4 w-4" />
                {isSendingPreview ? "Sending..." : "Test Voice"}
              </button>
            </div>

            <p className="mt-2 text-[11px] text-gray-500 sm:text-xs">
              Sends a preview event using the active voice profile.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const ConfigModal = ({
  component,
  deviceConfig,
  isOpen,
  isSaving,
  onClose,
  onSave
}) => {
  const [config, setConfig] = useState({});
  const [customRange, setCustomRange] = useState({ min: 2, max: 400 });
  const [openDropdown, setOpenDropdown] = useState(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !component) return;

    const schemaOptions = component.configOptions || {};
    const storedConfig = deviceConfig?.config || {};
    const hydrated = {};

    Object.entries(schemaOptions).forEach(([key, options]) => {
      const currentValue = storedConfig?.[key];

      const match = options.find(
        (o) => Number(o.value) === Number(currentValue)
      );

      hydrated[key] = match ? Number(match.value) : Number(options?.[0]?.value);
    });

    setConfig(hydrated);
    setOpenDropdown(null);
  }, [isOpen, component?.codeName]);

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e) => {
      if (isSaving) return;

      if (e.key === "Escape") {
        if (openDropdown) {
          setOpenDropdown(null);
          return;
        }

        onClose?.();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, isSaving, openDropdown, onClose]);

  const handleSave = async () => {
    if (!component || isSaving) return;

    const saved = await onSave({
      [component.codeName]: {
        ...deviceConfig,
        config: {
          ...deviceConfig?.config,
          ...config
        }
      }
    });

    if (saved) {
      onClose?.();
    }
  };

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
                    min: Math.max(2, parseInt(e.target.value, 10) || 2)
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
                    max: Math.min(400, parseInt(e.target.value, 10) || 400)
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
    <AnimatePresence mode="wait">
      {isOpen && component && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <motion.div
            key="config-modal-overlay"
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => {
              if (!isSaving) onClose?.();
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-visible flex flex-col mx-5"
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.2 }}
            >
              <div className="p-4 sm:p-6 flex-1 overflow-visible min-w-0">
                <div className="flex items-start justify-between gap-3 mb-4 sm:mb-6 min-w-0">
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className="p-2 bg-primary-100 rounded-lg flex-shrink-0">
                      <Icon
                        icon={component.icon}
                        className="w-5 h-5 text-white"
                      />
                    </div>

                    <div className="min-w-0">
                      <h3 className="text-lg font-semibold break-words">
                        Configure {component.name}
                      </h3>
                      <p className="text-xs text-gray-500 break-words">
                        {component.description}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={onClose}
                    disabled={isSaving}
                    className="p-2 rounded-lg flex-shrink-0 cursor-pointer transition hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Icon icon="mdi:close" className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                <div className="space-y-4 sm:space-y-6 min-w-0">
                  {Object.entries(component.configOptions || {}).map(
                    ([key, options]) => (
                      <div key={key} className="min-w-0">
                        <label className="block text-sm font-medium text-gray-700 mb-2 capitalize break-words">
                          {key.replace(/([A-Z])/g, " $1").trim()}
                        </label>

                        <div className="relative min-w-0">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenDropdown((prev) =>
                                prev === key ? null : key
                              );
                            }}
                            className="relative w-full min-w-0 px-3 py-2.5 text-sm border border-gray-300 rounded-lg bg-white pr-10 text-left cursor-pointer transition hover:border-gray-400 hover:bg-gray-50"
                          >
                            <span className="block truncate pr-2 text-xs sm:text-sm">
                              {options.find(
                                (option) =>
                                  Number(option.value) === Number(config[key])
                              )?.label || options?.[0]?.label}
                            </span>

                            <Icon
                              icon="mdi:chevron-down"
                              className={`pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 transition-transform ${
                                openDropdown === key ? "rotate-180" : ""
                              }`}
                            />
                          </button>

                          {openDropdown === key && (
                            <div
                              onClick={(e) => e.stopPropagation()}
                              className="absolute left-0 right-0 top-full mt-2 z-[60] max-h-60 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg"
                            >
                              {options.map((option) => {
                                const isSelected =
                                  Number(config[key]) === Number(option.value);

                                return (
                                  <button
                                    key={option.value}
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setConfig((prev) => ({
                                        ...prev,
                                        [key]: Number(option.value)
                                      }));
                                      setOpenDropdown(null);
                                    }}
                                    className={`w-full px-3 py-2 text-xs sm:text-sm text-left flex items-start justify-between gap-2 cursor-pointer transition hover:bg-gray-50 ${
                                      isSelected
                                        ? "bg-primary-50 text-primary-700 font-medium"
                                        : "text-gray-700"
                                    }`}
                                  >
                                    <span className="break-words">
                                      {option.label}
                                    </span>

                                    {isSelected && (
                                      <Icon
                                        icon="mdi:check"
                                        className="w-4 h-4 mt-0.5 flex-shrink-0"
                                      />
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          )}
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

              <div className="border-t border-gray-200 p-4 sm:p-6 text-sm sm:text-base">
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={onClose}
                    disabled={isSaving}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg cursor-pointer transition hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex-1 px-4 py-3 bg-primary-100 hover:bg-[#0d1b3d] text-white rounded-lg cursor-pointer transition hover:bg-primary-700 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isSaving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const ComponentCard = ({
  component,
  deviceConfig,
  onTogglePower,
  onConfigure
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const isEnabled = deviceConfig?.enabled ?? true;

  return (
    <motion.div
      layout
      className={`rounded-xl border-2 overflow-hidden transition-all duration-300 hover:shadow-lg ${
        component.isOnline
          ? "border-primary-200 bg-gradient-to-br from-primary-50 to-white"
          : "border-gray-200 bg-white"
      }`}
    >
      <div className="p-3 sm:p-4 w-full">
        <div className="flex items-start justify-between gap-2 sm:gap-3 mb-3 sm:mb-4">
          <div className="flex items-start gap-2 sm:gap-3 min-w-0 flex-1">
            <div
              className={`p-2 rounded-lg flex-shrink-0 ${
                component.isOnline
                  ? "bg-primary-100 text-white"
                  : "bg-gray-100 text-gray-400"
              }`}
            >
              <Icon icon={component.icon} className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-gray-900 text-sm sm:text-base leading-tight break-words">
                {component.name}
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed break-words line-clamp-2">
                {component.description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 flex-shrink-0 self-start">
            {POWER_OVERRIDE_ENABLED && (
              <button
                onClick={() => onTogglePower(component.codeName)}
                className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
                  isEnabled
                    ? "bg-green-100 text-green-700 hover:bg-green-200"
                    : "bg-red-100 text-red-700 hover:bg-red-200"
                }`}
                aria-label={`${isEnabled ? "Turn off" : "Turn on"} ${component.name}`}
              >
                {isEnabled ? "On" : "Off"}
              </button>
            )}

            {component.configurable && (
              <button
                onClick={() => onConfigure(component)}
                className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
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
              className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
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
          <div className="flex items-center gap-2 min-w-0">
            <div
              className={`w-2 h-2 rounded-full flex-shrink-0 ${
                component.statusColor === "green"
                  ? "bg-green-500 animate-pulse"
                  : component.statusColor === "yellow"
                    ? "bg-yellow-500 animate-pulse"
                    : "bg-red-500"
              }`}
            />
            <div className="flex flex-wrap items-center gap-2 min-w-0">
              <span
                className={`text-xs sm:text-sm font-medium ${
                  component.statusColor === "green"
                    ? "text-green-600"
                    : component.statusColor === "yellow"
                      ? "text-yellow-600"
                      : "text-red-600"
                }`}
              >
                {component.statusLabel ||
                  (component.isOnline ? "Online" : "Offline")}
              </span>
              <span className="hidden sm:inline text-gray-400">•</span>
              <span className="text-xs text-gray-500 break-words">
                {component.statusLabel === "Not Ready"
                  ? "Waiting for GPS Signal"
                  : component.isOnline
                    ? "Connected"
                    : "Disconnected"}
              </span>
            </div>
          </div>
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
                <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 gap-3">
                  <div className="bg-gray-50 rounded-lg p-3 min-w-0">
                    <p className="text-xs text-gray-500 mb-1">Component Type</p>
                    <div className="flex items-center gap-2 min-w-0">
                      <Icon
                        icon={
                          component.type === "sensor"
                            ? "mdi:sensor"
                            : "mdi:chip"
                        }
                        className="w-4 h-4 text-gray-600 flex-shrink-0"
                      />
                      <p className="text-sm font-medium capitalize break-words">
                        {component.type}
                      </p>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3 min-w-0">
                    <p className="text-xs text-gray-500 mb-1">Component ID</p>
                    <p className="text-sm font-medium font-mono break-all">
                      CMP-{component.id.toString().padStart(3, "0")}
                    </p>
                  </div>
                </div>

                <div className="mt-3 p-3 bg-blue-50 rounded-lg min-w-0">
                  <div className="flex items-start gap-2">
                    <Icon
                      icon="mdi:information"
                      className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5"
                    />
                    <p className="text-xs text-blue-700 break-words">
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

const buildDeviceSnapshot = (globalConfig, deviceId) => {
  const components = Object.entries(DEVICE_COMPONENT_SCHEMA).map(
    ([codeName, schema]) => {
      const sourceComponent = globalConfig?.[codeName] || {};

      const component = {
        codeName,
        enabled: sourceComponent?.enabled ?? schema.enabled ?? true,
        config: {}
      };

      Object.entries(schema.config).forEach(([_, firmwareKey]) => {
        const value =
          sourceComponent?.config?.[firmwareKey] ??
          fallbackConfig?.[codeName]?.config?.[firmwareKey] ??
          0;

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

const buildPiPayload = (
  globalConfig,
  deviceId,
  changedKeys = PI_COMPONENT_KEYS
) => {
  const components = changedKeys
    .map((key) => {
      const sourceComponent = globalConfig?.[key] || fallbackConfig[key];
      if (!sourceComponent) return null;

      return {
        codeName: key,
        enabled: sourceComponent?.enabled ?? true,
        config: {
          ...(sourceComponent?.config || {})
        }
      };
    })
    .filter(Boolean);

  return {
    deviceId,
    configVersion: Date.now(),
    components
  };
};

const buildDefaultConfig = () =>
  Object.fromEntries(
    Object.entries(fallbackConfig).map(([codeName, component]) => [
      codeName,
      {
        ...(typeof component?.enabled === "boolean"
          ? { enabled: component.enabled }
          : {}),
        config: {
          ...(component?.config || {})
        }
      }
    ])
  );

function Advanced() {
  const [components, setComponents] = useState(componentsData);
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("sensors");
  const { showToast } = useToast();
  const { componentHealth, deviceConfig, setDeviceConfig, gps } =
    useRealtimeStore();
  const { selectedDevice } = useDevicesStore();

  useEffect(() => {
    setComponents((prev) =>
      prev.map((component) => {
        let isOnline = false;
        let statusLabel = "Offline";
        let statusColor = "red";

        if (
          component.codeName === "GPS_MODULE" ||
          component.codeName === "GPS_TRACKING"
        ) {
          const gpsAlive = Boolean(gps?.status === 1);
          if (!gpsAlive) {
            isOnline = false;
            statusLabel = "Offline";
            statusColor = "red";
          } else if (!gps?.ready || !gps?.fix) {
            isOnline = false;
            statusLabel = "Not Ready";
            statusColor = "yellow";
          } else {
            isOnline = true;
            statusLabel = "Online";
            statusColor = "green";
          }
        } else {
          const healthKey = componentIdMap[component.id];
          isOnline = healthKey ? Boolean(componentHealth?.[healthKey]) : false;
          statusLabel = isOnline ? "Online" : "Offline";
          statusColor = isOnline ? "green" : "red";
        }

        return {
          ...component,
          isOnline,
          statusLabel,
          statusColor,
          lastSeen: new Date().toISOString(),
          uptime: isOnline ? "100%" : "0%"
        };
      })
    );
  }, [componentHealth, gps]);

  const handleConfigure = (component) => {
    setSelectedComponent(component);
    setIsConfigModalOpen(true);
  };

  const handleConfigSave = async (partialUpdate) => {
    const updatedKeys = Object.keys(partialUpdate);

    const isPiConfig = updatedKeys.some((key) =>
      PI_COMPONENT_KEYS.includes(key)
    );

    if (isPiConfig) {
      return handlePiConfigUpdate(partialUpdate);
    } else {
      return handleDeviceConfigUpdate(partialUpdate);
    }
  };

  const handleDeviceConfigUpdate = async (
    partialUpdate = {},
    options = { showStatusToast: true }
  ) => {
    const { showStatusToast = true } = options;

    if (!selectedDevice?.deviceSerialNumber) {
      if (showStatusToast) {
        showToast({
          type: "error",
          message: "Please select a device first."
        });
      }

      return false;
    }

    setIsLoading(true);

    try {
      const latestConfig = useRealtimeStore.getState().deviceConfig || {};
      const mergedConfig = {
        ...latestConfig,
        ...partialUpdate
      };

      setDeviceConfig(mergedConfig);

      const snapshot = buildDeviceSnapshot(
        mergedConfig,
        selectedDevice.deviceSerialNumber
      );

      await wsApi.updateDeviceState(snapshot);

      if (showStatusToast) {
        showToast({
          type: "success",
          message: "Configuration saved successfully."
        });
      }

      return true;
    } catch (error) {
      console.error("Device config update failed:", error);

      if (showStatusToast) {
        showToast({
          type: "error",
          message: error?.message || "Failed to save configuration."
        });
      }

      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handlePiConfigUpdate = async (
    partialUpdate = {},
    options = { showStatusToast: true }
  ) => {
    const { showStatusToast = true } = options;

    if (!selectedDevice?.deviceSerialNumber) {
      if (showStatusToast) {
        showToast({
          type: "error",
          message: "Please select a device first."
        });
      }

      return false;
    }

    setIsLoading(true);

    try {
      const latestConfig = useRealtimeStore.getState().deviceConfig || {};
      const mergedConfig = {
        ...latestConfig,
        ...partialUpdate
      };

      setDeviceConfig(mergedConfig);

      const changedKeys = Object.keys(partialUpdate).filter((key) =>
        PI_COMPONENT_KEYS.includes(key)
      );

      const piPayload = buildPiPayload(
        mergedConfig,
        selectedDevice.deviceSerialNumber,
        changedKeys
      );

      const response = await wsApi.updatePiConfig(piPayload);

      if (response?.success === false) {
        throw new Error(response?.error || "Pi config update failed");
      }

      if (showStatusToast) {
        showToast({
          type: "success",
          message: "Configuration saved successfully."
        });
      }

      return true;
    } catch (error) {
      console.error("Pi config update failed:", error);

      if (showStatusToast) {
        showToast({
          type: "error",
          message: error?.message || "Failed to save configuration."
        });
      }

      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = (codeName) => {
    if (!deviceConfig?.[codeName]) return;

    const component = deviceConfig[codeName];

    const update = {
      [codeName]: {
        ...component,
        enabled: !(component.enabled ?? true),
        config: {
          ...component.config
        }
      }
    };

    if (PI_COMPONENT_KEYS.includes(codeName)) {
      handlePiConfigUpdate(update);
    } else {
      handleDeviceConfigUpdate(update);
    }
  };

  const handleResetToDefaults = async () => {
    const defaultConfig = buildDefaultConfig();

    setDeviceConfig(defaultConfig);

    const piDefaults = Object.fromEntries(
      Object.entries(defaultConfig).filter(([key]) =>
        PI_COMPONENT_KEYS.includes(key)
      )
    );
    const deviceDefaults = Object.fromEntries(
      Object.entries(defaultConfig).filter(
        ([key]) => !PI_COMPONENT_KEYS.includes(key)
      )
    );

    const deviceResetSuccess = await handleDeviceConfigUpdate(deviceDefaults, {
      showStatusToast: false
    });

    if (!deviceResetSuccess) {
      showToast({
        type: "error",
        message: "Failed to reset configurations."
      });
      return;
    }

    const piResetSuccess = await handlePiConfigUpdate(piDefaults, {
      showStatusToast: false
    });

    showToast({
      type: piResetSuccess ? "success" : "error",
      message: piResetSuccess
        ? "Configurations reset to default successfully."
        : "Device settings were reset, but Pi settings failed to reset."
    });
  };

  const handleVoicePreview = async ({
    message,
    voiceType,
    voiceConfig
  } = {}) => {
    const serial = selectedDevice?.deviceSerialNumber;

    if (!serial) {
      showToast({
        type: "error",
        message: "Please select a device first."
      });
      return false;
    }

    const normalizedMessage = String(message || "").trim();
    if (!normalizedMessage) {
      showToast({
        type: "error",
        message: "Please enter preview text first."
      });
      return false;
    }

    try {
      wsApi.previewVoice({
        deviceId: serial,
        message: normalizedMessage,
        voiceType,
        voiceConfig
      });

      showToast({
        type: "success",
        message: "Voice preview sent."
      });

      return true;
    } catch (error) {
      console.error("Voice preview failed:", error);
      showToast({
        type: "error",
        message: "Failed to send voice preview."
      });
      return false;
    }
  };

  const onlineCount = components.filter((c) => c.isOnline).length;
  const sensorComponents = components.filter((c) => c.type === "sensor");
  // const controllerComponents = components.filter(
  //   (c) => c.type === "controller"
  // );

  const tabs = [
    {
      id: "sensors",
      label: "Sensors & Safety",
      shortLabel: "Sensors",
      icon: "mdi:radar",
      count: sensorComponents.length
    },
    {
      id: "voice",
      label: "Voice & Audio",
      shortLabel: "Voice",
      icon: "mdi:voice",
      count: null
    },
    {
      id: "bluetooth",
      label: "Bluetooth",
      shortLabel: "BT",
      icon: "mdi:bluetooth",
      count: null
    }
  ];

  return (
    <main className="bg-white md:bg-[#f9fafb] rounded-t-[32px] md:rounded-none min-h-[calc(100vh-var(--header-height)-var(--mobile-nav-height))] md:min-h-[calc(100vh-var(--header-height))] md:max-h-[calc(100vh-var(--header-height))] overflow-y-visible md:overflow-y-auto p-6 pb-[calc(var(--mobile-nav-height)+1.5rem)] md:pb-6 overflow-x-hidden">
      <div className="mx-auto w-full space-y-4 sm:space-y-6 ">
        <div
          data-tour="tour-advanced-header"
          className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4 sm:mb-8"
        >
          <div className="min-w-0">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 font-poppins">
              Component Management
            </h2>
            <p className="text-gray-500 text-xs sm:text-sm mt-0.5">
              Monitor and configure your device in real-time
            </p>
          </div>

          <div className="flex w-full sm:w-auto flex-col-reverse sm:flex-row items-stretch sm:items-center gap-3">
            <button
              type="button"
              onClick={handleResetToDefaults}
              disabled={isLoading}
              className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm font-medium text-gray-700 shadow-sm transition hover:border-primary-200 hover:text-primary-600 disabled:cursor-not-allowed disabled:opacity-60"
              aria-label="Reset all configurations to default"
            >
              <Icon icon="mdi:restore" className="h-5 w-5 flex-shrink-0" />
              <span className="truncate">
                {isLoading ? "Resetting..." : "Reset to Default"}
              </span>
            </button>

            {/* Compact stats */}
            <div className="flex items-center gap-1 bg-white rounded-xl px-3 py-3 shadow-sm border w-full sm:w-auto">
              <div className="flex-1 text-center px-2">
                <div className="text-lg font-bold text-primary-600">
                  {onlineCount}
                </div>
                <div className="text-xs text-gray-500">Online</div>
              </div>

              <div className="h-8 w-px bg-gray-200" />

              <div className="flex-1 text-center px-2">
                <div className="text-lg font-bold text-gray-800">
                  {components.length}
                </div>
                <div className="text-xs text-gray-500">Total</div>
              </div>

              <div className="h-8 w-px bg-gray-200" />

              <div className="flex-1 text-center px-2">
                <div className="text-lg font-bold text-yellow-600">
                  {Math.round((onlineCount / components.length) * 100)}%
                </div>
                <div className="text-xs text-gray-500">Health</div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Tab Navigation ── */}
        <div className="flex flex-nowrap gap-1 bg-gray-100 p-1 rounded-xl mb-5">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`min-w-0 flex-1 basis-[calc(50%-0.125rem)] sm:basis-0 flex items-center justify-center gap-1.5 px-2 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                activeTab === tab.id
                  ? "bg-white text-primary-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Icon icon={tab.icon} className="w-4 h-4 flex-shrink-0" />

              <span className="sm:hidden text-center leading-tight">
                {tab.shortLabel}
              </span>

              <span className="hidden sm:inline text-center leading-tight">
                {tab.label}
              </span>

              {tab.count !== null && (
                <span
                  className={`text-xs px-1.5 py-0.5 rounded-full leading-none hidden sm:inline-flex items-center justify-center min-w-[20px] ${
                    activeTab === tab.id
                      ? "bg-gray-200 text-gray-500"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── Tab Content ── */}
        <AnimatePresence mode="wait">
          {activeTab === "sensors" && (
            <motion.div
              key="sensors"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
              className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4"
            >
              {sensorComponents.map((component) => (
                <ComponentCard
                  key={component.id}
                  component={component}
                  deviceConfig={deviceConfig?.[component.codeName] || {}}
                  onTogglePower={handleToggle}
                  onConfigure={handleConfigure}
                />
              ))}
            </motion.div>
          )}

          {/* {activeTab === "hardware" && (
            <motion.div
              key="hardware"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4"
            >
              {controllerComponents.map((component) => (
                <ComponentCard
                  key={component.id}
                  component={component}
                  deviceConfig={
                    deviceConfig?.[component.codeName]?.config || {}
                  }
                  onTogglePower={handleToggle}
                  onConfigure={handleConfigure}
                />
              ))}
            </motion.div>
          )} */}

          {activeTab === "voice" && (
            <motion.div
              key="voice"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
            >
              <VoiceControlPanel
                isOnline={componentHealth.raspberryPiStatus}
                deviceConfig={deviceConfig["VOICE_ENGINE"] || {}}
                onPreviewVoice={handleVoicePreview}
                onVoiceConfigChange={(updatedVoiceEngine) =>
                  handlePiConfigUpdate(
                    {
                      VOICE_ENGINE: {
                        ...deviceConfig?.VOICE_ENGINE,
                        enabled: updatedVoiceEngine?.enabled ?? true,
                        config: {
                          ...deviceConfig?.VOICE_ENGINE?.config,
                          ...updatedVoiceEngine?.config
                        }
                      }
                    },
                    { showStatusToast: false }
                  )
                }
              />
            </motion.div>
          )}

          {activeTab === "bluetooth" && (
            <motion.div
              key="bluetooth"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
            >
              <BluetoothManager embedded />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Configuration Modal */}
      <ConfigModal
        component={selectedComponent}
        deviceConfig={deviceConfig?.[selectedComponent?.codeName] || {}}
        isOpen={isConfigModalOpen}
        isSaving={isLoading}
        onClose={() => setIsConfigModalOpen(false)}
        onSave={handleConfigSave}
      />
    </main>
  );
}

export default Advanced;
