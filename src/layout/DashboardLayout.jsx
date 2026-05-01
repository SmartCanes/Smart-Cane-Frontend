import { getMyProfile } from "@/api/backendService";
import { ToastProvider, useToast } from "@/context/ToastContext";
import { useRealtimeStore, useUserStore } from "@/stores/useStore";
import DashboardSide from "@/ui/components/DashboardSide";
import EmergencyOverlay from "@/ui/components/EmergencyOverlay";
import FallOverlay from "@/ui/components/FallOverlay";
import Header from "@/ui/components/Header";
import ImportantNotificationsBridge from "@/ui/components/ImportantNotificationsBridge";
import PushNotificationsBridge from "@/ui/components/PushNotificationsBridge";
import ConcernComposer from "@/ui/components/ConcernComposer";
import TourGuide from "@/ui/components/TourGuide";
import { setCriticalAlertState } from "@/utils/NotificationManager";
import { createContext, useEffect, useRef, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";

const ScrollContext = createContext();

const DashboardLayoutContent = () => {
  const { setUser, user } = useUserStore();
  const { emergency, fall, connectWs, disconnectWs } = useRealtimeStore();
  const location = useLocation();
  const { showToast, clearToast } = useToast();
  const [showNav, setShowNav] = useState(true);
  const [needsAudioUnlock, setNeedsAudioUnlock] = useState(false);
  const lastScrollY = useRef(0);

  const prefillConcernName =
    [user?.first_name, user?.middle_name, user?.last_name]
      .filter(Boolean)
      .join(" ")
      .trim() ||
    user?.username ||
    "";

  useEffect(() => {
    connectWs();
    return () => {
      disconnectWs();
    };
  }, [connectWs, disconnectWs]);

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
  }, [setUser]);

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
    setCriticalAlertState({ emergency, fall }).catch(() => {
      // Audio autoplay policies can block playback until user interaction.
    });

    return () => {
      setCriticalAlertState({ emergency: false, fall: false }).catch(() => {
        // No-op cleanup when audio stop fails.
      });
    };
  }, [emergency, fall]);

  useEffect(() => {
    const handleBlockedAudioState = (event) => {
      const needsGesture = Boolean(event?.detail?.needsGesture);
      setNeedsAudioUnlock(needsGesture);
    };

    window.addEventListener(
      "critical-alert-audio-blocked",
      handleBlockedAudioState
    );

    return () => {
      window.removeEventListener(
        "critical-alert-audio-blocked",
        handleBlockedAudioState
      );
    };
  }, []);

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
        {needsAudioUnlock && (emergency || fall) ? (
          <div className="fixed top-3 left-1/2 -translate-x-1/2 z-[120] px-4 w-[min(92vw,560px)]">
            <div className="rounded-2xl border border-amber-300 bg-amber-50 text-amber-900 shadow-lg px-4 py-3 text-sm font-medium">
              Tap anywhere on the page to enable continuous emergency alarm
              sound.
            </div>
          </div>
        ) : null}
        {activeAlert === "fall" && <FallOverlay fall={true} />}
        {activeAlert === "emergency" && <EmergencyOverlay emergency={true} />}
        <TourGuide />
        <ImportantNotificationsBridge />
        <PushNotificationsBridge />

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

        <ConcernComposer
          mode="floating"
          sourceKey="guardian-dashboard"
          prefillName={prefillConcernName}
          prefillEmail={user?.email || ""}
          lockEmail={Boolean(user?.email)}
        />
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
