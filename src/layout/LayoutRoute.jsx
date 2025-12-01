import { Outlet, Navigate, useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import SidebarContent from "@/ui/components/SidebarContent";
import { verifyAuthApi } from "@/api/authService";

const ProtectedLayout = () => {
  const navigate = useNavigate();
  const [isAuthChecked, setIsAuthChecked] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await verifyAuthApi();
        if (!response.data.token_valid) throw new Error("Invalid token");
        setIsAuthChecked(true);
      } catch (error) {
        console.log("Auth check failed:", error);
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
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await verifyAuthApi();

        if (!response.data.token_valid) throw new Error("Invalid token");
        setIsAuthenticated(true);
      } catch (error) {
        console.log("Auth check failed:", error);
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-20 bg-primary-100 rounded-b-[30%] h-[20vh] sm:hidden flex justify-center items-center">
        <Link to="/">
          <h1 className="font-gabriela text-7xl text-[#FDFCFA]">iCane</h1>
        </Link>
      </div>
      <main className="pt-[22vh] pb-8 sm:p-0 w-full flex flex-col sm:flex-row min-h-screen sm:min-h-0">
        <SidebarContent />
        <Outlet />
      </main>
    </>
  );
};

export { ProtectedLayout, PublicLayout };
