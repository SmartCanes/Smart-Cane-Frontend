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
import ActivityReport from "./ui/components/ActivityReport.jsx";
import Setting from "./ui/Setting";

//Weather Board Import
import WeatherBoard from "./ui/WeatherBoard.jsx";
import ScannerCamera from "./auth/Scanner";
import ManageProfile from "./ui/ManageProfile.jsx";

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
          <Route path="/activity-report" element={<ActivityReport />} />
          <Route path="/settings" element={<Setting />} />

          {/* Weather*/}
          <Route path="/manage-profile" element={<ManageProfile />} />
          <Route path="/weather-board" element={<WeatherBoard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
