import { Outlet, Navigate, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import SidebarContent from "@/ui/components/SidebarContent";
import { logoutApi, verifyAuthApi } from "@/api/authService";
import { useUIStore, useUserStore } from "@/stores/useStore";

const isBackendEnabled = import.meta.env.VITE_BACKEND_ENABLED === "true";

const ProtectedLayout = () => {
  const navigate = useNavigate();
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const { clearUser } = useUserStore();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (!isBackendEnabled) {
          setIsAuthChecked(true);
          return;
        }

        const response = await verifyAuthApi();
        if (!response.data.tokenValid) {
          clearUser();
          await logoutApi();
          throw new Error("Invalid token");
        }
        setIsAuthChecked(true);
      } catch (error) {
        console.log("Auth check failed:", error);
        clearUser();
        await logoutApi();
        navigate("/login", { replace: true });
      }
    };

    checkAuth();
  }, [navigate]);

  if (!isAuthChecked) {
    return (
      <div style={{ minHeight: "100vh", background: "transparent" }}></div>
    );
  }

  return <Outlet />;
};

const PublicLayout = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const { setIsAnimationDone } = useUIStore();
  const { clearUser } = useUserStore();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (!isBackendEnabled) {
          setIsAuthenticated(false);
          return;
        }

        const response = await verifyAuthApi();
        if (response.data.tokenValid) {
          setIsAuthenticated(true);
        } else {
          clearUser();
          await logoutApi();
          setIsAuthenticated(false);
        }
      } catch (error) {
        clearUser();
        await logoutApi();
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  if (isAuthenticated === null) {
    return <div style={{ minHeight: "100vh", background: "transparent" }} />;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen w-full flex flex-col sm:flex-row relative">
      <SidebarContent onAnimationComplete={() => setIsAnimationDone(true)} />
      <Outlet />
    </div>
  );
};

export { ProtectedLayout, PublicLayout };
