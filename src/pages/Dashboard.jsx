import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import Header from "@/ui/components/Header";
import DashboardSide from "@/ui/components/DashboardSide";
import LiveMap from "@/ui/components/LiveMap";
import RecentAlerts from "@/ui/components/RecentAlert";
import QuickActions from "@/ui/components/QuickActions";
import DailyActivity from "@/ui/components/DailyActivity";
import GuardianNetwork from "@/ui/components/GuardianNetwork";
import WalkingDirections from "@/ui/components/WalkingDirections";
import { motion, useAnimation } from "framer-motion";
// import { fetchRoute } from "@/api/GraphHopperService";
import { useUserStore } from "@/stores/useStore";
import Toast from "@/ui/components/Toast";
import EmergencyOverlay from "@/ui/components/EmergencyOverlay";

const Dashboard = () => {
  const {
    showLoginModal,
    connectWs,
    emergency,
    connectionStatus,
    isMapLoading,
    caneLocation,
    guardianLocation,
    setShowLoginModal,
    setGuardianLocation,
    setIsMapLoading
  } = useUserStore();

  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState("track");
  const [startPoint, setStartPoint] = useState("");
  // const [route, setRoute] = useState(null);
  const [destinationPoint, setDestinationPoint] = useState("");
  const controls = useAnimation();

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

  const historyButtonStyle =
    activeTab === "history"
      ? {
          backgroundColor: "var(--color-primary-100)",
          color: "#FFFFFF",
          borderColor: "#E5E7EB",
          fill: "#F3F4F6"
        }
      : {};

  const handleSwapLocations = () => {
    setStartPoint(destinationPoint);
    setDestinationPoint(startPoint);
  };

  // const handleRequestDirections = () => {
  //   if (!startPoint || !destinationPoint) {
  //     alert("Please specify both starting point and destination.");
  //     return;
  //   }

  //   console.log("Requesting directions", { startPoint, destinationPoint });
  // };

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
    if (!showLoginModal) return;
    setShowModal(true);
    setShowLoginModal(false);
  }, [showLoginModal, setShowLoginModal]);

  return (
    <div className="flex h-screen">
      <EmergencyOverlay emergency={emergency} />
      {/* Sidebar */}
      <DashboardSide />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <Header
          userName="Zander"
          isOnline={connectionStatus}
          notificationCount={3}
          onNotificationClick={() => console.log("Notification clicked!")}
          onProfileClick={() => console.log("Profile clicked!")}
        />

        {/* Content */}
        <motion.main
          className="flex-1 overflow-y-auto p-8"
          initial={{ backgroundColor: "#f9fafb" }}
          animate={controls}
        >
          {/* Title Section */}
          <div className="mb-6">
            <h1 className="text-3xl font-semibold text-gray-900 font-poppins mb-2">
              Live Location Dashboard
            </h1>
            <p className="text-gray-600 font-poppins text-sm">
              Real-time monitoring and safety features for your iCane device
            </p>
          </div>

          <div className="grid lg:grid-cols-[minmax(0,1fr)_340px] gap-8 items-start">
            <div className="flex flex-col gap-8">
              {/* Map Container */}
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden w-full">
                {/* Map Header */}
                <div className="px-6 py-4 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold text-gray-800 font-poppins">
                      Live Location Tracking
                    </h3>

                    {/* Track Live / History Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => setActiveTab("track")}
                        className={`px-6 py-2.5 rounded-lg font-poppins font-medium text-sm flex items-center gap-2 transition-all ${
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
                        className={`px-6 py-2.5 rounded-lg font-poppins font-medium text-sm flex items-center gap-2 transition-all ${
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
                <div className="w-full h-[60vh]">
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
              <div className="grid gap-8 lg:grid-cols-2">
                <DailyActivity />
                <GuardianNetwork />
              </div>
            </div>

            <div className="flex flex-col gap-6 w-full lg:max-w-[340px]">
              <WalkingDirections
                startValue={startPoint}
                destinationValue={destinationPoint}
                onStartChange={setStartPoint}
                onDestinationChange={setDestinationPoint}
                onSwapLocations={handleSwapLocations}
                // onRequestDirections={handleRequestDirections}
                helperText="Preview walking routes customized for your cane"
              />
              <RecentAlerts />
              <QuickActions />
              {showModal && (
                <Toast
                  message="You have successfully logged into your account."
                  type="success"
                  position="top-right"
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
        </motion.main>
      </div>
    </div>
  );
};

export default Dashboard;
