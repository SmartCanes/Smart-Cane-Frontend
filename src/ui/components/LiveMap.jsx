import { useEffect, useRef, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  GeoJSON,
  useMapEvents,
  Polyline
} from "react-leaflet";
import { Icon } from "@iconify/react";
import { AnimatePresence, motion } from "framer-motion";
import L from "leaflet";
import CustomZoomControl from "./CustomZoomControl";
import saintFrancis from "@/data/saint-francis";
import { getLocation } from "@/api/locationsApi";
import { wsApi } from "@/api/ws-api";
import "leaflet-polylinedecorator";
import {
  useDevicesStore,
  useRealtimeStore,
  useRouteStore,
  useUserStore
} from "@/stores/useStore";
import { resolveProfileImageSrc } from "@/utils/ResolveImage";

const circleAvatarIcon = (imgUrl, size = 40) => {
  return L.divIcon({
    html: `<div style="
      width: ${size}px;
      height: ${size}px;
      border-radius: 50%;
      overflow: hidden;
      border: 1px solid white;
      box-shadow: 0 0 5px rgba(0,0,0,0.5);
    ">
      <img src="${resolveProfileImageSrc(imgUrl)}" style="width: 100%; height: 100%; object-fit: cover;" />
    </div>`,
    className: "",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2]
  });
};

const SmoothMarker = ({ position, icon, duration = 400 }) => {
  const markerRef = useRef(null);
  const [currentPos, setCurrentPos] = useState(position);

  const animatePosition = (from, to, duration) => {
    let start = null;

    const step = (timestamp) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);

      const lat = from[0] + (to[0] - from[0]) * progress;
      const lng = from[1] + (to[1] - from[1]) * progress;

      setCurrentPos([lat, lng]);

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
  };

  useEffect(() => {
    if (
      !position ||
      (currentPos[0] === position[0] && currentPos[1] === position[1])
    )
      return;

    animatePosition(currentPos, position, duration);
  }, [position]);

  return <Marker position={currentPos} icon={icon} ref={markerRef} />;
};

const FitBoundsToRoute = ({ canePos, destPos, route, shouldFit }) => {
  const map = useMap();

  useEffect(() => {
    if (!map || !route || route.length === 0 || !shouldFit) return;

    const bounds = L.latLngBounds([canePos, destPos]);
    map.fitBounds(bounds, { padding: [50, 50], animate: true });
  }, [map, canePos, destPos, route, shouldFit]);

  return null;
};

const SetMapBounds = () => {
  const map = useMap();

  useEffect(() => {
    const bounds = L.geoJSON(saintFrancis).getBounds();
    map.fitBounds(bounds);
    map.setMinZoom(15);
    map.setMaxZoom(18);
  }, [map]);

  return null;
};

function MapSelectHandler({ onSelect, menuOpen }) {
  useMapEvents({
    click(e) {
      if (menuOpen) return;
      onSelect([e.latlng.lat, e.latlng.lng]);
    }
  });

  return null;
}

const haversine = (a, b) => {
  const R = 6371000;

  const φ1 = (a[0] * Math.PI) / 180;
  const φ2 = (b[0] * Math.PI) / 180;

  const Δφ = ((b[0] - a[0]) * Math.PI) / 180;
  const Δλ = ((b[1] - a[1]) * Math.PI) / 180;

  const s =
    Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;

  return 2 * R * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
};

function LiveMap() {
  const { user } = useUserStore();
  const { canePosition, guardianPosition } = useRealtimeStore();
  const { selectedDevice } = useDevicesStore();
  const {
    destinationPos,
    routeCoords,
    completedRoute,
    remainingRoute,
    activeIndex,
    setRoute,
    updateProgress,
    clearRoute
  } = useRouteStore();

  const mapRef = useRef(null);
  const ignoreNextFetch = useRef(false);
  const [toast, setToast] = useState({ show: false, type: "", message: "" });
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [markerPos, setMarkerPos] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [previewPos, setPreviewPos] = useState(null);
  const [isUserFollowingCane, setIsUserFollowingCane] = useState(false);
  const [isFreeMode, setIsFreeMode] = useState(false);
  const routeRequestedRef = useRef(false);
  const routeCoordsRef = useRef([]);
  const activeIndexRef = useRef(0);

  useEffect(() => {
    if (routeCoords?.length) {
      routeCoordsRef.current = routeCoords;
      activeIndexRef.current = activeIndex || 0;
    }
  }, []);

  useEffect(() => {
    const handleDestinationReached = () => {
      const { clearRoute } = useRouteStore.getState();

      clearRoute();

      routeCoordsRef.current = [];
      activeIndexRef.current = 0;

      routeRequestedRef.current = false;

      setPreviewPos(null);
      setIsUserFollowingCane(false);
      setIsFreeMode(false);

      setToast({
        show: true,
        type: "info",
        message: "Destination reached and cleared"
      });
    };

    const handleDestinationCleared = () => {
      clearRoute();

      setPreviewPos(null);
      setIsUserFollowingCane(false);
      setIsFreeMode(false);

      routeCoordsRef.current = [];
      activeIndexRef.current = 0;
      routeRequestedRef.current = false;

      setToast({
        show: true,
        type: "info",
        message: "Destination cleared"
      });
    };

    wsApi.on("destinationReached", handleDestinationReached);
    wsApi.on("destinationCleared", handleDestinationCleared);

    return () => {
      wsApi.off("destinationReached", handleDestinationReached);
      wsApi.off("destinationCleared", handleDestinationCleared);
    };
  }, []);

  useEffect(() => {
    if (!destinationPos || !selectedDevice) return;
    if (routeRequestedRef.current) return;

    routeRequestedRef.current = true;

    wsApi.emit("requestRoute", {
      to: destinationPos
    });

    const handleRoute = (data) => {
      const coords = data?.route.paths?.[0]?.points?.coordinates;
      if (!Array.isArray(coords) || coords.length < 2) return;

      const leafletCoords = coords.map(([lon, lat]) => [lat, lon]);

      routeCoordsRef.current = leafletCoords;
      activeIndexRef.current = 0;
      setRoute({
        destinationPos,
        routeCoords: leafletCoords
      });
    };

    const handleError = () => {
      routeRequestedRef.current = false;
      clearRoute();
    };

    wsApi.on("routeResponse", handleRoute);
    wsApi.on("routeError", handleError);

    return () => {
      wsApi.off("routeResponse", handleRoute);
      wsApi.off("routeError", handleError);
    };
  }, [destinationPos, selectedDevice]);

  const advanceRoute = (currentPos) => {
    const coords = routeCoordsRef.current;
    if (!coords.length) return;

    let closestPointOnRoute = null;
    let minDist = Infinity;
    let segmentIndex = -1;
    let t = 0;

    for (let i = 0; i < coords.length - 1; i++) {
      const a = coords[i];
      const b = coords[i + 1];

      // Find closest point on segment AB to current position
      const closest = getClosestPointOnSegment(currentPos, a, b);
      const dist = haversine(currentPos, closest);

      if (dist < minDist) {
        minDist = dist;
        closestPointOnRoute = closest;
        segmentIndex = i;
        // Calculate interpolation factor
        const segmentLength = haversine(a, b);
        if (segmentLength > 0) {
          t = haversine(a, closest) / segmentLength;
        } else {
          t = 0;
        }
      }
    }

    if (minDist <= 20 && segmentIndex >= 0) {
      const virtualIndex = segmentIndex + t;

      if (virtualIndex > activeIndexRef.current) {
        activeIndexRef.current = virtualIndex;

        splitRouteAtVirtualIndex(virtualIndex);
      }
    }
  };

  const getClosestPointOnSegment = (p, a, b) => {
    const ax = a[1];
    const ay = a[0];
    const bx = b[1];
    const by = b[0];
    const px = p[1];
    const py = p[0];

    // Vector AB
    const abx = bx - ax;
    const aby = by - ay;

    // Vector AP
    const apx = px - ax;
    const apy = py - ay;

    // Project AP onto AB
    const ab2 = abx * abx + aby * aby;
    const ap_ab = apx * abx + apy * aby;

    // Normalized distance along AB
    let t = ap_ab / ab2;

    // Clamp to segment
    t = Math.max(0, Math.min(1, t));

    // Calculate closest point
    return [ay + aby * t, ax + abx * t];
  };

  const splitRouteAtVirtualIndex = (virtualIndex) => {
    const coords = routeCoordsRef.current;
    const floorIndex = Math.floor(virtualIndex);
    const fraction = virtualIndex - floorIndex;

    if (floorIndex >= coords.length - 1) {
      updateProgress({
        completedRoute: coords,
        remainingRoute: [],
        activeIndex: virtualIndex
      });
    } else {
      const a = coords[floorIndex];
      const b = coords[floorIndex + 1];

      const interpolatedPoint = [
        a[0] + (b[0] - a[0]) * fraction,
        a[1] + (b[1] - a[1]) * fraction
      ];

      const completed = [...coords.slice(0, floorIndex + 1), interpolatedPoint];
      const remaining = [interpolatedPoint, ...coords.slice(floorIndex + 1)];

      updateProgress({
        completedRoute: completed,
        remainingRoute: remaining,
        activeIndex: virtualIndex
      });
    }
  };

  useEffect(() => {
    if (!canePosition) return;

    advanceRoute(canePosition);
  }, [canePosition]);

  useEffect(() => {
    if (!searchQuery) {
      setSearchResults([]);
      setIsLoading(false);
      return;
    }

    if (ignoreNextFetch.current) {
      ignoreNextFetch.current = false;
      return;
    }

    let cancelled = false;

    setIsLoading(true);
    const delay = setTimeout(async () => {
      try {
        const data = await getLocation(searchQuery);
        if (!cancelled) setSearchResults(data.features);
      } catch (err) {
        console.error(err);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(delay);
    };
  }, [searchQuery]);

  const handleResultClick = (item) => {
    const [lon, lat] = item.geometry.coordinates;
    const position = [lat, lon];

    if (mapRef.current) {
      mapRef.current.flyTo(position, 18);
    }
    setMarkerPos(position);
    ignoreNextFetch.current = true;
    setSearchQuery(item.properties.name);
    setSearchResults([]);
    setIsFreeMode(true); // Enter free mode when user searches
  };

  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    const handleMapMove = () => {
      if (previewPos) {
        setPreviewPos(null);
      }
      // setIsFreeMode(true);
      setIsUserFollowingCane(false);
    };

    // const handleZoom = () => {
    //   // Zooming within bounds keeps free mode active
    //   setIsFreeMode(true);
    // };

    map.on("movestart", handleMapMove);
    // map.on("zoomstart", handleZoom);

    return () => {
      map.off("movestart", handleMapMove);
      // map.off("zoomstart", handleZoom);
    };
  }, [previewPos]);

  useEffect(() => {
    if (isUserFollowingCane && canePosition && mapRef.current) {
      mapRef.current.flyTo(canePosition, mapRef.current.getZoom(), {
        duration: 0.5
      });
    }
  }, [isUserFollowingCane, canePosition]);

  const handleFocusOnCane = () => {
    if (!canePosition || !mapRef.current) return;

    const targetZoom = 18; // zoom level when focusing on cane
    mapRef.current.flyTo(canePosition, targetZoom, { duration: 0.5 });

    setIsUserFollowingCane(true);
    setIsFreeMode(false);
  };

  const handleFocusOnUser = () => {
    if (!guardianPosition) return;
    if (mapRef.current)
      mapRef.current.flyTo(guardianPosition, mapRef.current.getZoom(), {
        duration: 0.5
      });
    setIsUserFollowingCane(false);
    setIsFreeMode(true);
  };

  const handleZoomIn = () => {
    if (mapRef.current) mapRef.current.zoomIn();
    setIsFreeMode(true);
  };

  const handleZoomOut = () => {
    if (mapRef.current) mapRef.current.zoomOut();
    setIsFreeMode(true);
  };

  return (
    <div className="relative w-full h-full z-0">
      <div className="absolute top-4 left-4 right-4 z-30 flex items-center justify-between gap-2 ">
        {/* Search container */}
        <div className="flex-1 sm:max-w-sm relative">
          <input
            type="text"
            placeholder="Search location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full h-12 pl-12 pr-12 font-poppins text-sm text-gray-800 placeholder-gray-400 border-0
          shadow-md transition duration-200 ease-in-out focus:outline-none bg-white 
          ${isLoading || (searchQuery && searchResults.length > 0) ? "rounded-t-2xl" : "rounded-2xl"}`}
          />

          <Icon
            icon="mdi:magnify"
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 text-lg pointer-events-none"
          />

          {searchQuery && !isLoading && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition cursor-pointer"
            >
              ✕
            </button>
          )}

          <AnimatePresence>
            {(isLoading || searchResults.length > 0) && (
              <motion.div className="absolute top-12 left-0 w-full bg-white shadow-md rounded-b-2xl overflow-hidden z-20">
                {isLoading
                  ? Array(3)
                      .fill(0)
                      .map((_, idx) => (
                        <motion.div
                          key={idx}
                          className="h-12 px-3 flex items-center gap-3 border-b border-gray-100"
                          initial={{ opacity: 0.3 }}
                          animate={{ opacity: 1 }}
                          transition={{
                            repeat: Infinity,
                            repeatType: "mirror",
                            duration: 0.8,
                            delay: idx * 0.1
                          }}
                        >
                          <div className="w-10 h-10 bg-gray-200 rounded-full" />
                          <div className="flex-1 space-y-1 py-1">
                            <div className="h-3 bg-gray-200 rounded w-3/4" />
                            <div className="h-2 bg-gray-200 rounded w-1/2" />
                          </div>
                        </motion.div>
                      ))
                  : searchResults.map((result, idx) => (
                      <div
                        key={idx}
                        onClick={() => handleResultClick(result)}
                        className="cursor-pointer hover:bg-blue-50 transition border-b border-gray-100 p-3 flex items-center gap-3"
                      >
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Icon
                            icon="mdi:map-marker"
                            className="text-blue-600 text-xl"
                          />
                        </div>
                        <div>
                          <p className="font-poppins font-medium text-sm text-gray-800">
                            {result.properties.name}
                          </p>
                          <p className="font-poppins text-xs text-gray-500">
                            {result.properties.city ||
                              result.properties.state ||
                              "Philippines"}
                          </p>
                        </div>
                      </div>
                    ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        {destinationPos && (
          <button
            onClick={() => {
              if (!selectedDevice?.deviceSerialNumber) return;

              wsApi.emit("clearDestination");
            }}
            className="flex items-center justify-center w-10 h-10 sm:w-auto sm:h-auto sm:px-4 sm:py-3 sm:justify-start bg-white/95 hover:bg-white text-gray-800 hover:text-red-600 rounded-full sm:rounded-xl shadow-lg hover:shadow-xl border border-gray-300 hover:border-red-300 text-sm font-medium transition-all duration-200 cursor-pointer group active:scale-[0.98] backdrop-blur-sm shrink-0"
            aria-label="Clear destination"
          >
            <Icon
              icon="mdi:close"
              className="w-5 h-5 group-hover:scale-110 transition-transform"
            />
            <span className="hidden sm:inline ml-2">Clear Destination</span>
          </button>
        )}
      </div>
      <MapContainer
        center={guardianPosition}
        zoom={16}
        style={{ height: "100%", width: "100%" }}
        zoomControl={false}
        className="z-0"
        ref={mapRef}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <GeoJSON
          data={saintFrancis}
          style={{
            color: "#1E90FF",
            weight: 2,
            fillColor: "#1E90FF",
            fillOpacity: 0.15
          }}
        />

        {guardianPosition && (
          <SmoothMarker
            position={guardianPosition}
            icon={circleAvatarIcon(user.guardianImageUrl)}
            popupText="Your current location."
          />
        )}

        {canePosition && (
          <SmoothMarker
            position={canePosition}
            icon={circleAvatarIcon(selectedDevice?.vip?.vipImageUrl)}
            popupText="VIP current location."
          />
        )}

        <SetMapBounds />

        {/* Only apply bounds logic when there's a route */}
        {remainingRoute.length > 0 && !isUserFollowingCane && (
          <FitBoundsToRoute
            canePos={canePosition}
            destPos={destinationPos}
            route={remainingRoute}
            shouldFit={!isFreeMode && !isUserFollowingCane}
          />
        )}

        <CustomZoomControl
          onFocusOnCane={handleFocusOnCane}
          onFocusOnUser={handleFocusOnUser}
          isFreeMode={isFreeMode}
          setIsFreeMode={setIsFreeMode}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          isUserFollowingCane={isUserFollowingCane}
          setIsUserFollowingCane={setIsUserFollowingCane}
        />

        {destinationPos && (
          <Marker position={destinationPos}>
            <Popup>Destination</Popup>
          </Marker>
        )}

        <MapSelectHandler
          onSelect={(pos) => {
            setPreviewPos(pos);
            setIsFreeMode(true); // Enter free mode when selecting location
          }}
          menuOpen={!!previewPos}
        />

        {previewPos && (
          <Marker
            position={previewPos}
            draggable
            eventHandlers={{
              dragend: (e) => {
                const p = e.target.getLatLng();
                setPreviewPos([p.lat, p.lng]);
              }
            }}
          >
            <Popup>Adjust location</Popup>
          </Marker>
        )}
        {previewPos && (
          <ClickMenu
            previewPos={previewPos}
            onSetDestination={() => {
              setRoute({
                destinationPos: previewPos,
                routeCoords: []
              });
              setPreviewPos(null);
              setIsFreeMode(false); // Exit free mode when setting destination
            }}
            onClose={() => setPreviewPos(null)}
          />
        )}

        {completedRoute.length > 0 && (
          <Polyline
            positions={completedRoute}
            weight={6}
            color="#999"
            opacity={0.5}
            lineCap="round"
            lineJoin="round"
          />
        )}

        {remainingRoute.length > 0 && (
          <Polyline
            positions={remainingRoute}
            weight={6}
            color="#2563eb"
            opacity={1}
            lineCap="round"
            lineJoin="round"
          />
        )}
      </MapContainer>
    </div>
  );
}

export default LiveMap;

const ClickMenu = ({ previewPos, onSetDestination, onClose }) => {
  const map = useMap();

  if (!previewPos) return null;

  const latlng = L.latLng(previewPos[0], previewPos[1]);
  const point = map.latLngToContainerPoint(latlng);

  const menuWidth = 220;
  const menuHeight = 120;
  const padding = 10;
  const OFFSET = 75;

  const mapSize = map.getSize();

  const MIN_TOP = 72;

  let left = point.x;
  let top = point.y - menuHeight - OFFSET;
  let transform = "translate(-50%, 0)";

  if (top < MIN_TOP) {
    top = point.y + 12;
  }

  if (left - menuWidth / 2 < padding) left = menuWidth / 2 + padding;

  if (left + menuWidth / 2 > mapSize.x - padding)
    left = mapSize.x - menuWidth / 2 - padding;

  if (top + menuHeight > mapSize.y - padding) {
    left = point.x + 12;
    top = point.y - menuHeight / 2;
    transform = "translate(0, -50%)";

    if (left + menuWidth > mapSize.x - padding) {
      left = point.x - menuWidth - 12;
    }
  }

  return (
    <div
      className="click-menu-container absolute bg-white rounded-xl shadow-lg p-4 w-[220px] z-[999] border border-gray-200"
      style={{
        left,
        top,
        transform
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between mb-3">
        <p className="font-medium text-sm text-gray-800">Choose Action</p>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition p-1"
        >
          <Icon icon="mdi:close" className="text-lg" />
        </button>
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onSetDestination();
        }}
        className="w-full flex items-center justify-center gap-2 bg-green-50 text-green-600 hover:bg-green-100 p-3 text-sm rounded-lg font-medium transition"
      >
        <Icon icon="mdi:flag" className="text-base" />
        <span>Set as Destination</span>
      </button>
    </div>
  );
};
