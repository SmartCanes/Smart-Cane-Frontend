import { useEffect, useRef, useState } from "react";
import { Icon } from "@iconify/react";
import destinationPin from "../../assets/images/destinationPin.svg";
import { getLocation } from "@/api/locationsApi";

const noop = () => {};

const headerIconBase =
  "w-11 h-11 rounded-2xl flex items-center justify-center ";

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
  // onResultClick = noop
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
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeField, setActiveField] = useState(null);
  const ignoreNextFetch = useRef(false);

  const onResultClick = (result) => {
    if (result) {
      if (activeField === "start") {
        onStartChange(result.properties.name);
      } else if (activeField === "destination") {
        onDestinationChange(result.properties.name);
      }
      ignoreNextFetch.current = true;
      setSearchResults([]);
    }
  };

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
      try {
        const data = await getLocation(searchQuery);
        setSearchResults(data.features || []);
      } catch (err) {
        console.error(err);
      }
    }, 300);

    return () => clearTimeout(delay);
  }, [searchQuery]);

  return (
    <section className="font-poppins bg-white rounded-3xl shadow-sm p-4 sm:p-5 w-full">
      <header className="flex items-center justify-between mb-4 sm:mb-5">
        {/* Left walking icon */}
        <div className="w-10 sm:w-12 flex items-center justify-start">
          <Icon
            icon="fa6-solid:person-walking"
            className="text-xl sm:text-2xl text-gray-800"
            aria-hidden
          />
        </div>

        {/* Centered title */}
        <div className="flex-1 text-center">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 font-poppins">
            {title}
          </h3>
        </div>

        {/* Right placeholder to balance layout */}
        <div className="w-10 sm:w-12" />
      </header>

      <div className="space-y-4">
        <div className="flex items-start gap-2 sm:gap-4">
          {/* Left vertical icons */}
          <div className="flex flex-col items-center gap-3 pt-2">
            {/* Start circle */}
            <div className="flex items-center justify-center w-6 h-6 rounded-full border-2 border-blue-400">
              <div className="w-2 h-2 rounded-full bg-blue-400" />
            </div>

            {/* Dotted line */}
            <div className="flex flex-col items-center gap-1 py-1">
              <span className="w-1 h-1 rounded-full bg-gray-300" />
              <span className="w-1 h-1 rounded-full bg-gray-300" />
              <span className="w-1 h-1 rounded-full bg-gray-300" />
            </div>

            {/* Destination pin */}
            <img src={destinationPin} alt="Destination" className="w-5 h-5" />
          </div>

          {/* Inputs column */}
          <div className="flex-1 flex flex-col gap-3">
            {fields.map((field) => (
              <label
                key={field.key}
                className={
                  inputWrapperBase +
                  " flex items-center justify-between rounded-2xl relative"
                }
              >
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-semibold">
                    {field.label}
                  </p>
                  <input
                    type="text"
                    value={field.value}
                    onChange={(event) => {
                      field.onChange(event.target.value);
                      setSearchQuery(event.target.value);
                      setActiveField(field.key);
                    }}
                    placeholder={field.placeholder}
                    className="w-full bg-transparent border-none outline-none text-sm font-medium text-gray-800 placeholder:text-gray-400 truncate"
                  />
                </div>
                <Icon
                  icon="mdi:magnify"
                  className="text-xl text-gray-400 ml-2 sm:ml-3 flex-shrink-0 pointer-events-none"
                />

                {activeField === field.key && searchResults.length > 0 && (
                  <div className="absolute top-full left-0 w-full mt-1 overflow-hidden rounded-b-2xl bg-white shadow-md pointer-events-auto z-20">
                    {searchResults.map((result, idx) => (
                      <div
                        key={idx}
                        onClick={() => onResultClick(result)}
                        className="cursor-pointer hover:bg-blue-50 transition border-b border-gray-100 p-3 flex items-center gap-3"
                      >
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <Icon
                            icon="mdi:map-marker"
                            className="text-blue-600 text-xl"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="font-poppins font-medium text-sm text-gray-800 truncate">
                            {result.properties.name}
                          </p>
                          <p className="font-poppins text-xs text-gray-500 truncate">
                            {result.properties.city ||
                              result.properties.state ||
                              "Philippines"}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </label>
            ))}
          </div>

          {/* Swap button on the right */}
          <div className="flex items-center pl-1 sm:pl-2 self-center">
            <button
              type="button"
              onClick={onSwapLocations}
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-2xl text-gray-500 flex items-center justify-center hover:bg-gray-200 transition-colors"
              aria-label="Swap locations"
            >
              <Icon
                icon="akar-icons:arrow-up-down"
                className="text-lg sm:text-2xl"
                style={{ color: "#000" }}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Recent Destination Section */}
      <div className="mt-6 pt-4 border-t border-gray-100">
        <h4 className="text-sm font-medium text-gray-600 mb-3 font-poppins">
          Recent Destination
        </h4>
        <div className="h-48 bg-gray-50 rounded-2xl w-full"></div>
      </div>
    </section>
  );
}

export default WalkingDirections;
