const DEVICE_LOG_TYPE_ALIASES = {
  FALL: "FALL",
  FALL_DETECTED: "FALL",
  LIVE_FALL: "FALL",
  EMERGENCY: "EMERGENCY",
  SOS: "EMERGENCY",
  LIVE_EMERGENCY: "EMERGENCY",
  SET_EMERGENCY: "EMERGENCY",
  ROUTE_CLEARED: "ROUTE_CLEARED",
  CLEAR_ROUTE: "ROUTE_CLEARED",
  ROUTE_CLEAR: "ROUTE_CLEARED",
  DESTINATION_CLEARED: "ROUTE_CLEARED",
  SET_ROUTE: "SET_ROUTE",
  ROUTE_SET: "SET_ROUTE",
  ROUTE_CREATED: "SET_ROUTE",
  ROUTE_STARTED: "SET_ROUTE",
  REACH_DESTINATION: "REACH_DESTINATION",
  REACHED_DESTINATION: "REACH_DESTINATION",
  DESTINATION_REACHED: "REACH_DESTINATION",
  ROUTE_ARRIVAL: "REACH_DESTINATION",
  ROUTE_HISTORY: "ROUTE_HISTORY"
};

const DEVICE_LOG_META = {
  FALL: {
    label: "Fall Detected",
    icon: "ph:person-simple-run",
    color: "orange",
    status: "Fall Detected",
    duration: "Immediate alert",
    activity: "Fall Detected"
  },
  EMERGENCY: {
    label: "Emergency Alert",
    icon: "ph:warning-fill",
    color: "red",
    status: "Emergency",
    duration: "Immediate alert",
    activity: "Emergency Alert"
  },
  ROUTE_CLEARED: {
    label: "Route Cleared",
    icon: "ph:map-trifold",
    color: "gray",
    status: "Cancelled",
    duration: "Route cancelled",
    activity: "Route Cleared"
  },
  SET_ROUTE: {
    label: "Set Route",
    icon: "ph:map-pin-line",
    color: "blue",
    status: "Ongoing",
    duration: "Route in progress",
    activity: "Set Route"
  },
  REACH_DESTINATION: {
    label: "Destination Reached",
    icon: "ph:flag-checkered",
    color: "green",
    status: "Completed",
    duration: "Route completed",
    activity: "Destination Reached"
  },
  ROUTE_HISTORY: {
    label: "Route History",
    icon: "ph:clock-counter-clockwise",
    color: "indigo",
    status: "Completed",
    duration: "Route recorded",
    activity: "Route History"
  }
};

const LOCATION_KEYS = [
  "origin",
  "from",
  "start_location",
  "startLocation",
  "location",
  "pickup"
];

const DESTINATION_KEYS = [
  "destination",
  "to",
  "end_location",
  "endLocation",
  "dropoff",
  "target"
];

const ROUTE_DURATION_KEYS = [
  "duration",
  "duration_text",
  "durationText",
  "travel_time",
  "travelTime",
  "eta",
  "elapsed_time",
  "elapsedTime"
];

const toArray = (value) =>
  Array.isArray(value) ? value : value ? [value] : [];

const toLookupKey = (value) =>
  String(value || "")
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, "_");

const toLabel = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .split(/[_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const pickFirstString = (...candidates) => {
  for (const candidate of candidates.flat()) {
    if (typeof candidate === "string" && candidate.trim()) {
      return candidate.trim();
    }
  }

  return null;
};

const pickNestedValue = (source, keys = []) => {
  for (const key of keys) {
    const value = source?.[key];

    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }

    if (value && typeof value === "object") {
      const nested = pickFirstString(
        value.name,
        value.label,
        value.address,
        value.description,
        value.fullAddress
      );

      if (nested) {
        return nested;
      }
    }
  }

  return null;
};

const humanizeDuration = (value) => {
  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }

  if (typeof value !== "number" || Number.isNaN(value) || value <= 0) {
    return null;
  }

  if (value < 60) {
    return `${Math.round(value)} sec`;
  }

  const minutes = Math.round(value / 60);
  if (minutes < 60) {
    return `${minutes} min${minutes === 1 ? "" : "s"}`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (!remainingMinutes) {
    return `${hours} hr${hours === 1 ? "" : "s"}`;
  }

  return `${hours} hr ${remainingMinutes} min`;
};

const toLogDate = (raw) => {
  if (!raw) return null;

  const value = typeof raw === "string" ? raw.replace(" ", "T") : String(raw);
  const withTimezone =
    !value.endsWith("Z") && !value.includes("+") ? `${value}Z` : value;
  const date = new Date(withTimezone);

  return Number.isNaN(date.getTime()) ? null : date;
};

const formatDateTime = (raw) => {
  const date = toLogDate(raw);
  if (!date) return "Unknown time";

  const localNow = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Manila" })
  );
  const localDate = new Date(
    date.toLocaleString("en-US", { timeZone: "Asia/Manila" })
  );

  const startOfToday = new Date(localNow);
  startOfToday.setHours(0, 0, 0, 0);

  const startOfLogDay = new Date(localDate);
  startOfLogDay.setHours(0, 0, 0, 0);

  const dayDiff = Math.round(
    (startOfToday.getTime() - startOfLogDay.getTime()) / 86_400_000
  );

  const timeLabel = date.toLocaleTimeString("en-PH", {
    timeZone: "Asia/Manila",
    hour: "numeric",
    minute: "2-digit",
    hour12: true
  });

  if (dayDiff === 0) {
    return `Today at ${timeLabel}`;
  }

  if (dayDiff === 1) {
    return `Yesterday at ${timeLabel}`;
  }

  return `${date.toLocaleDateString("en-PH", {
    timeZone: "Asia/Manila",
    month: "short",
    day: "numeric",
    year: "numeric"
  })} at ${timeLabel}`;
};

const prefixSerial = (serial) => {
  if (!serial) return null;

  const normalized = String(serial).trim();
  if (!normalized) return null;

  const withoutPrefix = normalized.replace(/^SC-?/i, "");
  return `SC-${withoutPrefix}`;
};

const buildVipName = (selectedDevice, metadata) => {
  const selectedVipName = pickFirstString(
    selectedDevice?.vip?.fullName,
    [selectedDevice?.vip?.firstName, selectedDevice?.vip?.lastName]
      .filter(Boolean)
      .join(" ")
  );

  return (
    pickFirstString(
      metadata?.vipName,
      metadata?.vip_name,
      metadata?.vip?.name,
      metadata?.vip?.fullName,
      metadata?.vip?.full_name,
      selectedVipName
    ) || "Assigned VIP"
  );
};

const buildGuardianName = (metadata) =>
  pickFirstString(
    metadata?.guardianName,
    metadata?.guardian_name,
    metadata?.guardian?.name,
    metadata?.guardian?.fullName,
    metadata?.assignedBy
  ) || "iCane System";

const buildAvatar = (selectedDevice, metadata) =>
  pickFirstString(
    metadata?.vipImageUrl,
    metadata?.vip_image_url,
    metadata?.vip?.image,
    metadata?.vip?.imageUrl,
    selectedDevice?.vip?.vipImageUrl
  );

const buildLocation = (metadata, coordsDisplay = null) =>
  pickFirstString(
    metadata?.location?.label,
    metadata?.location?.name,
    metadata?.location?.address,
    pickNestedValue(metadata, LOCATION_KEYS),
    pickNestedValue(metadata?.route, LOCATION_KEYS),
    coordsDisplay
  ) || "No origin available";

const buildDestination = (metadata) =>
  pickFirstString(
    pickNestedValue(metadata, DESTINATION_KEYS),
    pickNestedValue(metadata?.route, DESTINATION_KEYS)
  ) || "No destination available";

const buildDuration = (metadata, fallback) =>
  pickFirstString(
    humanizeDuration(metadata?.duration),
    humanizeDuration(metadata?.duration_seconds),
    humanizeDuration(metadata?.durationSeconds),
    humanizeDuration(metadata?.travel_time),
    humanizeDuration(metadata?.travelTime),
    humanizeDuration(metadata?.route?.duration),
    humanizeDuration(metadata?.route?.duration_seconds),
    humanizeDuration(metadata?.route?.durationSeconds),
    pickNestedValue(metadata, ROUTE_DURATION_KEYS),
    pickNestedValue(metadata?.route, ROUTE_DURATION_KEYS),
    fallback
  ) || fallback;

const buildCoords = (metadata) => {
  const rawLat =
    metadata?.payload?.lat ??
    metadata?.payload?.latitude ??
    metadata?.location?.lat ??
    metadata?.location?.latitude ??
    metadata?.route?.location?.lat ??
    metadata?.route?.location?.latitude ??
    metadata?.lat ??
    metadata?.latitude;
  const rawLng =
    metadata?.payload?.lng ??
    metadata?.payload?.lon ??
    metadata?.payload?.longitude ??
    metadata?.location?.lng ??
    metadata?.location?.lon ??
    metadata?.location?.longitude ??
    metadata?.route?.location?.lng ??
    metadata?.route?.location?.lon ??
    metadata?.route?.location?.longitude ??
    metadata?.lng ??
    metadata?.lon ??
    metadata?.longitude;

  const lat = typeof rawLat === "string" ? parseFloat(rawLat) : rawLat;
  const lng = typeof rawLng === "string" ? parseFloat(rawLng) : rawLng;

  if (typeof lat === "number" && !Number.isNaN(lat) && typeof lng === "number" && !Number.isNaN(lng)) {
    return {
      coords: [lat, lng],
      display: `${lat}, ${lng}`
    };
  }

  return null;
};

const normalizeStatus = (rawStatus, fallbackStatus) => {
  const normalized = toLookupKey(rawStatus);

  switch (normalized) {
    case "FALL":
    case "FALL_DETECTED":
      return "Fall Detected";
    case "EMERGENCY":
      return "Emergency";
    case "ONGOING":
    case "IN_PROGRESS":
      return "Ongoing";
    case "CANCELLED":
    case "CANCELED":
      return "Cancelled";
    case "COMPLETED":
    case "SUCCESS":
    case "DONE":
      return "Completed";
    default:
      return rawStatus ? toLabel(rawStatus) : fallbackStatus;
  }
};

export const normalizeDeviceLogType = (activityType) =>
  DEVICE_LOG_TYPE_ALIASES[toLookupKey(activityType)] || null;

export const isSupportedDeviceLogType = (activityType) =>
  Boolean(normalizeDeviceLogType(activityType));

export const normalizeDeviceLogs = (logs = [], selectedDevice = null) =>
  toArray(logs)
    .map((log) => {
      const metadata =
        log?.metadata_json || log?.metadataJson || log?.metadata || {};
      const normalizedType = normalizeDeviceLogType(
        log?.activity_type || log?.activityType
      );

      if (!normalizedType) {
        return null;
      }

      const meta = DEVICE_LOG_META[normalizedType];
      const logId = log?.log_id ?? log?.logId;
      const deviceId =
        log?.device_id ?? log?.deviceId ?? selectedDevice?.deviceId;
      const rawTimestamp = log?.created_at || log?.createdAt;
      const status = normalizeStatus(log?.status, meta.status);
      const isRoute =
        normalizedType === "SET_ROUTE" ||
        normalizedType === "REACH_DESTINATION" ||
        normalizedType === "ROUTE_CLEARED" ||
        normalizedType === "ROUTE_HISTORY";
      const isAlert = normalizedType === "EMERGENCY" || normalizedType === "FALL";
      const deviceSerial = prefixSerial(
        pickFirstString(
          log?.deviceSerialNumber,
          log?.device_serial_number,
          metadata?.deviceSerialNumber,
          metadata?.device_serial_number,
          metadata?.serial,
          selectedDevice?.deviceSerialNumber
        )
      );
      const coords = buildCoords(metadata);
      const location = isAlert
        ? buildLocation(metadata, coords?.display)
        : buildLocation(metadata, coords?.display);
      const destination = isRoute ? buildDestination(metadata) : null;

      return {
        id: `device-log-${logId}`,
        logId,
        deviceId,
        guardianId: log?.guardian_id ?? log?.guardianId ?? null,
        action: normalizedType,
        activityType: normalizedType,
        activity: meta.activity,
        title: meta.label,
        message:
          log?.message ||
          metadata?.message ||
          `${meta.label} was recorded for this device.`,
        description: log?.message || metadata?.message || "—",
        guardianName: buildGuardianName(metadata),
        vipName: buildVipName(selectedDevice, metadata),
        avatar: buildAvatar(selectedDevice, metadata),
        location,
        destination,
        coordinates: coords?.coords || null,
        duration: buildDuration(metadata, meta.duration),
        status,
        date: toLogDate(rawTimestamp) || new Date(),
        timestamp: rawTimestamp || new Date().toISOString(),
        createdAt: rawTimestamp || new Date().toISOString(),
        dateTime: formatDateTime(rawTimestamp),
        device: deviceSerial || "Unknown Device",
        deviceSerialNumber: deviceSerial,
        isRoute,
        isAlert,
        lastLocation: location,
        color: meta.color,
        icon: meta.icon,
        readKey: `device:${logId}`,
        navigation: {
          path: "/device-logs"
        },
        raw: log
      };
    })
    .filter(Boolean)
    .sort(
      (a, b) =>
        (toLogDate(b.timestamp)?.getTime() || 0) -
        (toLogDate(a.timestamp)?.getTime() || 0)
    );

export const mapDeviceLogsToNotifications = (deviceLogs = []) =>
  toArray(deviceLogs).map((log) => ({
    id: log.id,
    historyId: log.readKey,
    sourceId: log.logId,
    source: "device",
    action: log.action,
    title: log.title,
    message: log.message,
    guardianName: log.guardianName,
    color: log.color,
    icon: log.icon,
    timestamp: log.timestamp,
    navigation: log.navigation
  }));

export const mapActivityHistoryToNotifications = (
  history = [],
  currentGuardianId = null,
  notificationMeta = {}
) =>
  toArray(history)
    .filter((item) => toLookupKey(item?.action) !== "LOGIN")
    .filter((item) => Number(item?.guardianId) !== Number(currentGuardianId))
    .map((item) => ({
      id: `activity-log-${item.historyId}`,
      historyId: `activity:${item.historyId}`,
      sourceId: item.historyId,
      source: "activity",
      action: item.action,
      title: notificationMeta[item.action]?.label || item.action,
      message: item.description || "—",
      guardianName: item.guardianName || "Unknown",
      color: notificationMeta[item.action]?.color || "gray",
      icon: notificationMeta[item.action]?.icon || "ph:bell",
      timestamp: item.createdAt,
      navigation: {
        path: "/activity-logs",
        state: {
          highlightId: item.historyId
        }
      }
    }));
