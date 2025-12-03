import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import "leaflet/dist/leaflet.css";

import Welcome from "./pages/Welcome.jsx";
import GuestPage from "./pages/GuestPage.jsx";
import Login from "./auth/Login.jsx";
import Register from "./auth/Register.jsx";
import ForgotPassword from "./auth/FogotPassword.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import { ProtectedLayout, PublicLayout } from "./layout/LayoutRoute.jsx";
import Setting from "./pages/Setting";
import ManageProfile from "./pages/ManageProfile.jsx";
import DashboardLayout from "./layout/DashboardLayout";
import WeatherBoard from "./pages/WeatherBoard";
import ActivityReport from "./pages/ActivityReport";
import Notes from "./pages/Notes.jsx";
import ScannerCamera from "./ui/components/Scanner";

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
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/activity-report" element={<ActivityReport />} />
            <Route path="/manage-profile" element={<ManageProfile />} />
            <Route path="/weather-board" element={<WeatherBoard />} />
            <Route path="/settings" element={<Setting />} />
            <Route path="/notes" element={<Notes />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
