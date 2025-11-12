import { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  GeoJSON
} from "react-leaflet";
import { Icon } from "@iconify/react";
import L from "leaflet";
import CustomZoomControl from "./CustomZoomControl";
import novaliches from "@/data/novaliches";

// Keeps the view focused on both user and destination.
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
    const novalichesBounds = L.geoJSON(novaliches).getBounds();
    map.setMaxBounds(novalichesBounds);
    map.fitBounds(novalichesBounds);
    map.setMinZoom(15);
    map.setMaxZoom(20);
  }, [map]);

  return null;
};

function LiveMap({
  userPos,
  destPos,
  routePath,
  activeTab,
  searchQuery,
  onSearchChange
}) {
  if (!userPos) {
    return <div>Getting your location...</div>;
  }

  const shouldShowRoute = activeTab !== "history";

  return (
    <div className="relative w-full h-full">
      {/* Search bar overlay */}
      <div className="absolute top-4 left-4 z-[1000] pointer-events-none">
        <div className="relative pointer-events-auto">
          <input
            type="text"
            placeholder="Enter Location"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-[230px] h-[50px] pl-12 pr-4 rounded-full font-poppins text-sm text-gray-700 shadow-lg border-0 focus:outline-none focus:ring-2 focus:ring-blue-200"
            style={{ backgroundColor: "#C1D2FF" }}
          />
          <Icon
            icon="mdi:magnify"
            className="absolute left-4 top-1/2 -translate-y-1/2 text-xl text-gray-600"
          />
        </div>
      </div>

      {searchQuery && (
        <div className="absolute top-[64px] left-4 z-[1000] w-[230px] overflow-hidden rounded-xl bg-white shadow-xl pointer-events-auto">
          <div className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Icon icon="mdi:map-marker" className="text-blue-600 text-xl" />
              </div>
              <div>
                <p className="font-poppins font-semibold text-sm text-gray-800">
                  SM City Novaliches
                </p>
                <p className="font-poppins text-xs text-gray-500">
                  Recently viewed
                </p>
              </div>
            </div>
          </div>
          <div className="p-3 hover:bg-gray-50 cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                <Icon icon="mdi:store" className="text-gray-600 text-xl" />
              </div>
              <div>
                <p className="font-poppins font-medium text-sm text-gray-800">
                  ERODMA READY MIX CONCRETE CO
                </p>
                <p className="font-poppins text-xs text-gray-500">
                  Nearby location
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <MapContainer
        center={userPos}
        zoom={16}
        style={{ height: "100%", width: "100%" }}
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        <GeoJSON
          data={novaliches}
          style={{
            color: "#1E90FF",
            weight: 2,
            fillColor: "#1E90FF",
            fillOpacity: 0.15
          }}
        />

        <Marker position={userPos}>
          <Popup>Your current location.</Popup>
        </Marker>

        {/* <Marker position={destPos}>
          <Popup>Ito ang destination: SM Novaliches</Popup>
        </Marker> */}

        {/* {shouldShowRoute && routePath && (
          <Polyline positions={routePath} color="blue" weight={5} />
        )} */}

        <SetMapBounds />

        <FitBoundsToRoute userPos={userPos} destPos={destPos} />
        <CustomZoomControl userPos={userPos} />
      </MapContainer>
    </div>
  );
}

export default LiveMap;
