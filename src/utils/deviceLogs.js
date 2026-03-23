const DEVICE_LOG_TYPE_ALIASES = {
  FALL: "FALL",
  FALL_DETECTED: "FALL",
  LIVE_FALL: "FALL",
  EMERGENCY: "EMERGENCY",
  SOS: "EMERGENCY",
  LIVE_EMERGENCY: "EMERGENCY",
  SET_EMERGENCY: "EMERGENCY",

  ROUTE: "ROUTE_HISTORY",
  ROUTE_ACTIVE: "SET_ROUTE",
  ROUTE_COMPLETED: "REACH_DESTINATION",
  ROUTE_CLEARED: "ROUTE_CLEARED",
  ROUTE_FAILED: "ROUTE_CLEARED",

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

const formatGuardianNameFromRecord = (guardian) =>
  pickFirstString(
    guardian?.fullName,
    guardian?.full_name,
    [guardian?.firstName, guardian?.lastName].filter(Boolean).join(" "),
    guardian?.guardianName,
    guardian?.name,
    guardian?.username,
    guardian?.email
  );

const buildGuardianName = (
  metadata,
  resolvedGuardian = null,
  guardianId = null
) =>
  pickFirstString(
    metadata?.guardianName,
    metadata?.guardian_name,
    metadata?.guardian?.name,
    metadata?.guardian?.fullName,
    [metadata?.guardian?.firstName, metadata?.guardian?.lastName]
      .filter(Boolean)
      .join(" "),
    metadata?.assignedBy,
    formatGuardianNameFromRecord(resolvedGuardian),
    guardianId != null ? `Guardian #${guardianId}` : null
  ) || "iCane System";

const buildAvatar = (selectedDevice, metadata) =>
  pickFirstString(
    metadata?.vipImageUrl,
    metadata?.vip_image_url,
    metadata?.vip?.image,
    metadata?.vip?.imageUrl,
    selectedDevice?.vip?.vipImageUrl
  );

const appendGuardianContext = (
  message,
  action,
  guardianName,
  destinationLabel = null
) => {
  if (!guardianName) return message;

  const baseMessage =
    message ||
    (action === "SET_ROUTE"
      ? destinationLabel
        ? `Route set to ${destinationLabel}`
        : "Route set"
      : "Route updated");

  const lowerBase = baseMessage.toLowerCase();
  if (lowerBase.includes(guardianName.toLowerCase())) return baseMessage;

  if (action === "ROUTE_CLEARED") {
    return `${baseMessage} • Cleared by ${guardianName}`;
  }

  if (action === "SET_ROUTE") {
    return `${baseMessage} • Set by ${guardianName}`;
  }

  return `${baseMessage} • ${guardianName}`;
};

const toNumber = (value) => {
  if (value === null || value === undefined || value === "") return null;
  const num = typeof value === "string" ? parseFloat(value) : value;
  return Number.isFinite(num) ? num : null;
};

const formatCoordsLabel = (lat, lng) => {
  const parsedLat = toNumber(lat);
  const parsedLng = toNumber(lng);

  if (parsedLat == null || parsedLng == null) return null;
  return `${parsedLat.toFixed(6)}, ${parsedLng.toFixed(6)}`;
};

const getRouteCoordinates = (metadata = {}) => {
  const coordinates =
    metadata?.routeGeoJson?.coordinates ||
    metadata?.route_geojson?.coordinates ||
    metadata?.providerPayload?.paths?.[0]?.points?.coordinates ||
    metadata?.provider_payload?.paths?.[0]?.points?.coordinates ||
    metadata?.route?.routeGeoJson?.coordinates ||
    metadata?.route?.route_geojson?.coordinates ||
    [];

  return Array.isArray(coordinates) ? coordinates : [];
};

const toLatLngRoute = (coordinates = []) =>
  coordinates
    .filter((point) => Array.isArray(point) && point.length >= 2)
    .map(([lng, lat]) => [toNumber(lat), toNumber(lng)])
    .filter((point) => Number.isFinite(point[0]) && Number.isFinite(point[1]));

const getRouteOriginCoords = (metadata = {}) => {
  const coordinates = getRouteCoordinates(metadata);
  const first = coordinates[0];

  if (Array.isArray(first) && first.length >= 2) {
    const [lng, lat] = first;
    return {
      lat: toNumber(lat),
      lng: toNumber(lng)
    };
  }

  return null;
};

const getRouteDestinationCoords = (metadata = {}) => {
  const explicitLat =
    metadata?.destination?.lat ??
    metadata?.destination?.latitude ??
    metadata?.route?.destination?.lat ??
    metadata?.route?.destination?.latitude;

  const explicitLng =
    metadata?.destination?.lng ??
    metadata?.destination?.lon ??
    metadata?.destination?.longitude ??
    metadata?.route?.destination?.lng ??
    metadata?.route?.destination?.lon ??
    metadata?.route?.destination?.longitude;

  const parsedLat = toNumber(explicitLat);
  const parsedLng = toNumber(explicitLng);

  if (parsedLat != null && parsedLng != null) {
    return {
      lat: parsedLat,
      lng: parsedLng
    };
  }

  const coordinates = getRouteCoordinates(metadata);
  const last = coordinates[coordinates.length - 1];

  if (Array.isArray(last) && last.length >= 2) {
    const [lng, lat] = last;
    return {
      lat: toNumber(lat),
      lng: toNumber(lng)
    };
  }

  return null;
};

const buildLocation = (metadata, coordsDisplay = null) => {
  const routeOrigin = getRouteOriginCoords(metadata);
  const routeOriginLabel =
    pickFirstString(
      metadata?.origin?.label,
      metadata?.origin?.name,
      metadata?.origin?.address,
      metadata?.route?.origin?.label,
      metadata?.route?.origin?.name,
      metadata?.route?.origin?.address
    ) || formatCoordsLabel(routeOrigin?.lat, routeOrigin?.lng);

  return (
    routeOriginLabel ||
    pickFirstString(
      metadata?.location?.label,
      metadata?.location?.name,
      metadata?.location?.address,
      metadata?.payload?.location,
      metadata?.payload?.locationLabel,
      metadata?.payload?.address,
      metadata?.payload?.placeName,
      pickNestedValue(metadata, LOCATION_KEYS),
      pickNestedValue(metadata?.route, LOCATION_KEYS),
      coordsDisplay
    ) ||
    "No origin available"
  );
};

const buildDestination = (metadata) => {
  const routeDestination = getRouteDestinationCoords(metadata);
  const routeDestinationLabel =
    pickFirstString(
      metadata?.destination?.label,
      metadata?.destination?.name,
      metadata?.destination?.address,
      metadata?.route?.destination?.label,
      metadata?.route?.destination?.name,
      metadata?.route?.destination?.address
    ) || formatCoordsLabel(routeDestination?.lat, routeDestination?.lng);

  return (
    routeDestinationLabel ||
    pickFirstString(
      pickNestedValue(metadata, DESTINATION_KEYS),
      pickNestedValue(metadata?.route, DESTINATION_KEYS)
    ) ||
    "No destination available"
  );
};

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
    humanizeDuration(metadata?.durationMs ? metadata.durationMs / 1000 : null),
    humanizeDuration(
      metadata?.route?.durationMs ? metadata.route.durationMs / 1000 : null
    ),
    pickNestedValue(metadata, ROUTE_DURATION_KEYS),
    pickNestedValue(metadata?.route, ROUTE_DURATION_KEYS),
    fallback
  ) || fallback;

const buildCoords = (metadata) => {
  const routeOrigin = getRouteOriginCoords(metadata);
  if (routeOrigin?.lat != null && routeOrigin?.lng != null) {
    return {
      coords: [routeOrigin.lat, routeOrigin.lng],
      display: formatCoordsLabel(routeOrigin.lat, routeOrigin.lng)
    };
  }

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

  const lat = toNumber(rawLat);
  const lng = toNumber(rawLng);

  if (lat != null && lng != null) {
    return {
      coords: [lat, lng],
      display: formatCoordsLabel(lat, lng)
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
    case "TRIGGERED":
    case "TRIGGER":
      // Backend alerts often mark emergencies/falls as "triggered"; fall back to the meta default
      return fallbackStatus || "Emergency";
    case "ONGOING":
    case "IN_PROGRESS":
    case "ACTIVE":
    case "PENDING":
      return "Ongoing";
    case "CANCELLED":
    case "CANCELED":
    case "CLEARED":
    case "FAILED":
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

export const normalizeDeviceLogs = (
  logs = [],
  selectedDevice = null,
  options = {}
) =>
  toArray(logs)
    .map((log) => {
      const { guardianResolver = null } = options;
      const metadata =
        log?.metadata_json || log?.metadataJson || log?.metadata || {};

      const metadataGuardianId =
        metadata?.guardianId ??
        metadata?.guardian_id ??
        metadata?.guardian?.guardianId ??
        metadata?.guardian?.guardian_id ??
        metadata?.guardian?.id ??
        null;

      const rawType = toLookupKey(log?.activity_type || log?.activityType);
      const rawStatus = toLookupKey(log?.status);

      let normalizedType = DEVICE_LOG_TYPE_ALIASES[rawType] || rawType;

      if (rawType === "ROUTE") {
        if (rawStatus === "ACTIVE" || rawStatus === "PENDING") {
          normalizedType = "SET_ROUTE";
        } else if (rawStatus === "COMPLETED") {
          normalizedType = "REACH_DESTINATION";
        } else if (rawStatus === "CLEARED" || rawStatus === "FAILED") {
          normalizedType = "ROUTE_CLEARED";
        } else {
          normalizedType = "ROUTE_HISTORY";
        }
      }

      if (!DEVICE_LOG_META[normalizedType]) {
        return null;
      }

      const meta = DEVICE_LOG_META[normalizedType];
      const logId = log?.log_id ?? log?.logId;
      const deviceId =
        log?.device_id ?? log?.deviceId ?? selectedDevice?.deviceId;
      const guardianId = toNumber(
        log?.guardian_id ?? log?.guardianId ?? metadataGuardianId
      );
      const rawTimestamp = log?.created_at || log?.createdAt;
      const status = normalizeStatus(log?.status, meta.status);

      const isRoute =
        normalizedType === "SET_ROUTE" ||
        normalizedType === "REACH_DESTINATION" ||
        normalizedType === "ROUTE_CLEARED" ||
        normalizedType === "ROUTE_HISTORY";

      const isAlert =
        normalizedType === "EMERGENCY" || normalizedType === "FALL";

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
      const originCoordsObj = getRouteOriginCoords(metadata);
      const destinationCoordsObj = getRouteDestinationCoords(metadata);
      const routeCoordinates = getRouteCoordinates(metadata);
      const routeLatLng = toLatLngRoute(routeCoordinates);

      const location = buildLocation(
        metadata,
        isAlert ? null : coords?.display
      );
      const destination = isRoute ? buildDestination(metadata) : null;

      const originCoords =
        originCoordsObj?.lat != null && originCoordsObj?.lng != null
          ? [originCoordsObj.lat, originCoordsObj.lng]
          : null;

      const destinationCoords =
        destinationCoordsObj?.lat != null && destinationCoordsObj?.lng != null
          ? [destinationCoordsObj.lat, destinationCoordsObj.lng]
          : null;

      const resolvedGuardian =
        typeof guardianResolver === "function" && guardianId != null
          ? guardianResolver(guardianId)
          : null;

      const guardianName = buildGuardianName(
        metadata,
        resolvedGuardian,
        guardianId
      );

      const guardianDisplayName =
        guardianName && guardianName !== "iCane System" ? guardianName : null;

      let mapMode = "point";
      let isClickable = true;

      if (normalizedType === "SET_ROUTE") {
        // Prefer full route when available so LiveMap can auto-fit; otherwise fall back to destination pin
        const hasRoute = routeLatLng.length >= 2;
        mapMode = hasRoute ? "route-history" : "destination-only";
        isClickable = hasRoute || Boolean(destinationCoords || coords?.coords);
      } else if (normalizedType === "REACH_DESTINATION") {
        mapMode = "route-history";
        isClickable = routeLatLng.length >= 2;
      } else if (normalizedType === "ROUTE_CLEARED") {
        mapMode = "none";
        isClickable = false;
      } else if (normalizedType === "FALL" || normalizedType === "EMERGENCY") {
        mapMode = "point";
        isClickable = Boolean(coords?.coords);
      } else if (normalizedType === "ROUTE_HISTORY") {
        mapMode = routeLatLng.length >= 2 ? "route-history" : "point";
        isClickable = routeLatLng.length >= 2 || Boolean(coords?.coords);
      }

      const baseMessage =
        log?.message ||
        metadata?.message ||
        `${meta.label} was recorded for this device.`;

      const messageWithGuardian =
        guardianDisplayName &&
          (normalizedType === "SET_ROUTE" || normalizedType === "ROUTE_CLEARED")
          ? appendGuardianContext(
            baseMessage,
            normalizedType,
            guardianDisplayName,
            destination
          )
          : baseMessage;

      return {
        id: `device-log-${logId}`,
        logId,
        deviceId,
        guardianId,
        action: normalizedType,
        activityType: normalizedType,
        activity: meta.activity,
        title: meta.label,
        message: messageWithGuardian,
        description: messageWithGuardian,
        guardianName,
        vipName: buildVipName(selectedDevice, metadata),
        avatar: buildAvatar(selectedDevice, metadata),
        location,
        destination,
        coordinates:
          normalizedType === "SET_ROUTE"
            ? destinationCoords || coords?.coords || null
            : coords?.coords || null,
        originCoords,
        destinationCoords,
        routeCoords: routeLatLng,
        routeGeoJson:
          metadata?.routeGeoJson ||
          metadata?.route_geojson ||
          metadata?.route?.routeGeoJson ||
          metadata?.route?.route_geojson ||
          null,
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
        isClickable,
        mapMode,
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
