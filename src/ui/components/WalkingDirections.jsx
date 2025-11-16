import PropTypes from "prop-types";
import { useState } from "react";
import { Icon } from "@iconify/react";
import startingPointPin from "../../assets/images/startingPointPin.svg";
import destinationPin from "../../assets/images/destinationPin.svg";

const noop = () => {};

const headerIconBase =
  "w-11 h-11 rounded-2xl flex items-center justify-center "; // burger icon container

const inputWrapperBase =
  "flex items-center gap-3 rounded-2xl bg-[#F6F7FB] px-4 py-3 border border-transparent focus-within:border-blue-200";

function WalkingDirections({
  title = "Walking Directions",
  startPlaceholder = "Choose starting point",
  destinationPlaceholder = "Choose destination",
  startValue = "",
  destinationValue = "",
  onStartChange = noop,
  onDestinationChange = noop,
  onSwapLocations = noop,
  onRequestDirections = noop
}) {
  const fields = [
    {
      key: "start",
      icon: "solar:record-bold",
      accentColor: "#2563EB",
      placeholder: startPlaceholder,
      value: startValue,
      onChange: (value) => onStartChange(value)
    },
    {
      key: "destination",
      icon: "iconoir:map-pin",
      accentColor: "#FF3528",
      placeholder: destinationPlaceholder,
      value: destinationValue,
      onChange: (value) => onDestinationChange(value)
    }
  ];

  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <section className="font-poppins bg-white rounded-3xl shadow-sm p-5 w-full">
      <header className="flex items-center justify-between mb-5">
        {/* burger icon */}
        <div className="flex items-center gap-3 font-poppins">
          <button
            type="button"
            aria-label={menuOpen ? "Close" : "Open"}
            onClick={() => setMenuOpen((v) => !v)}
            className={
              headerIconBase +
              "  transition-colors hover:bg-gray-200 focus:outline-none"
            }
          >
            <Icon
              icon={
                menuOpen
                  ? "iconoir:xmark"
                  : "iconamoon:menu-burger-horizontal-duotone"
              }
              width="24"
              height="24"
              style={{ color: "#adadad", transition: "transform 0.3s ease" }}
              className={menuOpen ? "rotate-90 scale-90" : ""}
            />
          </button>
          <div className="font-poppins">
            <p className="text-[11px] uppercase tracking-[0.25em] text-gray-400 font-poppins">
              Route
            </p>
            <h3 className="text-xl font-semibold text-gray-900 font-poppins">
              {title}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onSwapLocations}
            className="w-10 h-10 rounded-2xl  text-gray-500 flex items-center justify-center hover:bg-gray-200 transition-colors"
            aria-label="Swap locations"
          >
            <Icon icon="ph:arrows-down-up-duotone" className="text-lg" />
          </button>
        </div>
      </header>

      <div className="space-y-4">
        {fields.map((field) => (
          <div key={field.key} className="flex items-center gap-3">
            {field.key === "start" ? (
              <img
                src={startingPointPin}
                alt="Start point"
                className="w-6 h-6 shrink-0"
              />
            ) : (
              <img
                src={destinationPin}
                alt="Destination point"
                className="w-6 h-6 shrink-0"
              />
            )}
            <label className={inputWrapperBase + " flex-1"}>
              <div className="flex-1">
                <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-semibold">
                  {field.label}
                </p>
                <input
                  type="text"
                  value={field.value}
                  onChange={(event) => field.onChange(event.target.value)}
                  placeholder={field.placeholder}
                  className="w-full bg-transparent border-none outline-none text-sm font-medium text-gray-800 placeholder:text-gray-400"
                />
              </div>
              <Icon icon="mdi:magnify" className="text-xl text-gray-400" />
            </label>
          </div>
        ))}
      </div>
    </section>
  );
}

WalkingDirections.propTypes = {
  title: PropTypes.string,
  startPlaceholder: PropTypes.string,
  destinationPlaceholder: PropTypes.string,
  startValue: PropTypes.string,
  destinationValue: PropTypes.string,
  onStartChange: PropTypes.func,
  onDestinationChange: PropTypes.func,
  onSwapLocations: PropTypes.func,
  onRequestDirections: PropTypes.func
};

export default WalkingDirections;
