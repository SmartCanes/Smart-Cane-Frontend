import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import ValidationModal from "@/ui/components/ValidationModal";
import Header from "@/ui/components/Header";
import DashboardSide from "@/ui/components/DashboardSide";
import LiveMap from "@/ui/components/LiveMap";
import RecentAlerts from "@/ui/components/RecentAlert";
import QuickActions from "@/ui/components/QuickActions";
import DailyActivity from "@/ui/components/DailyActivity";
import GuardianNetwork from "@/ui/components/GuardianNetwork";
import { fetchRoute } from "@/api/GraphHopperService";

const Dashboard = () => {
  const [showModal, setShowModal] = useState(true);
  const [activeTab, setActiveTab] = useState("track"); // 'track' or 'history'
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const [userPosition, setUserPosition] = useState(null);
  const [route, setRoute] = useState(null);
  const [isLoadingMap, setIsLoadingMap] = useState(true);

  // Style for history button when active: use CSS variable from index.css
  const historyButtonStyle =
    activeTab === "history"
      ? {
          backgroundColor: "var(--color-primary-100)",
          color: "#FFFFFF",
          borderColor: "#E5E7EB",
          fill: "#F3F4F6",
        }
      : {};

  // Ito ang fixed destination (SM Novaliches)
  const destinationPosition = [14.7295, 121.0504];

  useEffect(() => {
    let watchId; // Para ma-stop later kung kailangan

    // Function para kunin ang ruta
    const getRoute = async (currentPosition) => {
      try {
        console.log("Current Position:", currentPosition);

        console.log("Kinukuha ang ruta papuntang SM Novaliches...");
        const calculatedRoute = await fetchRoute(
          currentPosition,
          destinationPosition
        );

        if (calculatedRoute) {
          console.log("Nakuha ang Ruta:", calculatedRoute);
          setRoute(calculatedRoute); // I-save ang ruta
        } else {
          console.error("Hindi nakuha ang ruta.");
        }
      } catch (error) {
        console.error("Nagka-error sa pagkuha ng ruta:", error);
      }
    };

    // ✅ REAL-TIME TRACKING: Patuloy na nag-uupdate ng location
    watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const currentCoords = [latitude, longitude];

        console.log("📍 Location Updated:", currentCoords);
        setUserPosition(currentCoords); // I-update ang position sa map

        // Kung first time pa lang, kumuha ng ruta
        if (isLoadingMap) {
          getRoute(currentCoords);
          setIsLoadingMap(false);
        }
      },
      (error) => {
        console.error("Error sa pagkuha ng lokasyon:", error.message);
        alert(
          "Paki-allow po ang location access para gumana ang real-time tracking."
        );

        // Fallback: Batasan Hills kung hindi allowed ang location
        const fallbackCoords = [14.7061, 121.09];
        setUserPosition(fallbackCoords);
        getRoute(fallbackCoords);
        setIsLoadingMap(false);
      },
      {
        enableHighAccuracy: true, // Para mas accurate ang GPS
        maximumAge: 0, // Huwag gumamit ng cached location
        timeout: 5000, // 5 seconds timeout
      }
    );

    // Auto-hide modal after 3 seconds
    const timer = setTimeout(() => {
      setShowModal(false);
    }, 3000);

    // Cleanup: I-stop ang location tracking pag nag-unmount ang component
    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
      clearTimeout(timer);
    };
  }, []); // Ang empty array [] ay nagsasabing "gawin ito isang beses lang pagka-load"

  const handleLogout = () => {
    // Navigate to guest page
    navigate("/");
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <DashboardSide />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <Header
          userName="Zander"
          isOnline={true}
          notificationCount={3}
          onNotificationClick={() => console.log("Notification clicked!")}
          onProfileClick={() => console.log("Profile clicked!")}
          onLogoutClick={handleLogout}
        />

        {/* Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-8">
          {showModal && (
            <ValidationModal type="login-success" position="top-right" />
          )}

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
                <div className="w-full h-[320px]">
                  {isLoadingMap ? (
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
                      userPos={userPosition}
                      destPos={destinationPosition}
                      routePath={route}
                      activeTab={activeTab}
                      searchQuery={searchQuery}
                      onSearchChange={setSearchQuery}
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
              <RecentAlerts />
              <QuickActions />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
