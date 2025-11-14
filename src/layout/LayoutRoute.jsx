import { Outlet, Navigate } from "react-router-dom";
import { useUserStore } from "@/stores/useStore";

const ProtectedLayout = () => {
  const { isLoggedIn } = useUserStore();

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

const PublicLayout = () => {
  const { isLoggedIn } = useUserStore();

  // If already logged in, redirect to dashboard
  if (isLoggedIn) {
    return <Navigate to="/dashboard" replace />;
  }

  // Otherwise, render child routes
  return <Outlet />;
};

export { ProtectedLayout, PublicLayout };
