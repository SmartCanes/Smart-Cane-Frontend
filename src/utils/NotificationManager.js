import {
  ensureBrowserPushSubscription,
  showForegroundNotification
} from "@/utils/pushNotifications";

const CRITICAL_TYPES = new Set(["SOS", "FALL"]);
const CRITICAL_VIBRATION_PATTERN = [700, 250, 700, 250, 700];
const CRITICAL_SIREN_CYCLES = 6;
const CRITICAL_SIREN_STEP_SECONDS = 0.22;
const DEFAULT_CRITICAL_AUDIO_SOURCES = ["/audio.wav", "/audio.mp3"];

let audioContext = null;
let hasPrimedAudioContext = false;
let hasAttachedAudioPrimer = false;
let criticalAlertAudio = null;
let criticalAlertAudioSrc = null;
let isCriticalAlertLoopPlaying = false;
let shouldRetryCriticalAlertOnGesture = false;
let desiredCriticalAlertState = {
  emergency: false,
  fall: false,
  audioSrc: undefined
};

const emitCriticalAudioBlockedState = (needsGesture) => {
  if (typeof window === "undefined") return;

  window.dispatchEvent(
    new CustomEvent("critical-alert-audio-blocked", {
      detail: { needsGesture: Boolean(needsGesture) }
    })
  );
};

const getAudioContext = () => {
  if (typeof window === "undefined") return null;

  if (!audioContext) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return null;
    audioContext = new AudioCtx();
  }

  return audioContext;
};

const primeAudioContext = async () => {
  const context = getAudioContext();
  if (!context) return;

  if (context.state === "suspended") {
    try {
      await context.resume();
      hasPrimedAudioContext = true;
    } catch {
      // Browser blocked resume; we'll keep trying on future gestures.
    }
  } else if (context.state === "running") {
    hasPrimedAudioContext = true;
  }
};

const attachAudioPrimer = () => {
  if (typeof window === "undefined") return;
  if (hasAttachedAudioPrimer) return;

  const gestureEvents = ["pointerdown", "keydown", "touchstart"];

  const handlePrimer = () => {
    primeAudioContext();

    if (shouldRetryCriticalAlertOnGesture) {
      shouldRetryCriticalAlertOnGesture = false;
      emitCriticalAudioBlockedState(false);
      setCriticalAlertState(desiredCriticalAlertState).catch(() => {
        // Keep best-effort behavior when browsers still reject autoplay.
      });
    }

    if (hasPrimedAudioContext) {
      gestureEvents.forEach((eventName) => {
        window.removeEventListener(eventName, handlePrimer, true);
      });
      hasAttachedAudioPrimer = false;
    }
  };

  gestureEvents.forEach((eventName) => {
    window.addEventListener(eventName, handlePrimer, true);
  });

  hasAttachedAudioPrimer = true;
};

const playDesktopAlertSound = async () => {
  const context = getAudioContext();
  if (!context) return false;

  if (context.state === "suspended") {
    try {
      await context.resume();
    } catch {
      return false;
    }
  }

  const now = context.currentTime;
  const oscillator = context.createOscillator();
  const gain = context.createGain();

  oscillator.type = "square";
  oscillator.frequency.setValueAtTime(660, now);

  gain.gain.setValueAtTime(0.0001, now);

  for (let i = 0; i < CRITICAL_SIREN_CYCLES; i += 1) {
    const stepStart = now + i * CRITICAL_SIREN_STEP_SECONDS;
    const frequency = i % 2 === 0 ? 620 : 980;

    oscillator.frequency.exponentialRampToValueAtTime(
      frequency,
      stepStart + 0.06
    );
    gain.gain.exponentialRampToValueAtTime(0.42, stepStart + 0.025);
    gain.gain.exponentialRampToValueAtTime(
      0.0001,
      stepStart + CRITICAL_SIREN_STEP_SECONDS - 0.03
    );
  }

  const totalDuration = CRITICAL_SIREN_CYCLES * CRITICAL_SIREN_STEP_SECONDS;

  oscillator.connect(gain);
  gain.connect(context.destination);

  oscillator.start(now);
  oscillator.stop(now + totalDuration + 0.02);

  return true;
};

const buildCriticalAudioCandidates = (preferredSrc) => {
  const configuredSrc = import.meta.env.VITE_CRITICAL_ALERT_AUDIO_URL;

  return [preferredSrc, configuredSrc, ...DEFAULT_CRITICAL_AUDIO_SOURCES]
    .filter((value) => typeof value === "string" && value.trim())
    .map((value) => value.trim())
    .filter((value, index, list) => list.indexOf(value) === index);
};

const ensureCriticalAudio = (src) => {
  if (typeof window === "undefined") return null;

  if (!criticalAlertAudio || criticalAlertAudioSrc !== src) {
    if (criticalAlertAudio) {
      criticalAlertAudio.pause();
      criticalAlertAudio.currentTime = 0;
    }

    criticalAlertAudio = new Audio(src);
    criticalAlertAudio.loop = true;
    criticalAlertAudio.preload = "auto";
    criticalAlertAudioSrc = src;
  }

  return criticalAlertAudio;
};

const startCriticalAlertLoop = async (preferredSrc) => {
  const candidates = buildCriticalAudioCandidates(preferredSrc);

  for (const src of candidates) {
    try {
      const audio = ensureCriticalAudio(src);
      if (!audio) break;

      if (audio.paused) {
        audio.currentTime = 0;
      }

      await audio.play();
      isCriticalAlertLoopPlaying = true;
      shouldRetryCriticalAlertOnGesture = false;
      emitCriticalAudioBlockedState(false);
      return true;
    } catch {
      // Try next configured file if this source cannot be played.
    }
  }

  isCriticalAlertLoopPlaying = false;
  return false;
};

export const stopCriticalAlertLoop = () => {
  if (!criticalAlertAudio) {
    isCriticalAlertLoopPlaying = false;
    emitCriticalAudioBlockedState(false);
    return;
  }

  criticalAlertAudio.pause();
  criticalAlertAudio.currentTime = 0;
  isCriticalAlertLoopPlaying = false;
  emitCriticalAudioBlockedState(false);
};

export const setCriticalAlertState = async ({
  emergency = false,
  fall = false,
  audioSrc
} = {}) => {
  desiredCriticalAlertState = {
    emergency: Boolean(emergency),
    fall: Boolean(fall),
    audioSrc
  };

  const shouldPlay = Boolean(emergency || fall);

  if (!shouldPlay) {
    shouldRetryCriticalAlertOnGesture = false;
    emitCriticalAudioBlockedState(false);
    stopCriticalAlertLoop();
    return;
  }

  if (isCriticalAlertLoopPlaying) {
    return;
  }

  const didPlay = await startCriticalAlertLoop(audioSrc);

  if (!didPlay) {
    shouldRetryCriticalAlertOnGesture = true;
    emitCriticalAudioBlockedState(true);
    await playDesktopAlertSound();
  }
};

if (typeof window !== "undefined") {
  attachAudioPrimer();
}

const NOTIFICATION_META = {
  WEATHER: {
    title: "Weather Alert",
    icon: "/icane.svg"
  },
  SOS: {
    title: "Emergency Alert",
    icon: "/icane.svg"
  },
  ARRIVAL: {
    title: "Destination Reached",
    icon: "/icane.svg"
  },
  FALL: {
    title: "Fall Detected",
    icon: "/icane.svg"
  }
};

const resolveNotificationPayload = (
  typeOrOptions,
  maybeMessage,
  maybeOptions
) => {
  if (typeof typeOrOptions === "object" && typeOrOptions !== null) {
    return {
      type: typeOrOptions.type || "SYSTEM",
      title: typeOrOptions.title,
      message: typeOrOptions.message || "",
      icon: typeOrOptions.icon,
      tag: typeOrOptions.tag,
      requireInteraction: typeOrOptions.requireInteraction,
      path: typeOrOptions.path,
      audioSrc: typeOrOptions.audioSrc
    };
  }

  return {
    type: typeOrOptions || "SYSTEM",
    message: maybeMessage || "",
    ...(maybeOptions || {})
  };
};

export const triggerSmartCaneNotification = async (
  typeOrOptions,
  maybeMessage,
  maybeOptions
) => {
  const payload = resolveNotificationPayload(
    typeOrOptions,
    maybeMessage,
    maybeOptions
  );

  if (!("Notification" in window)) {
    console.warn("Browser does not support notifications.");
    return;
  }

  const meta = NOTIFICATION_META[payload.type] || {};
  const title = payload.title || meta.title || "Smart Cane Alert";
  const icon = payload.icon || meta.icon || "/icane.svg";
  const isCritical = CRITICAL_TYPES.has(payload.type);

  if ("vibrate" in navigator) {
    try {
      navigator.vibrate(
        isCritical ? CRITICAL_VIBRATION_PATTERN : [500, 200, 500]
      );
    } catch (error) {
      console.error("Vibration error:", error);
    }
  }

  if (isCritical) {
    setCriticalAlertState({
      emergency: payload.type === "SOS",
      fall: payload.type === "FALL",
      audioSrc: payload.audioSrc
    }).catch(() => {
      // Best-effort sound playback; permission and browser policy can block this.
    });
  }

  const show = async () => {
    try {
      await showForegroundNotification({
        title,
        message: payload.message,
        icon,
        tag: payload.tag || payload.type,
        requireInteraction: Boolean(payload.requireInteraction),
        path: payload.path || "/notifications"
      });
    } catch (error) {
      console.error("Foreground notification failed:", error);
    }
  };

  if (Notification.permission === "granted") {
    await show();
    await ensureBrowserPushSubscription();
  }
};
