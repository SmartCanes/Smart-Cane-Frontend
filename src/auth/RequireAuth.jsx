import { Navigate, Outlet, useLocation } from "react-router-dom";

function hasToken() {
  const token = localStorage.getItem("access_token");
  return Boolean(token && token.trim());
}

export default function RequireAuth() {
  const location = useLocation();

  if (!hasToken()) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}

