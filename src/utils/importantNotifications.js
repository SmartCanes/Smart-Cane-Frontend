import {
  DEFAULT_LOCATION,
  fetchImportantWeatherAlert
} from "@/api/weatherService";
import { useNotificationsStore, useSettingsStore } from "@/stores/useStore";
import { triggerSmartCaneNotification } from "@/utils/NotificationManager";

const WEATHER_NOTIFICATION_COOLDOWN_MS = 60 * 60 * 1000;
const SAFETY_NOTIFICATION_COOLDOWN_MS = 30 * 1000;
const ARRIVAL_NOTIFICATION_COOLDOWN_MS = 60 * 1000;

const formatVipName = (vipName) => vipName?.trim() || "the VIP";

const formatDeviceLabel = (deviceSerial) =>
  deviceSerial ? ` on device ${deviceSerial}` : "";

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
  const isCriticalSafetyAlert = pushType === "SOS" || pushType === "FALL";
  const canTriggerClientAlert =
    isCriticalSafetyAlert ||
    (pushEnabled &&
      (!shouldRespectEmergencySetting || emergencyPushEnabled === true));

  if (canTriggerClientAlert) {
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
      title: "Emergency Alert",
      message: `${vipName ? formatVipName(vipName) : "A VIP"} triggered an emergency alert${formatDeviceLabel(deviceSerial)}. Open Live Location now and contact the assigned emergency guardians immediately.`,
      guardianName: "iCane Safety Monitor",
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
      title: "Possible Fall Detected",
      message: `A possible fall was detected for ${vipName ? formatVipName(vipName) : "a VIP"}${formatDeviceLabel(deviceSerial)}. Check the live map and confirm their condition as soon as possible.`,
      guardianName: "iCane Safety Monitor",
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
      title: "Destination Reached",
      message: `${vipName ? formatVipName(vipName) : "A VIP"} has arrived at the selected destination${formatDeviceLabel(deviceSerial)}. Route tracking has been cleared successfully.`,
      guardianName: "Navigation Assistant",
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
      title: "Severe Weather Warning",
      message: `Thunderstorm conditions were detected near ${resolvedLocation}. Outdoor travel may be unsafe right now. Review the Weather Board before heading out.`
    };
  }

  if (type === "wind") {
    return {
      title: "Strong Wind Advisory",
      message: `Strong winds of around ${windSpeed} km/h were detected near ${resolvedLocation}. Outdoor navigation may be unstable, so extra caution is advised.`
    };
  }

  return {
    title: "Rain Alert",
    message: `Rain is affecting ${resolvedLocation} right now${temp != null ? ` at about ${temp}°C` : ""}. Roads may be slippery, so please monitor outdoor travel carefully.`
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
      guardianName: "Weather Service",
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
