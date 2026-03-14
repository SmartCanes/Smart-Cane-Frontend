import { getMyProfile } from "@/api/backendService";
import { ToastProvider, useToast } from "@/context/ToastContext";
import { useRealtimeStore, useUserStore } from "@/stores/useStore";
import DashboardSide from "@/ui/components/DashboardSide";
import EmergencyOverlay from "@/ui/components/EmergencyOverlay";
import FallOverlay from "@/ui/components/FallOverlay";
import Header from "@/ui/components/Header";
import TourGuide from "@/ui/components/TourGuide";
import { createContext, useEffect, useRef, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";

const ScrollContext = createContext();

const DashboardLayoutContent = () => {
  const { setUser } = useUserStore();
  const { emergency, fall, connectWs, disconnectWs } = useRealtimeStore();
  const location = useLocation();
  const { showToast, clearToast } = useToast();
  const [showNav, setShowNav] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    connectWs();
    return () => {
      disconnectWs();
    };
  }, []);

  useEffect(() => {
    const hydrateUser = async () => {
      try {
        const res = await getMyProfile();
        if (res.success) {
          setUser(res.data);
        }
      } catch (err) {
        console.error("User hydration failed", err);
      }
    };

    hydrateUser();
  }, []);

  useEffect(() => {
    if (emergency) {
      showToast({
        message: "Emergency Alert! Please check the live location immediately.",
        type: "error",
        position: "bottom-right",
        duration: 500000
      });
      return;
    }

    if (fall) {
      showToast({
        message: "Fall detected! Please check the user's status immediately.",
        type: "warning",
        position: "bottom-right",
        duration: 10000
      });
      return;
    }

    clearToast();
  }, [emergency, fall, showToast, clearToast]);

  useEffect(() => {
    const showModal = location.state?.showModal;
    if (showModal && !emergency) {
      showToast({
        message: "You have successfully logged into your account.",
        type: "success",
        position: "top-right",
        duration: 3000
      });

      window.history.replaceState({}, document.title);
    }
  }, [location, emergency, showToast]);

  const handleScroll = (currentScrollY) => {
    if (window.innerWidth >= 768) {
      setShowNav(true);
      return;
    }

    if (currentScrollY < 0) return;

    if (currentScrollY > lastScrollY.current && currentScrollY > 50) {
      setShowNav(false);
    } else if (currentScrollY < lastScrollY.current) {
      setShowNav(true);
    }

    lastScrollY.current = currentScrollY;
  };

  const activeAlert = emergency ? "emergency" : fall ? "fall" : null;

  return (
    <ScrollContext.Provider value={{ handleScroll }}>
      <div className="min-h-screen flex flex-col overflow-y-hidden bg-primary-100">
        {activeAlert === "fall" && <FallOverlay fall={true} />}
        {activeAlert === "emergency" && <EmergencyOverlay emergency={true} />}
        <TourGuide />

        <div
          className={`transition-all duration-300 ease-in-out z-20 w-full md:mt-0 ${showNav ? "mt-0" : "-mt-[var(--header-height)]"}`}
        >
          <Header />
        </div>

        <div className="flex flex-1">
          <DashboardSide showNav={showNav} />
          <main className="flex-1 overflow-y-hidden">
            <Outlet />
          </main>
        </div>
      </div>
    </ScrollContext.Provider>
  );
};

const DashboardLayout = () => (
  <ToastProvider>
    <DashboardLayoutContent />
  </ToastProvider>
);

export default DashboardLayout;
