import { getMyProfile } from "@/api/backendService";
import { ToastProvider, useToast } from "@/context/ToastContext";
import { useRealtimeStore, useUserStore } from "@/stores/useStore";
import DashboardSide from "@/ui/components/DashboardSide";
import EmergencyOverlay from "@/ui/components/EmergencyOverlay";
import FallOverlay from "@/ui/components/FallOverlay";
import Header from "@/ui/components/Header";
import ImportantNotificationsBridge from "@/ui/components/ImportantNotificationsBridge";
import PushNotificationsBridge from "@/ui/components/PushNotificationsBridge";
import TourGuide from "@/ui/components/TourGuide";
import { TOUR_STEPS } from "@/data/tourConfig";
import { useTourStore } from "@/stores/useTourStore";
import { createContext, useEffect, useRef, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

const ScrollContext = createContext();
const LOGIN_TOAST_DURATION_MS = 3000;
const TOUR_STABILIZE_MS = 450;

function normalizeTourFlag(value) {
  if (typeof value === "boolean") return value;
  if (value === 1 || value === "1") return true;
  if (value === 0 || value === "0") return false;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (normalized === "true") return true;
    if (normalized === "false") return false;
  }
  return null;
}

const DashboardLayoutContent = () => {
  const { t, i18n } = useTranslation("pages");
  const { user, setUser } = useUserStore();
  const { hasVisited } = useTourStore();
  const { emergency, fall, connectWs, disconnectWs } = useRealtimeStore();
  const location = useLocation();
  const { showToast, clearToast } = useToast();
  const [showNav, setShowNav] = useState(true);
  const [canAutoStartTour, setCanAutoStartTour] = useState(false);
  const lastScrollY = useRef(0);
  const tRef = useRef(t);
  const toastShownRef = useRef(false);
  const pendingLoginToastRef = useRef(false);
  const tourReadyTimerRef = useRef(null);

  const hasSeenTourBackend =
    normalizeTourFlag(user?.has_seen_tour) ??
    normalizeTourFlag(user?.hasSeenTour) ??
    null;

  const showLoginSuccessToast = () => {
    if (toastShownRef.current) return;

    toastShownRef.current = true;
    pendingLoginToastRef.current = false;

    showToast({
      message: tRef.current("dashboardLayout.toast.loginSuccess"),
      type: "success",
      position: "top-right",
      duration: LOGIN_TOAST_DURATION_MS
    });

    window.history.replaceState({}, document.title);
  };

  const scheduleTourAutostart = (delayMs) => {
    setCanAutoStartTour(false);
    if (tourReadyTimerRef.current) {
      clearTimeout(tourReadyTimerRef.current);
    }

    tourReadyTimerRef.current = setTimeout(() => {
      setCanAutoStartTour(true);
    }, delayMs);
  };

  useEffect(() => {
    tRef.current = t;
  }, [t]);

  useEffect(() => {
    scheduleTourAutostart(TOUR_STABILIZE_MS);
  }, [i18n.resolvedLanguage]);

  useEffect(() => {
    return () => {
      if (tourReadyTimerRef.current) {
        clearTimeout(tourReadyTimerRef.current);
      }
    };
  }, []);

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
        message: tRef.current("dashboardLayout.toast.emergency"),
        type: "error",
        position: "bottom-right",
        duration: 500000
      });
      return;
    }

    if (fall) {
      showToast({
        message: tRef.current("dashboardLayout.toast.fall"),
        type: "warning",
        position: "bottom-right",
        duration: 10000
      });
      return;
    }

    clearToast();
  }, [emergency, fall, showToast, clearToast]);

  useEffect(() => {
    const justLoggedIn = Boolean(location.state?.justLoggedIn);
    if (!justLoggedIn || toastShownRef.current || emergency) return;

    pendingLoginToastRef.current = true;

    if (hasSeenTourBackend === null) {
      return;
    }

    const isFirstTimeUser = hasSeenTourBackend === false;
    const hasTourSteps = (TOUR_STEPS[location.pathname] ?? []).length > 0;
    const isPageVisited = hasVisited(location.pathname);
    const shouldWaitForTour = isFirstTimeUser && hasTourSteps && !isPageVisited;

    if (shouldWaitForTour) {
      return;
    }

    showLoginSuccessToast();
  }, [
    emergency,
    location.pathname,
    location.state,
    hasSeenTourBackend,
    hasVisited,
    showToast
  ]);

  const handleTourComplete = () => {
    if (!pendingLoginToastRef.current || toastShownRef.current) return;
    showLoginSuccessToast();
  };

  const handleTourClose = () => {
    if (!pendingLoginToastRef.current || toastShownRef.current) return;
    showLoginSuccessToast();
  };

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
        <TourGuide
          canAutoStart={canAutoStartTour}
          onComplete={handleTourComplete}
          onClose={handleTourClose}
        />
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
