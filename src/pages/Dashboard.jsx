import { useEffect, useRef, useState } from "react";
import { Icon } from "@iconify/react";
import LiveMap from "@/ui/components/LiveMap";
import RecentAlerts from "@/ui/components/RecentAlert";
import GuardianNetwork from "@/ui/components/GuardianNetwork";
import SendNote from "@/ui/components/SendNote";
import { motion, useAnimation } from "framer-motion";
import { useRealtimeStore } from "@/stores/useStore";
import { getLocationByCoords } from "@/api/locationsApi";

const getGpsBadge = (gps) => {
  if (!gps || Number(gps.status) === 0) {
    return {
      label: "No Signal",
      className: "bg-red-100 text-red-700 border-red-200"
    };
  }

  if (gps.ready) {
    return {
      label: "Ready",
      className: "bg-green-100 text-green-700 border-green-200"
    };
  }

  return {
    label: "Low Signal",
    className: "bg-yellow-100 text-yellow-700 border-yellow-200"
  };
};

const MIN_DISTANCE_METERS = 20;
const MIN_RESOLVE_INTERVAL_MS = 15000;

const toRad = (value) => (value * Math.PI) / 180;

const getDistanceMeters = (lat1, lon1, lat2, lon2) => {
  const R = 6371000;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("track");
  const controls = useAnimation();
  const { gps, lastKnownCanePosition } = useRealtimeStore();

  const [lastLocationLabel, setLastLocationLabel] = useState("Resolving...");
  const [isResolvingLastLocation, setIsResolvingLastLocation] = useState(false);

  const lastResolvedPointRef = useRef(null);
  const lastResolvedTimeRef = useRef(0);
  const locationCacheRef = useRef(new Map());
  const isFetchingLocationRef = useRef(false);

  const badge = getGpsBadge(gps);

  const canePosition =
    gps?.lat != null && gps?.lng != null ? [gps.lat, gps.lng] : null;

  const trackedCanePosition = canePosition || lastKnownCanePosition;

  const lat = trackedCanePosition?.[0] ?? null;
  const lon = trackedCanePosition?.[1] ?? null;

  const cleanPart = (value) => {
    if (typeof value !== "string") return "";
    return value.replace(/\s+/g, " ").trim();
  };

  const formatLocationLabel = (feature) => {
    const geocoding = feature?.properties?.geocoding;

    const candidates = [
      cleanPart(geocoding?.name),
      cleanPart(geocoding?.locality),
      cleanPart(geocoding?.admin?.level10),
      cleanPart(geocoding?.city)
    ];

    const parts = candidates.filter(
      (part, index, array) => part && array.indexOf(part) === index
    );

    return parts.length > 0 ? parts.join(", ") : "Unknown area";
  };

  useEffect(() => {
    if (lat == null || lon == null) {
      setLastLocationLabel("No location available");
      return;
    }

    if (!gps?.ready) {
      return;
    }

    const now = Date.now();
    const lastResolvedPoint = lastResolvedPointRef.current;
    const lastResolvedTime = lastResolvedTimeRef.current;

    if (!lastResolvedPoint) {
      resolveLocation();
      return;
    }

    const distanceMoved = getDistanceMeters(
      lastResolvedPoint.lat,
      lastResolvedPoint.lon,
      lat,
      lon
    );

    const timeElapsed = now - lastResolvedTime;

    if (
      distanceMoved >= MIN_DISTANCE_METERS &&
      timeElapsed >= MIN_RESOLVE_INTERVAL_MS
    ) {
      resolveLocation();
    }

    async function resolveLocation() {
      if (isFetchingLocationRef.current) return;

      const cacheKey = `${Number(lat).toFixed(4)},${Number(lon).toFixed(4)}`;

      if (locationCacheRef.current.has(cacheKey)) {
        setLastLocationLabel(locationCacheRef.current.get(cacheKey));
        lastResolvedPointRef.current = { lat, lon };
        lastResolvedTimeRef.current = Date.now();
        return;
      }

      isFetchingLocationRef.current = true;
      setIsResolvingLastLocation(true);

      try {
        const response = await getLocationByCoords(lat, lon);
        console.log("Location resolution response:", response);
        const feature = response?.features[0];
        const label = formatLocationLabel(feature);

        locationCacheRef.current.set(cacheKey, label);
        setLastLocationLabel(label);
        lastResolvedPointRef.current = { lat, lon };
        lastResolvedTimeRef.current = Date.now();
      } catch (error) {
        console.error("Failed to resolve location:", error);
        setLastLocationLabel("Unable to resolve location");
      } finally {
        isFetchingLocationRef.current = false;
        setIsResolvingLastLocation(false);
      }
    }
  }, [lat, lon, gps?.ready]);

  return (
    <motion.main
      className="bg-white md:bg-[#f9fafb] rounded-t-[32px] md:rounded-none min-h-[calc(100vh-var(--header-height)-var(--mobile-nav-height))] md:min-h-[calc(100vh-var(--header-height))] md:max-h-[calc(100vh-var(--header-height))] overflow-y-visible md:overflow-y-auto p-6 pb-[calc(var(--mobile-nav-height)+1.5rem)] md:pb-6"
      initial={{ backgroundColor: "#ffffff" }}
      animate={controls}
    >
      <div className="w-full space-y-6 sm:space-y-8 max-w-5xl mx-auto md:max-w-none md:mx-0 md:pr-6">
        <div className="mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 text-nowrap">
            Live Location
          </h1>
          <p className="text-gray-600 font-poppins text-xs sm:text-sm hidden sm:block">
            Real-time monitoring and safety features for your iCane device
          </p>
        </div>

        <div className="grid xl:grid-cols-[minmax(0,2fr)_300px] gap-4 sm:gap-8 items-start">
          <div className="flex flex-col gap-4 sm:gap-8">
            <div
              data-tour="tour-live-map"
              className="bg-white rounded-2xl shadow-sm overflow-hidden w-full border border-[#F3F4F6] relative"
            >
              <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <h3 className="text-base sm:text-xl font-semibold text-gray-800 font-poppins">
                    Live Location Tracking
                  </h3>

                  <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <span
                      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium border ${badge.className}`}
                    >
                      <span className="w-2 h-2 rounded-full bg-current opacity-75" />
                      {badge.label}
                    </span>

                    <button
                      onClick={() => setActiveTab("track")}
                      className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg font-poppins font-medium text-xs sm:text-sm flex items-center gap-2 transition-all ${
                        activeTab === "track"
                          ? "bg-primary-100 text-white shadow-md"
                          : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <Icon icon="ph:map-pin-fill" className="text-lg" />
                      Track Live
                    </button>
                  </div>
                </div>
              </div>

              <div className="w-full h-[70vh] sm:h-[60vh] relative rounded-2xl overflow-hidden">
                <LiveMap />
              </div>

              <div
                data-tour="tour-gps-info"
                className="w-full border-t border-gray-100 px-4 sm:px-6 py-3 sm:py-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                      <Icon
                        icon="mdi:satellite-variant"
                        className="text-blue-600 text-xl"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-gray-500 font-medium">
                        Satellites
                      </p>
                      <p className="text-base sm:text-lg font-semibold text-gray-800">
                        {gps?.sats ?? 0}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
                      <Icon
                        icon="mdi:map-marker-radius"
                        className="text-green-600 text-xl"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-gray-500 font-medium">
                        Last Location
                      </p>
                      <div className="flex items-center gap-2">
                        <p className="text-sm sm:text-base font-medium text-gray-800 break-all">
                          {lastLocationLabel}
                        </p>
                        {isResolvingLastLocation && (
                          <span className="text-xs text-gray-400">
                            Updating...
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-2">
              <div data-tour="tour-guardian-network">
                <GuardianNetwork />
              </div>
              <div data-tour="tour-recent-alerts">
                <RecentAlerts />
              </div>
            </div>
          </div>

          <div
            data-tour="tour-send-note"
            className="flex flex-col gap-8 w-full"
          >
            <SendNote />
          </div>
        </div>
      </div>
    </motion.main>
  );
};

export default Dashboard;
