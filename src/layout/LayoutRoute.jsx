import { Outlet, Navigate } from "react-router-dom";
import SidebarContent from "@/ui/components/SidebarContent";
import {
  useDevicesStore,
  useGuardiansStore,
  useUIStore,
  useUserStore
} from "@/stores/useStore";
import { useEffect } from "react";

const ProtectedLayout = () => {
  // const navigate = useNavigate();
  // const [isAuthChecked, setIsAuthChecked] = useState(false);
  const { user } = useUserStore();
  const { fetchDevices } = useDevicesStore();
  const { fetchGuardiansAndInvites } = useGuardiansStore();

  useEffect(() => {
    fetchDevices();
    fetchGuardiansAndInvites();

    const interval = setInterval(() => {
      fetchDevices();
      fetchGuardiansAndInvites();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const isMobileMenuOpen = useUIStore((s) => s.isMobileMenuOpen);

  useEffect(() => {
    const main = document.getElementById("app-main");

    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
      if (main) main.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      if (main) main.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
      if (main) main.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  // useEffect(() => {z
  //   const checkAuth = async () => {
  //     try {
  //       if (!isBackendEnabled) {
  //         setIsAuthChecked(true);
  //         return;
  //       }

  //       const response = await verifyAuthApi();
  //       if (!response.data.tokenValid) {
  //         clearUser();
  //         await logoutApi();
  //         throw new Error("Invalid token");
  //       }
  //       setIsAuthChecked(true);
  //     } catch (error) {
  //       console.log("Auth check failed:", error);
  //       clearUser();
  //       await logoutApi();
  //       navigate("/login", { replace: true });
  //     }
  //   };

  //   checkAuth();
  // }, [navigate]);

  // if (!isAuthChecked) {
  //   return (
  //     <div style={{ minHeight: "100vh", background: "transparent" }}></div>
  //   );
  // }

  if (!user) return <Navigate to="/login" replace />;

  return <Outlet />;
};

const PublicLayout = () => {
  // const [isAuthenticated, setIsAuthenticated] = useState(null);
  const { setIsAnimationDone } = useUIStore();
  const { user } = useUserStore();

  // useEffect(() => {
  //   const checkAuth = async () => {
  //     try {
  //       if (!isBackendEnabled) {
  //         setIsAuthenticated(false);
  //         return;
  //       }

  //       const response = await verifyAuthApi();
  //       if (response.data.tokenValid) {
  //         setIsAuthenticated(true);
  //       } else {
  //         clearUser();
  //         await logoutApi();
  //         setIsAuthenticated(false);
  //       }
  //     } catch (error) {
  //       clearUser();
  //       await logoutApi();
  //       setIsAuthenticated(false);
  //     }
  //   };

  //   checkAuth();
  // }, []);

  // if (isAuthenticated) {
  //   return <Navigate to="/dashboard" replace />;
  // }

  if (user) return <Navigate to="/dashboard" replace />;

  return (
    <div className="min-h-screen w-full flex flex-col sm:flex-row relative">
      <SidebarContent onAnimationComplete={() => setIsAnimationDone(true)} />
      <Outlet />
    </div>
  );
};

export { ProtectedLayout, PublicLayout };
