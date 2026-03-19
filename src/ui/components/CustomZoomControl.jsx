import { Icon } from "@iconify/react";
import { useEffect, useRef } from "react";
import L from "leaflet";

function CustomZoomControl({
  onFocusOnCane,
  onFocusOnUser,
  isFreeMode,
  setIsFreeMode,
  onZoomIn,
  onZoomOut,
  isUserFollowingCane,
  setIsUserFollowingCane,
  canFocusOnCane = true,
  canFocusOnUser = true
}) {
  const controlRef = useRef(null);

  useEffect(() => {
    if (controlRef.current) {
      L.DomEvent.disableClickPropagation(controlRef.current);
      L.DomEvent.disableScrollPropagation(controlRef.current);
    }
  }, []);

  return (
    <div
      ref={controlRef}
      data-tour="tour-map-controls"
      className="absolute bottom-5 right-5 z-[1000] flex flex-col space-y-2"
    >
      <button
        onClick={() => {
          if (!canFocusOnCane) return;
          setIsFreeMode((prev) => !prev);
          setIsUserFollowingCane(false);
        }}
        disabled={!canFocusOnCane}
        className={`
    w-10 h-10 rounded-full shadow-md flex items-center justify-center
    transition-all duration-200
    ${
      !canFocusOnCane
        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
        : isFreeMode
          ? "bg-white text-gray-700 hover:bg-gray-50"
          : "bg-blue-50 text-blue-600 hover:bg-blue-100"
    }
  `}
        title={
          !canFocusOnCane
            ? "Unavailable: cane location not detected"
            : isFreeMode
              ? "Free Mode (Click to lock to route)"
              : "Locked to route (Click for free mode)"
        }
      >
        <Icon
          icon={isFreeMode ? "mdi:lock-open-outline" : "mdi:lock-outline"}
          className={`w-5 h-5 transition-transform ${isFreeMode ? "" : "scale-110"}`}
        />
      </button>

      <button
        onClick={onFocusOnCane}
        disabled={!canFocusOnCane}
        className={`w-10 h-10 rounded-full shadow-md flex items-center justify-center transition-all ${
          !canFocusOnCane
            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : isUserFollowingCane
              ? "bg-blue-100 text-blue-600 border-2 border-blue-300"
              : "bg-white text-gray-700 hover:bg-gray-100 cursor-pointer"
        }`}
        title={
          canFocusOnCane
            ? isUserFollowingCane
              ? "Stop following VIP"
              : "Follow VIP"
            : "Unavailable: cane location not detected"
        }
      >
        <Icon
          icon={
            isUserFollowingCane
              ? "mdi:target"
              : "streamline-plump:user-pin-remix"
          }
          className="w-6 h-6"
        />
      </button>

      <button
        onClick={onFocusOnUser}
        className={`w-10 h-10 rounded-full shadow-md flex items-center justify-center transition-all ${
          canFocusOnUser
            ? "bg-white text-gray-700 hover:bg-gray-100 cursor-pointer"
            : "bg-amber-50 text-amber-600 hover:bg-amber-100 cursor-pointer"
        }`}
        title={
          canFocusOnUser
            ? "Center on my location"
            : "Location is off. Click to enable it"
        }
      >
        <Icon icon="mdi:crosshairs-gps" className="w-6 h-6" />
      </button>

      <button
        onClick={onZoomIn}
        className="w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center text-gray-700 hover:bg-gray-100 cursor-pointer"
        title="Zoom in"
      >
        <Icon icon="mdi:magnify-plus-outline" className="w-6 h-6" />
      </button>

      <button
        onClick={onZoomOut}
        className="w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center text-gray-700 hover:bg-gray-100 cursor-pointer"
        title="Zoom out"
      >
        <Icon icon="mdi:magnify-minus-outline" className="w-6 h-6" />
      </button>
    </div>
  );
}

export default CustomZoomControl;
