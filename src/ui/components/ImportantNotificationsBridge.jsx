import { useEffect, useMemo, useRef } from "react";
import { DEFAULT_LOCATION } from "@/api/weatherService";
import { wsApi } from "@/api/ws-api";
import {
  useDeviceLogsStore,
  useDevicesStore,
  useRealtimeStore
} from "@/stores/useStore";
import {
  checkImportantWeatherUpdates,
  notifyEmergencyAlert,
  notifyFallAlert,
  notifyRouteArrival
} from "@/utils/importantNotifications";

const WEATHER_CHECK_INTERVAL_MS = 20 * 60 * 1000;

const buildVipName = (selectedDevice) => {
  const firstName = selectedDevice?.vip?.firstName?.trim();
  const lastName = selectedDevice?.vip?.lastName?.trim();
  const fullName = [firstName, lastName].filter(Boolean).join(" ");

  return fullName || firstName || "the VIP";
};

const buildIncidentContext = (latestContext, payload = {}) => ({
  ...latestContext,
  vipName:
    payload?.vipName ||
    payload?.vip?.name ||
    payload?.vip?.fullName ||
    latestContext.vipName,
  deviceSerial:
    payload?.serial ||
    payload?.deviceSerial ||
    payload?.deviceSerialNumber ||
    latestContext.deviceSerial
});

const ImportantNotificationsBridge = () => {
  const { emergency, fall, gps } = useRealtimeStore();
  const { selectedDevice } = useDevicesStore();
  const { fetchDeviceLogs } = useDeviceLogsStore();
  const latestContextRef = useRef({
    vipName: "the VIP",
    deviceSerial: null,
    lat: DEFAULT_LOCATION.lat,
    lon: DEFAULT_LOCATION.lon,
    locationName: DEFAULT_LOCATION.name
  });
  const previousAlertStateRef = useRef({
    emergency: false,
    fall: false
  });

  const weatherLocationKey = useMemo(() => {
    if (gps?.lat != null && gps?.lng != null) {
      return `${Number(gps.lat).toFixed(2)}:${Number(gps.lng).toFixed(2)}`;
    }

    return `default:${DEFAULT_LOCATION.name}`;
  }, [gps?.lat, gps?.lng]);

  useEffect(() => {
    latestContextRef.current = {
      vipName: buildVipName(selectedDevice),
      deviceSerial: selectedDevice?.deviceSerialNumber || null,
      lat: gps?.lat ?? DEFAULT_LOCATION.lat,
      lon: gps?.lng ?? DEFAULT_LOCATION.lon,
      locationName:
        gps?.lat != null && gps?.lng != null
          ? "the cane's current area"
          : DEFAULT_LOCATION.name
    };
  }, [selectedDevice, gps?.lat, gps?.lng]);

  useEffect(() => {
    if (emergency && !previousAlertStateRef.current.emergency) {
      notifyEmergencyAlert(latestContextRef.current);
    }

    previousAlertStateRef.current.emergency = emergency;
  }, [emergency]);

  useEffect(() => {
    if (fall && !previousAlertStateRef.current.fall) {
      notifyFallAlert(latestContextRef.current);
    }

    previousAlertStateRef.current.fall = fall;
  }, [fall]);

  useEffect(() => {
    const refreshDeviceLogs = () => {
      if (!selectedDevice?.deviceId) return;

      fetchDeviceLogs(selectedDevice.deviceId);
    };

    const handleDestinationReached = () => {
      notifyRouteArrival(latestContextRef.current);
      refreshDeviceLogs();
    };

    const handleEmergencyTriggered = (payload) => {
      notifyEmergencyAlert(
        buildIncidentContext(latestContextRef.current, payload)
      );
      previousAlertStateRef.current.emergency = true;
      refreshDeviceLogs();
    };

    const handleEmergencyStopped = () => {
      previousAlertStateRef.current.emergency = false;
    };

    const handleFallDetected = (payload) => {
      notifyFallAlert(buildIncidentContext(latestContextRef.current, payload));
      previousAlertStateRef.current.fall = true;
      refreshDeviceLogs();
    };

    const handleFallCleared = () => {
      previousAlertStateRef.current.fall = false;
    };

    wsApi.on("destinationReached", handleDestinationReached);
    wsApi.on("emergencyTriggered", handleEmergencyTriggered);
    wsApi.on("emergencyStopped", handleEmergencyStopped);
    wsApi.on("fallDetected", handleFallDetected);
    wsApi.on("fallCleared", handleFallCleared);

    return () => {
      wsApi.off("destinationReached", handleDestinationReached);
      wsApi.off("emergencyTriggered", handleEmergencyTriggered);
      wsApi.off("emergencyStopped", handleEmergencyStopped);
      wsApi.off("fallDetected", handleFallDetected);
      wsApi.off("fallCleared", handleFallCleared);
    };
  }, [fetchDeviceLogs, selectedDevice]);

  useEffect(() => {
    checkImportantWeatherUpdates(latestContextRef.current);
  }, [weatherLocationKey]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      checkImportantWeatherUpdates(latestContextRef.current);
    }, WEATHER_CHECK_INTERVAL_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  return null;
};

export default ImportantNotificationsBridge;
