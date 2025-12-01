import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import LiveMap from "@/ui/components/LiveMap";
import RecentAlerts from "@/ui/components/RecentAlert";
import GuardianNetwork from "@/ui/components/GuardianNetwork";
import WalkingDirections from "@/ui/components/WalkingDirections";
import SendNote from "@/ui/components/SendNote";
import { motion, useAnimation } from "framer-motion";
import Toast from "@/ui/components/Toast";
import EmergencyOverlay from "@/ui/components/EmergencyOverlay";
import { useRealtimeStore } from "@/stores/useStore";
import { useLocation } from "react-router-dom";

import QuickActions from "@/ui/components/QuickActions";

const Dashboard = () => {
  const {
    connectWs,
    emergency,
    caneLocation,
    guardianLocation,
    setGuardianLocation
  } = useRealtimeStore();
  const location = useLocation();
  const [toast, setToast] = useState({
    message: "",
    type: "",
    position: "",
    show: false
  });
  const [activeTab, setActiveTab] = useState("track");
  const [startPoint, setStartPoint] = useState("");
  // const [route, setRoute] = useState(null);
  const [destinationPoint, setDestinationPoint] = useState("");
  const [isMapLoading, setIsMapLoading] = useState(true);
  const controls = useAnimation();

  const handleSwapLocations = () => {
    setStartPoint(destinationPoint);
    setDestinationPoint(startPoint);
  };

  const historyButtonStyle =
    activeTab === "history"
      ? {
          backgroundColor: "var(--color-primary-100)",
          color: "#FFFFFF",
          borderColor: "#E5E7EB",
          fill: "#F3F4F6"
        }
      : {};

  // const handleRequestDirections = () => {
  //   if (!startPoint || !destinationPoint) {
  //     alert("Please specify both starting point and destination.");
  //     return;
  //   }

  //   console.log("Requesting directions", { startPoint, destinationPoint });
  // };

  useEffect(() => {
    if (emergency) {
      controls.start({
        backgroundColor: ["#ffffff", "#ff3232", "#ffffff"],
        transition: {
          repeat: Infinity,
          repeatType: "loop",
          duration: 0.8,
          ease: "easeInOut"
        }
      });
    } else {
      controls.start({
        backgroundColor: "#ffffff",
        transition: { duration: 0.3 }
      });
    }
  }, [emergency, controls]);

  useEffect(() => {
    connectWs();
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setGuardianLocation([latitude, longitude]);

        if (isMapLoading) {
          setIsMapLoading(false);
        }
      },
      (error) => {
        console.error("Failed to get location:", error.message);
        setIsMapLoading(false);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 5000
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const showModal = location.state?.showModal;
    if (showModal) {
      setToast({
        show: true,
        message: "You have successfully logged into your account.",
        type: "success",
        position: "top-right"
      });

      window.history.replaceState({}, document.title);

      const timer = setTimeout(() => {
        setToast((prev) => ({ ...prev, show: false }));
      }, 3000);

      return () => {
        clearTimeout(timer);
        setToast((prev) => ({ ...prev, show: false }));
      };
    }
  }, [location]);

  return (
    <>
      <EmergencyOverlay emergency={emergency} />
      <motion.main
        className="bg-white md:bg-[#f9fafb] rounded-t-[32px] md:rounded-none min-h-[calc(100vh-var(--header-height)-var(--mobile-nav-height))] md:min-h-[calc(100vh-var(--header-height))] md:max-h-[calc(100vh-var(--header-height))] overflow-y-visible md:overflow-y-auto p-4 sm:p-5 pb-[calc(var(--mobile-nav-height)+1.5rem)] md:pb-6"
        initial={{ backgroundColor: "#ffffff" }}
        animate={controls}
      >
        <div className="w-full space-y-6 sm:space-y-8 max-w-5xl mx-auto md:max-w-none md:mx-0 md:pr-6">
          {/* Title Section */}
          <div className="mb-4 sm:mb-6">
            <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 font-poppins mb-2">
              Live Location
            </h1>
            <p className="text-gray-600 font-poppins text-xs sm:text-sm hidden sm:block">
              Real-time monitoring and safety features for your iCane device
            </p>
          </div>

          <div className="grid lg:grid-cols-[minmax(0,1fr)_340px] gap-4 sm:gap-8 items-start">
            <div className="flex flex-col gap-4 sm:gap-8">
              {/* Mobile Only: Walking Directions */}
              <div className="lg:hidden">
                <WalkingDirections
                  startValue={startPoint}
                  destinationValue={destinationPoint}
                  onStartChange={setStartPoint}
                  onDestinationChange={setDestinationPoint}
                  onSwapLocations={handleSwapLocations}
                  helperText="Preview walking routes customized for your cane"
                />
              </div>

              {/* Map Container */}
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden w-full border border-[#F3F4F6]">
                {/* Map Header */}
                <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100 hidden sm:block">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-800 font-poppins">
                      Live Location Tracking
                    </h3>

                    {/* Track Live / History Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => setActiveTab("track")}
                        className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg font-poppins font-medium text-xs sm:text-sm flex items-center gap-2 transition-all ${
                          activeTab === "track"
                            ? "bg-primary-100 text-white shadow-md"
                            : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <Icon icon="ph:map-pin-fill" className="text-lg" />
                        Track Live
                      </button>

                      <button
                        onClick={() => setActiveTab("history")}
                        className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg font-poppins font-medium text-xs sm:text-sm flex items-center gap-2 transition-all ${
                          activeTab === "history"
                            ? "shadow-md"
                            : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300"
                        }`}
                        style={historyButtonStyle}
                      >
                        History
                      </button>
                    </div>
                  </div>
                </div>

                {/* Map Area */}
                <div className="w-full h-[350px] sm:h-[60vh]">
                  {isMapLoading ? (
                    <div className="flex items-center justify-center h-full bg-gray-100">
                      <div className="text-center">
                        <Icon
                          icon="mdi:loading"
                          className="text-4xl text-blue-600 animate-spin mb-2"
                        />
                        <p className="font-poppins text-gray-600">
                          Loading map...
                        </p>
                      </div>
                    </div>
                  ) : (
                    <LiveMap
                      guardianPosition={guardianLocation}
                      canePosition={caneLocation}
                      onSetDestination={setDestinationPoint}
                      // destPos={destinationPoint}
                      // routePath={route}
                      activeTab={activeTab}
                    />
                  )}
                </div>

                {/* Map footer info */}
                <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-gray-600 font-poppins text-xs">
                    <Icon icon="tabler:clock-filled" />
                    <span>Last updated: 2 minutes ago</span>
                  </div>

                  <div className="flex items-center gap-2 text-gray-800 font-poppins text-xs font-medium">
                    <Icon icon="flowbite:map-pin-solid" />
                    <span>SM City Novaliches</span>
                  </div>
                </div>
              </div>

              {/* Mobile Only: Quick Actions */}
              <div className="lg:hidden">
                <QuickActions />
              </div>

              <div className="grid gap-8 lg:grid-cols-2">
                <GuardianNetwork />
                <RecentAlerts />
              </div>
            </div>

            <div className="flex flex-col gap-8 w-full lg:max-w-[340px]">
              <div className="hidden lg:block">
                <WalkingDirections
                  startValue={startPoint}
                  destinationValue={destinationPoint}
                  onStartChange={setStartPoint}
                  onDestinationChange={setDestinationPoint}
                  onSwapLocations={handleSwapLocations}
                  // onRequestDirections={handleRequestDirections}
                  helperText="Preview walking routes customized for your cane"
                />
              </div>
              <SendNote />
              {toast.show && (
                <Toast
                  message={toast.message}
                  type={toast.type}
                  position={toast.position}
                  onClose={() => setToast((prev) => ({ ...prev, show: false }))}
                />
              )}
              {emergency && (
                <Toast
                  message="Emergency Alert! Please check the live location immediately."
                  type="error"
                  position="bottom-right"
                />
              )}
            </div>
          </div>
        </div>
      </motion.main>
    </>
  );
};

export default Dashboard;
