import { useMap } from "react-leaflet";
import { Icon } from "@iconify/react";
import { useEffect, useRef } from "react";
import L from "leaflet";

function CustomZoomControl({ guardianPosition, canePosition }) {
  const map = useMap();

  const controlRef = useRef(null);

  useEffect(() => {
    if (controlRef.current) {
      L.DomEvent.disableClickPropagation(controlRef.current);
      L.DomEvent.disableScrollPropagation(controlRef.current);
    }
  }, []);

  const focusOnUser = () => {
    if (!guardianPosition) return;
    map.flyTo(guardianPosition, map.getZoom(), { duration: 0.5 });
  };

  const focusOnCane = () => {
    if (!canePosition) return;
    map.flyTo(canePosition, map.getZoom(), { duration: 0.5 });
  };

  const zoomIn = () => {
    map.zoomIn();
  };

  const zoomOut = () => {
    map.zoomOut();
  };

  return (
    <div
      ref={controlRef}
      className="absolute bottom-5 right-5 z-[1000] flex flex-col space-y-2"
    >
      <button
        onClick={focusOnCane}
        className="w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center text-gray-700 hover:bg-gray-100 cursor-pointer"
        title="Center on current location"
      >
        <Icon icon="streamline-plump:user-pin-remix" className="w-6 h-6" />
      </button>

      <button
        onClick={focusOnUser}
        className="w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center text-gray-700 hover:bg-gray-100 cursor-pointer"
        title="Center on current location"
      >
        <Icon icon="mdi:crosshairs-gps" className="w-6 h-6" />
      </button>

      <button
        onClick={zoomIn}
        className="w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center text-gray-700 hover:bg-gray-100 cursor-pointer"
        title="Zoom in"
      >
        <Icon icon="mdi:magnify-plus-outline" className="w-6 h-6" />
      </button>

      <button
        onClick={zoomOut}
        className="w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center text-gray-700 hover:bg-gray-100 cursor-pointer"
        title="Zoom out"
      >
        <Icon icon="mdi:magnify-minus-outline" className="w-6 h-6" />
      </button>
    </div>
  );
}

export default CustomZoomControl;
