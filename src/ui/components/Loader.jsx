import "./Loader.css";

const Loader = ({ size = "medium", fullScreen = false, color = "#1C253C" }) => {
  const sizeClasses = {
    small: "w-8 h-8",
    medium: "w-12 h-12",
    large: "w-16 h-16"
  };

  const dotSizes = {
    small: "w-2 h-2",
    medium: "w-3 h-3",
    large: "w-4 h-4"
  };

  const LoaderContent = () => (
    <div className="flex items-center justify-center gap-2">
      <div
        className={`${dotSizes[size]} rounded-full animate-bounce-dot`}
        style={{ animationDelay: "0s", backgroundColor: color }}
      ></div>
      <div
        className={`${dotSizes[size]} rounded-full animate-bounce-dot`}
        style={{ animationDelay: "0.2s", backgroundColor: color }}
      ></div>
      <div
        className={`${dotSizes[size]} rounded-full animate-bounce-dot`}
        style={{ animationDelay: "0.4s", backgroundColor: color }}
      ></div>
      <div
        className={`${dotSizes[size]} rounded-full animate-bounce-dot`}
        style={{ animationDelay: "0.6s", backgroundColor: color }}
      ></div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
        <LoaderContent />
      </div>
    );
  }

  return <LoaderContent />;
};

export default Loader;
