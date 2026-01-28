import { useEffect, useRef, useState, useCallback } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  GeoJSON,
  useMapEvents
} from "react-leaflet";
import { Icon } from "@iconify/react";
import L from "leaflet";
import CustomZoomControl from "./CustomZoomControl";
import Loader from "./Loading";
import saintFrancis from "@/data/saint-francis";
import { getLocation } from "@/api/locationsApi";

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

// Simple click handler component
function MapClickHandler({ onMapClick }) {
  const map = useMapEvents({
    click: (e) => {
      console.log("Map clicked!", e.latlng);
      const mapContainer = map.getContainer();
      const rect = mapContainer.getBoundingClientRect();

      onMapClick({
        lat: e.latlng.lat,
        lng: e.latlng.lng,
        screenX: e.containerPoint.x,
        screenY: e.containerPoint.y,
        mapLeft: rect.left,
        mapTop: rect.top
      });
    }
  });
  return null;
}

function FloatingCursor({ isSelecting, isMenuOpen }) {
  const [pos, setPos] = useState({ x: -100, y: -100 });

  useEffect(() => {
    if (!isSelecting) {
      setPos({ x: -100, y: -100 }); // hide offscreen
      return;
    }

    const handleMouseMove = (e) => {
      setPos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [isSelecting]);

  return isSelecting ? (
    <Icon
      icon="mdi:map-marker"
      className="text-red-500 text-5xl pointer-events-none fixed"
      style={{
        left: pos.x,
        top: pos.y,
        transform: "translate(-50%, -100%)",
        zIndex: isMenuOpen ? 9997 : 9999
      }}
    />
  ) : null;
}

function LiveMap({
  guardianPosition,
  canePosition,
  destPos,
  routePath,
  activeTab,
  onSetDestination
}) {
  const mapRef = useRef(null);
  const ignoreNextFetch = useRef(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [clickMenuPos, setClickMenuPos] = useState(null);
  const [markerPos, setMarkerPos] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false);
  const [previewPos, setPreviewPos] = useState(null);
  const [destinationPos, setDestinationPos] = useState(null);

  const isMobile = window.innerWidth < 640;

  useEffect(() => {
    console.log("clickMenuPos changed:", clickMenuPos);
  }, [clickMenuPos]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        clickMenuPos &&
        !e.target.closest(".click-menu-container") &&
        !e.target.closest(".leaflet-container")
      ) {
        setClickMenuPos(null);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [clickMenuPos]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && clickMenuPos) {
        setClickMenuPos(null);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [clickMenuPos]);

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

  const handleSetDestinationFromMenu = useCallback(
    (type, pos) => {
      console.log("Setting destination:", type, pos);
      setClickMenuPos(null);

      if (type === "to") {
        setDestinationPos(pos);
      }

      if (onSetDestination) {
        onSetDestination({ [type]: pos });
      }

      setPreviewPos(null); // remove preview
    },
    [onSetDestination]
  );

  const handleMapClick = useCallback(
    (pos) => {
      // Always show the preview marker at click location
      setPreviewPos([pos.lat, pos.lng]);

      if (isMobile) {
        // mobile: open menu immediately
        setClickMenuPos(pos);
        return;
      }

      // desktop: first click starts selection mode
      if (!isSelecting) {
        setIsSelecting(true);
        return;
      }

      // second click: show menu
      setClickMenuPos(pos);
      setIsSelecting(false);
    },
    [isSelecting, isMobile]
  );

  const handleCloseMenu = useCallback(() => {
    setClickMenuPos(null);
    setIsSelecting(false); // disable cursor pin
  }, []);

  return (
    <div className="relative w-full h-full">
      <div className="absolute top-4 left-4 right-4 sm:right-auto z-[1000] sm:w-[260px]">
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
          <Marker position={guardianPosition}>
            <Popup>Your current location.</Popup>
          </Marker>
        )}

        {canePosition && (
          <Marker position={canePosition}>
            <Popup>VIP current location.</Popup>
          </Marker>
        )}

        <SetMapBounds />

        <FitBoundsToRoute
          guardianPosition={guardianPosition}
          destPos={destPos}
        />
        <CustomZoomControl
          guardianPosition={guardianPosition}
          canePosition={canePosition}
        />
        {destinationPos && (
          <Marker position={destinationPos}>
            <Popup>Destination</Popup>
          </Marker>
        )}

        {/* Add the MapClickHandler component */}
        <MapClickHandler onMapClick={handleMapClick} />
      </MapContainer>

      {/* Render ClickMenu if clickMenuPos exists */}
      {clickMenuPos && (
        <ClickMenu
          clickPos={clickMenuPos}
          onSetDestination={handleSetDestinationFromMenu}
          onClose={handleCloseMenu}
        />
      )}

      <FloatingCursor isMenuOpen={!!clickMenuPos} isSelecting={isSelecting} />
    </div>
  );
}

export default LiveMap;

const ClickMenu = ({ clickPos, canePosition, onSetDestination, onClose }) => {
  if (!clickPos) return null;

  // Absolute screen position
  const absoluteLeft = (clickPos.mapLeft || 0) + clickPos.screenX;
  const absoluteTop = (clickPos.mapTop || 0) + clickPos.screenY;

  // Menu dimensions
  const menuWidth = 220;
  const menuHeight = 120;
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  // Adjust position
  let left = absoluteLeft;
  let top = absoluteTop;
  if (absoluteLeft + menuWidth / 2 > viewportWidth)
    left = viewportWidth - menuWidth / 2 - 10;
  if (absoluteLeft - menuWidth / 2 < 0) left = menuWidth / 2 + 10;
  top =
    absoluteTop - menuHeight - 10 < 0
      ? absoluteTop + 20
      : absoluteTop - menuHeight - 10;

  return (
    <>
      {window.innerWidth < 640 && (
        <div className="fixed inset-0 bg-black/20 z-[9998]" onClick={onClose} />
      )}

      <div
        className="click-menu-container fixed bg-white rounded-xl shadow-lg p-4 w-[220px] z-[9999] border border-gray-200"
        style={{
          left: `${left}px`,
          top: `${top}px`,
          transform: "translate(-50%, 0)"
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <p className="font-medium text-sm text-gray-800">Choose Action</p>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition p-1 cursor-pointer"
            aria-label="Close menu"
          >
            <Icon icon="mdi:close" className="text-lg" />
          </button>
        </div>

        <div className="flex flex-col gap-2">
          {/* Set as Destination */}
          <button
            onClick={() => {
              onSetDestination("to", [clickPos.lat, clickPos.lng]);
              onClose();
            }}
            className="w-full flex items-center justify-center gap-2 bg-green-50 text-green-600 hover:bg-green-100 p-3 text-sm rounded-lg font-medium transition cursor-pointer"
          >
            <Icon icon="mdi:flag" className="text-base" />
            <span>Set as Destination</span>
          </button>

          {/* Quick Set from canePosition */}
          {canePosition && (
            <button
              onClick={() => {
                onSetDestination("from", canePosition);
                onClose();
              }}
              className="w-full flex items-center justify-center gap-2 bg-blue-50 text-blue-600 hover:bg-blue-100 p-3 text-sm rounded-lg font-medium transition"
            >
              <Icon icon="mdi:map-marker-path" className="text-base" />
              <span>Use VIP Location</span>
            </button>
          )}
        </div>
      </div>
    </>
  );
};
