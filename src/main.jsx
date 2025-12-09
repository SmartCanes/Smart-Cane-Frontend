import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import "leaflet/dist/leaflet.css";

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
import GetStarted from "./pages/GetStarted.jsx";
import { GuardianProfile } from "./pages/GuardianProfile";
import HealthStatus from "./pages/Health-Status.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<GuestPage />} />
        <Route path="/get-started" element={<GetStarted />} />

        <Route element={<PublicLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Route>

        <Route element={<ProtectedLayout />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/activity-report" element={<ActivityReport />} />
            <Route path="/manage-profile" element={<ManageProfile />} />
            <Route path="/weather-board" element={<WeatherBoard />} />
            <Route path="/settings" element={<Setting />} />
            <Route path="/profile" element={<GuardianProfile />} />
            <Route path="/notes" element={<Notes />} />
            <Route path="/health" element={<HealthStatus />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
