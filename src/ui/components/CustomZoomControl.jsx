import { useMap } from "react-leaflet";
import { Icon } from "@iconify/react";

function CustomZoomControl({ guardianPosition }) {
  const map = useMap();

  const focusOnUser = () => {
    if (!guardianPosition) return;
    map.flyTo(guardianPosition, map.getZoom(), { duration: 0.5 });
  };

  const zoomIn = () => {
    map.zoomIn();
  };

  const zoomOut = () => {
    map.zoomOut();
  };

  return (
    <div className="absolute bottom-5 right-5 z-[1000] flex flex-col space-y-2">
      <button
        onClick={focusOnUser}
        className="w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center text-gray-700 hover:bg-gray-100"
        title="Center on current location"
      >
        <Icon icon="mdi:crosshairs-gps" className="w-6 h-6" />
      </button>

      <button
        onClick={zoomIn}
        className="w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center text-gray-700 hover:bg-gray-100"
        title="Zoom in"
      >
        <Icon icon="mdi:magnify-plus-outline" className="w-6 h-6" />
      </button>

      <button
        onClick={zoomOut}
        className="w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center text-gray-700 hover:bg-gray-100"
        title="Zoom out"
      >
        <Icon icon="mdi:magnify-minus-outline" className="w-6 h-6" />
      </button>
    </div>
  );
}

export default CustomZoomControl;
