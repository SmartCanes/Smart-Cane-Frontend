import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import "leaflet/dist/leaflet.css";

// Mga Pages at Components
import Welcome from "./pages/Welcome.jsx";
import GuestPage from "./pages/GuestPage.jsx";
import Login from "./auth/Login.jsx";
import Register from "./auth/Register.jsx";
import ForgotPassword from "./auth/FogotPassword.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import { ProtectedLayout, PublicLayout } from "./layout/LayoutRoute.jsx";

// 👇 1. IMPORT MO YUNG WEATHERBOARD (Siguraduhin tama ang path kung nasa ui/components)
import WeatherBoard from "./ui/components/WeatherBoard.jsx";
import ScannerCamera from "./auth/Scanner";
import GuardianAccess from "./ui/components/GuardianAccess.jsx";
import ManageProfile from "./ui/components/ManageProfile.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<GuestPage />} />
        <Route path="/welcome" element={<Welcome />} />

        <Route element={<PublicLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/scan" element={<ScannerCamera />} />
        </Route>

        <Route element={<ProtectedLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />

          {/* 👇 2. ADD MO ITONG ROUTE PARA SA WEATHER BOARD */}
          <Route path="/guardian-access" element={<GuardianAccess />} />
          <Route path="/manage-profile" element={<ManageProfile />} />
          <Route path="/weather-board" element={<WeatherBoard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
