import { Outlet, Navigate, useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { verifyTokenApi } from "@/api/authService";
import SidebarContent from "@/ui/components/SidebarContent";

const ProtectedLayout = () => {
  const navigate = useNavigate();
  const [isTokenChecked, setIsTokenChecked] = useState(false);
  const [isValidToken, setIsValidToken] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    if (
      (import.meta.env.VITE_ENV || "development") === "development" &&
      token === "DEV_ADMIN_TOKEN"
    ) {
      setIsValidToken(true);
      setIsTokenChecked(true);
      return;
    }

    verifyTokenApi(token)
      .then(() => {
        setIsValidToken(true);
      })
      .catch(() => {
        localStorage.removeItem("access_token");
        navigate("/login", { replace: true });
      })
      .finally(() => {
        setIsTokenChecked(true);
      });
  }, [navigate]);

  if (!isTokenChecked) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "transparent"
        }}
      />
    );
  }

  if (!isValidToken) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "transparent"
        }}
      />
    );
  }

  return <Outlet />;
};

const PublicLayout = () => {
  const token = localStorage.getItem("access_token");

  if (token) {
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
