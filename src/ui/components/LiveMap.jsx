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
import L from "leaflet";
import CustomZoomControl from "./CustomZoomControl";
import Loader from "./Loading";
import saintFrancis from "@/data/saint-francis";
import { getLocation } from "@/api/locationsApi";
import { wsApi } from "@/api/ws-api";
import "leaflet-polylinedecorator";
import { useUserStore } from "@/stores/useStore";
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
const FitBoundsToRoute = ({ userPos, destPos }) => {
  const map = useMap();

  useEffect(() => {
    if (userPos && destPos) {
      const bounds = L.latLngBounds([userPos, destPos]);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [userPos, destPos, map]);

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

function LiveMap({
  guardianPosition,
  // canePosition,
  routePath,
  activeTab,
  onSetDestination
}) {
  const { user } = useUserStore();
  const mapRef = useRef(null);
  const ignoreNextFetch = useRef(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [markerPos, setMarkerPos] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [previewPos, setPreviewPos] = useState(null);
  const [canePosition, setCanePosition] = useState(null);
  const [destinationPos, setDestinationPos] = useState(null);
  const [route, setRoute] = useState([]);

  useEffect(() => {
    if (!guardianPosition || !destinationPos) return;

    wsApi.emit("requestRoute", {
      from: [14.693, 121.02],
      to: destinationPos
    });

    const handleRoute = (data) => {
      const coords = data.route;

      if (!Array.isArray(coords) || coords.length < 2) return;

      const leafletCoords = coords.map(([lon, lat]) => [lat, lon]);

      setRoute(leafletCoords);
    };

    const handleError = (err) => {
      console.error("Route error:", err.message);
      setRoute([]);
    };

    wsApi.on("routeResponse", handleRoute);
    wsApi.on("routeError", handleError);

    wsApi.on("location", (data) => {
      if (data?.lat != null && data?.lng != null) {
        const newPos = [data.lat, data.lng];
        setCanePosition(newPos);

        if (destinationPos) {
          wsApi.emit("requestRoute", {
            from: newPos,
            to: destinationPos
          });
        }
      }
    });

    return () => {
      wsApi.off("routeResponse", handleRoute);
      wsApi.off("routeError", handleError);
      wsApi.off("location");
    };
  }, [guardianPosition, destinationPos]);

  useEffect(() => {
    if (!searchQuery) {
      setSearchResults([]);
      return;
    }

    if (ignoreNextFetch.current) {
      ignoreNextFetch.current = false;
      return;
    }

    const delay = setTimeout(async () => {
      setIsLoading(true);
      try {
        const data = await getLocation(searchQuery);
        setSearchResults(data.features);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(delay);
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
  };

  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    const handleMapMove = () => {
      if (previewPos) {
        setPreviewPos(null);
      }
    };

    map.on("movestart", handleMapMove);

    return () => {
      map.off("movestart", handleMapMove);
    };
  }, [previewPos]);

  return (
    <div className="relative w-full h-full">
      <div className="absolute top-4 left-4 right-4 sm:right-auto z-[998] sm:w-[260px]">
        <div className="relative">
          <input
            type="text"
            placeholder="Search location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full h-12 pl-12 pr-10 font-poppins text-sm text-gray-800 placeholder-gray-400 shadow-md border-0
            transition duration-200 ease-in-out focus:outline-none bg-white
            ${searchQuery && searchResults.length > 0 ? "rounded-t-2xl" : "rounded-2xl"}`}
          />
          <Icon
            icon="mdi:magnify"
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 text-lg pointer-events-none"
          />

          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>
        {/* Suggestions Dropdown */}
        {searchResults.length > 0 && (
          <div className="absolute top-12 left-0 w-full overflow-hidden rounded-b-2xl bg-white shadow-md pointer-events-auto z-20">
            {searchResults.map((result, idx) => (
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
          </div>
        )}
      </div>
      {isLoading && (
        <div className="absolute inset-0 z-[15] flex items-center justify-center bg-gray-50/90 backdrop-blur-[1px] rounded-2xl">
          <Loader />
        </div>
      )}
      <MapContainer
        center={guardianPosition}
        zoom={16}
        style={{ height: "100%", width: "100%" }}
        zoomControl={false}
        className="z-10"
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
          <Marker
            position={guardianPosition}
            icon={circleAvatarIcon(user.guardianImageUrl)}
          >
            <Popup>Your current location.</Popup>
          </Marker>
        )}

        {canePosition && (
          <Marker position={canePosition}>
            <Popup>VIP current location.</Popup>
          </Marker>
        )}

        <SetMapBounds />
        <FitBoundsToRoute userPos={guardianPosition} destPos={destinationPos} />

        <CustomZoomControl
          guardianPosition={guardianPosition}
          canePosition={canePosition}
        />

        {destinationPos && (
          <Marker position={destinationPos}>
            <Popup>Destination</Popup>
          </Marker>
        )}

        <MapSelectHandler
          onSelect={(pos) => {
            setPreviewPos(pos);
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
              setDestinationPos(previewPos);
              onSetDestination({ to: previewPos });
              setPreviewPos(null);
            }}
            onClose={() => setPreviewPos(null)}
          />
        )}
        {route.length > 0 && (
          <>
            {/* Shadow / outline */}
            <Polyline
              positions={route}
              weight={10}
              color="#000"
              opacity={0.25}
              lineCap="round"
              lineJoin="round"
            />

            {/* Main route */}
            <Polyline
              positions={route}
              weight={6}
              color="#2563eb"
              opacity={1}
              lineCap="round"
              lineJoin="round"
            />
          </>
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

  // Clamp horizontally
  if (left - menuWidth / 2 < padding) left = menuWidth / 2 + padding;

  if (left + menuWidth / 2 > mapSize.x - padding)
    left = mapSize.x - menuWidth / 2 - padding;

  // If still overlapping bottom → RIGHT
  if (top + menuHeight > mapSize.y - padding) {
    left = point.x + 12;
    top = point.y - menuHeight / 2;
    transform = "translate(0, -50%)";

    // If right side overflows → LEFT
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
        onClick={onSetDestination}
        className="w-full flex items-center justify-center gap-2 bg-green-50 text-green-600 hover:bg-green-100 p-3 text-sm rounded-lg font-medium transition"
      >
        <Icon icon="mdi:flag" className="text-base" />
        <span>Set as Destination</span>
      </button>
    </div>
  );
};
