import { Outlet, Navigate } from "react-router-dom";
import { useUserStore } from "@/stores/useStore";

const ProtectedLayout = () => {
  const { isLoggedIn } = useUserStore();

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedLayout;
