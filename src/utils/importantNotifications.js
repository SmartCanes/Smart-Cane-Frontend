import {
  DEFAULT_LOCATION,
  fetchImportantWeatherAlert
} from "@/api/weatherService";
import { useNotificationsStore, useSettingsStore } from "@/stores/useStore";
import { triggerSmartCaneNotification } from "@/utils/NotificationManager";
import i18n from "@/i18n";

const WEATHER_NOTIFICATION_COOLDOWN_MS = 60 * 60 * 1000;
const SAFETY_NOTIFICATION_COOLDOWN_MS = 30 * 1000;
const ARRIVAL_NOTIFICATION_COOLDOWN_MS = 60 * 1000;

const t = (key, options) => i18n.t(key, { ns: "pages", ...options });

const formatVipName = (vipName) => vipName?.trim() || t("importantNotifications.theVip");

const formatDeviceLabel = (deviceSerial) =>
  deviceSerial ? t("importantNotifications.deviceLabel", { serial: deviceSerial }) : "";

const dispatchImportantNotification = (
  notification,
  {
    dedupeKey,
    cooldownMs = 0,
    pushType = notification?.action,
    requireInteraction = false,
    shouldRespectEmergencySetting = false
  } = {}
) => {
  const added = useNotificationsStore
    .getState()
    .addEventNotification(notification, {
      dedupeKey,
      cooldownMs
    });

  if (!added) {
    return false;
  }

  const notificationSettings =
    useSettingsStore.getState().settings?.notifications || {};
  const pushEnabled = Boolean(notificationSettings.push);
  const emergencyPushEnabled = Boolean(notificationSettings.emergency);
  const canPush =
    pushEnabled &&
    (!shouldRespectEmergencySetting || emergencyPushEnabled === true);

  if (canPush) {
    triggerSmartCaneNotification({
      type: pushType,
      title: notification.title,
      message: notification.message,
      tag: dedupeKey || notification.historyId || notification.id,
      requireInteraction,
      path: notification.navigation?.path
    });
  }

  return true;
};

export const notifyEmergencyAlert = ({ vipName, deviceSerial } = {}) =>
  dispatchImportantNotification(
    {
      action: "LIVE_EMERGENCY",
      title: t("importantNotifications.emergency.title"),
      message: t("importantNotifications.emergency.message", {
        vipName: formatVipName(vipName),
        deviceLabel: formatDeviceLabel(deviceSerial)
      }),
      guardianName: t("importantNotifications.guardians.safetyMonitor"),
      navigation: {
        path: "/dashboard"
      }
    },
    {
      dedupeKey: `emergency:${deviceSerial || "unknown"}`,
      cooldownMs: SAFETY_NOTIFICATION_COOLDOWN_MS,
      pushType: "SOS",
      requireInteraction: true,
      shouldRespectEmergencySetting: true
    }
  );

export const notifyFallAlert = ({ vipName, deviceSerial } = {}) =>
  dispatchImportantNotification(
    {
      action: "LIVE_FALL",
      title: t("importantNotifications.fall.title"),
      message: t("importantNotifications.fall.message", {
        vipName: formatVipName(vipName),
        deviceLabel: formatDeviceLabel(deviceSerial)
      }),
      guardianName: t("importantNotifications.guardians.safetyMonitor"),
      navigation: {
        path: "/dashboard"
      }
    },
    {
      dedupeKey: `fall:${deviceSerial || "unknown"}`,
      cooldownMs: SAFETY_NOTIFICATION_COOLDOWN_MS,
      pushType: "FALL",
      requireInteraction: true,
      shouldRespectEmergencySetting: true
    }
  );

export const notifyRouteArrival = ({ vipName, deviceSerial } = {}) =>
  dispatchImportantNotification(
    {
      action: "ROUTE_ARRIVAL",
      title: t("importantNotifications.arrival.title"),
      message: t("importantNotifications.arrival.message", {
        vipName: formatVipName(vipName),
        deviceLabel: formatDeviceLabel(deviceSerial)
      }),
      guardianName: t("importantNotifications.guardians.navigationAssistant"),
      navigation: {
        path: "/dashboard"
      }
    },
    {
      dedupeKey: `arrival:${deviceSerial || "unknown"}`,
      cooldownMs: ARRIVAL_NOTIFICATION_COOLDOWN_MS,
      pushType: "ARRIVAL"
    }
  );

const buildWeatherNotificationCopy = ({
  type,
  locationName,
  temp,
  windSpeed
}) => {
  const resolvedLocation = locationName || DEFAULT_LOCATION.name;

  if (type === "storm") {
    return {
      title: t("importantNotifications.weather.storm.title"),
      message: t("importantNotifications.weather.storm.message", {
        location: resolvedLocation
      })
    };
  }

  if (type === "wind") {
    return {
      title: t("importantNotifications.weather.wind.title"),
      message: t("importantNotifications.weather.wind.message", {
        windSpeed,
        location: resolvedLocation
      })
    };
  }

  return {
    title: t("importantNotifications.weather.rain.title"),
    message: t("importantNotifications.weather.rain.message", {
      location: resolvedLocation,
      temperature: temp != null ? `${temp}°C` : ""
    })
  };
};

export const checkImportantWeatherUpdates = async ({
  lat,
  lon,
  locationName
} = {}) => {
  const resolvedLat = lat ?? DEFAULT_LOCATION.lat;
  const resolvedLon = lon ?? DEFAULT_LOCATION.lon;
  const resolvedLocationName = locationName || DEFAULT_LOCATION.name;

  const alert = await fetchImportantWeatherAlert(
    resolvedLat,
    resolvedLon,
    resolvedLocationName
  );

  if (!alert) {
    return false;
  }

  const copy = buildWeatherNotificationCopy(alert);

  return dispatchImportantNotification(
    {
      action: "LIVE_WEATHER",
      title: copy.title,
      message: copy.message,
      guardianName: t("importantNotifications.guardians.weatherService"),
      navigation: {
        path: "/weather-board"
      }
    },
    {
      dedupeKey: alert.dedupeKey,
      cooldownMs: WEATHER_NOTIFICATION_COOLDOWN_MS,
      pushType: "WEATHER"
    }
  );
};

export const openNotificationTarget = (navigate, notification) => {
  if (notification?.navigation?.path) {
    const options = notification.navigation.state
      ? { state: notification.navigation.state }
      : undefined;

    navigate(notification.navigation.path, options);
    return;
  }

  navigate("/activity-logs", {
    state: {
      highlightId: notification?.historyId
    }
  });
};
