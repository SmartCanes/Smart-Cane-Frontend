import { Outlet, Navigate, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { verifyTokenApi } from "@/api/authService";

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

  return <Outlet />;
};

export { ProtectedLayout, PublicLayout };
