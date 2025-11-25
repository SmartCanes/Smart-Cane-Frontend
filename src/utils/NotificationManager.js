// src/utils/NotificationManager.js

export const triggerSmartCaneNotification = (type, message) => {
  // 1. Check kung supported ng browser
  if (!("Notification" in window)) {
    console.warn("Browser does not support notifications.");
    return;
  }

  // 2. Define Icons & Titles based on Type
  let title = "Smart Cane Alert";
  // Siguraduhin na ang '/vite.svg' ay nasa PUBLIC folder mo
  let icon = "/vite.svg";

  switch (type) {
    case "WEATHER":
      title = "Weather Warning 🌧️";
      break;
    case "SOS":
      title = "EMERGENCY ALERT 🚨";
      break;
    case "ARRIVAL":
      title = "Destination Reached 📍";
      break;
    default:
      title = "Notification";
  }

  // 3. Helper function to show notif
  const show = () => {
    console.log(`Attempting to trigger: ${type}`); // Debug log

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
        body: message,
        icon: icon,
        silent: false, // Tutunog kung supported
        tag: type, // Para hindi magpatong-patong
        vibrate: [200, 100, 200] // Backup vibration pattern for Service Workers
      });

      // Optional: Click event
      notif.onclick = () => {
        window.focus();
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
