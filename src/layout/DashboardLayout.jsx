import { getMyProfile } from "@/api/backendService";
import { useRealtimeStore, useUserStore } from "@/stores/useStore";
import DashboardSide from "@/ui/components/DashboardSide";
import EmergencyOverlay from "@/ui/components/EmergencyOverlay";
import Header from "@/ui/components/Header";
import Toast from "@/ui/components/Toast";
import { createContext, useEffect, useRef, useState } from "react";
import { Outlet } from "react-router-dom";

const ScrollContext = createContext();

const DashboardLayout = () => {
  const { setUser } = useUserStore();
  const { emergency, connectWs, disconnectWs } = useRealtimeStore();
  const [toast, setToast] = useState({
    message: "",
    type: "",
    position: "",
    show: false,
    duration: 3000
  });
  const [showNav, setShowNav] = useState(true);
  const lastScrollY = useRef(0);

  // useEffect(() => {
  //   connectWs();
  //   return () => {
  //     disconnectWs();
  //   };
  // }, []);

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
      setToast({
        message: "Emergency Alert! Please check the live location immediately.",
        type: "error",
        position: "bottom-right",
        show: true,
        duration: 500000
      });
    } else {
      setToast((prev) => ({ ...prev, show: false }));
    }
  }, [emergency]);

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

  return (
    <ScrollContext.Provider value={{ handleScroll }}>
      <div className="min-h-screen flex flex-col overflow-y-hidden bg-primary-100">
        <EmergencyOverlay emergency={emergency} />
        {toast.show && (
          <Toast
            message={toast.message}
            type={toast.type}
            position={toast.position}
            duration={toast.duration}
          />
        )}

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

export default DashboardLayout;
