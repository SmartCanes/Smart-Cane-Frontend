// src/utils/NotificationManager.js

const NOTIFICATION_META = {
  WEATHER: {
    title: "Weather Alert",
    icon: "/vite.svg"
  },
  SOS: {
    title: "Emergency Alert",
    icon: "/vite.svg"
  },
  ARRIVAL: {
    title: "Destination Reached",
    icon: "/vite.svg"
  },
  FALL: {
    title: "Fall Detected",
    icon: "/vite.svg"
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
      path: typeOrOptions.path
    };
  }

  return {
    type: typeOrOptions || "SYSTEM",
    message: maybeMessage || "",
    ...(maybeOptions || {})
  };
};

export const triggerSmartCaneNotification = (
  typeOrOptions,
  maybeMessage,
  maybeOptions
) => {
  const payload = resolveNotificationPayload(
    typeOrOptions,
    maybeMessage,
    maybeOptions
  );

  // 1. Check kung supported ng browser
  if (!("Notification" in window)) {
    console.warn("Browser does not support notifications.");
    return;
  }

  // 2. Define Icons & Titles based on Type
  const meta = NOTIFICATION_META[payload.type] || {};
  const title = payload.title || meta.title || "Smart Cane Alert";
  const icon = payload.icon || meta.icon || "/vite.svg";

  // 3. Helper function to show notif
  const show = () => {
    console.log(`Attempting to trigger: ${payload.type}`); // Debug log

    // A. HARDWARE VIBRATION (Unahin natin ito para sigurado)
    // Gagana ito sa Android Chrome
    if ("vibrate" in navigator) {
      try {
        // Pattern: Vibrate 500ms, Pause 200ms, Vibrate 500ms
        navigator.vibrate([500, 200, 500]);
        console.log("Vibration triggered.");
      } catch (e) {
        console.error("Vibration error:", e);
      }
    }

    // B. VISUAL NOTIFICATION
    try {
      const notif = new Notification(title, {
        body: payload.message,
        icon: icon,
        silent: false, // Tutunog kung supported
        tag: payload.tag || payload.type, // Para hindi magpatong-patong
        requireInteraction: Boolean(payload.requireInteraction),
        vibrate: [200, 100, 200] // Backup vibration pattern for Service Workers
      });

      // Optional: Click event
      notif.onclick = () => {
        window.focus();
        if (payload.path) {
          window.location.assign(payload.path);
        }
        notif.close();
      };

      console.log("Visual notification sent.");
    } catch (e) {
      // Dito natin sasaluhin kung mag-error ang browser
      console.error("Notification creation failed:", e);
      // Fallback: Alert kung talagang ayaw lumabas ng notif (for testing only)
      // alert(`${title}\n${message}`);
    }
  };

  // 4. Permission Logic
  if (Notification.permission === "granted") {
    show();
  } else if (Notification.permission !== "denied") {
    Notification.requestPermission().then((permission) => {
      if (permission === "granted") {
        show();
      } else {
        console.log("Permission denied by user.");
      }
    });
  } else {
    console.log("Notification permission was previously denied.");
  }
};
