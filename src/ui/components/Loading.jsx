import "./Loader.css";

const Loader = () => {
  return (
    <div className="flex flex-col items-center justify-center">
      {/* Relative container para mapatong ang Pin sa loob ng Ring */}
      <div className="relative flex items-center justify-center">
        {/* Ang umiikot na Ring */}
        <div className="map-loader-ring"></div>
      </div>
    </div>
  );
};

export default Loader;
