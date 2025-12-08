import { useEffect, useRef, useState } from "react";
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
    // map.setMaxBounds(bounds);
    map.fitBounds(bounds);
    map.setMinZoom(15);
    map.setMaxZoom(18);
  }, [map]);

  return null;
};

const ClickHandler = ({ onClickMap }) => {
  useMapEvents({
    click: (e) => {
      onClickMap({
        lat: e.latlng.lat,
        lng: e.latlng.lng,
        screenX: e.containerPoint.x,
        screenY: e.containerPoint.y
      });
    }
  });

  return null;
};

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

  const handleSetDestinationFromMenu = (type, pos) => {
    setClickMenuPos(null);

    if (type === "from") {
      onSetDestination?.({ from: pos });
    }

    if (type === "to") {
      onSetDestination?.({ to: pos });
    }
  };

  return (
    <div className="relative w-full h-full">
      <div className="absolute top-4 left-4 right-4 sm:right-auto z-20 sm:w-[260px]">
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

        {/* <Marker position={destPos}>
          <Popup>Ito ang destination: SM Novaliches</Popup>
        </Marker> */}

        {/* {shouldShowRoute && routePath && (
          <Polyline positions={routePath} color="blue" weight={5} />
        )} */}

        <SetMapBounds />

        <FitBoundsToRoute
          guardianPosition={guardianPosition}
          destPos={destPos}
        />
        <CustomZoomControl guardianPosition={guardianPosition} />

        <ClickHandler onClickMap={setClickMenuPos} />
      </MapContainer>
      <ClickMenu
        clickPos={clickMenuPos}
        onSetDestination={handleSetDestinationFromMenu}
      />
    </div>
  );
}

export default LiveMap;

const ClickMenu = ({ clickPos, onSetDestination }) => {
  if (!clickPos) return null;

  return (
    <div
      className="absolute bg-white shadow-lg rounded-xl p-3 w-40 z-[9999]"
      style={{
        left: clickPos.screenX,
        top: clickPos.screenY,
        transform: "translate(-50%, -100%)"
      }}
    >
      <p className="font-poppins text-sm text-gray-700 mb-2">Select Action</p>
      <button
        onClick={() => onSetDestination("from", [clickPos.lat, clickPos.lng])}
        className="w-full h-fit bg-gray-200 text-gray-700 p-2 text-sm rounded-lg hover:bg-gray-300 transition "
      >
        From Here
      </button>
      <button
        onClick={() => onSetDestination("to", [clickPos.lat, clickPos.lng])}
        className="w-full h-fit bg-gray-200 text-gray-700 p-2 text-sm rounded-lg hover:bg-gray-300 transition mt-2"
      >
        To Here
      </button>
    </div>
  );
};
