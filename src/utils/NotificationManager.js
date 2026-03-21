import {
  ensureBrowserPushSubscription,
  showForegroundNotification
} from "@/utils/pushNotifications";
import i18n from "@/i18n";

const NOTIFICATION_META = {
  WEATHER: {
    title: "notifications.meta.weather",
    icon: "/icane.svg"
  },
  SOS: {
    title: "notifications.meta.emergency",
    icon: "/icane.svg"
  },
  ARRIVAL: {
    title: "notifications.meta.arrival",
    icon: "/icane.svg"
  },
  FALL: {
    title: "notifications.meta.fall",
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
      path: typeOrOptions.path
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
  const title =
    payload.title ||
    (meta.title ? i18n.t(meta.title, { ns: "pages" }) : "") ||
    i18n.t("notifications.meta.default", { ns: "pages" });
  const icon = payload.icon || meta.icon || "/icane.svg";

  const show = async () => {
    if ("vibrate" in navigator) {
      try {
        navigator.vibrate([500, 200, 500]);
      } catch (error) {
        console.error("Vibration error:", error);
      }
    }

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
