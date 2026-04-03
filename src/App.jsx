import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./auth/login";
import RequireAuth from "./auth/RequireAuth";
import MainLayout from "./layout/MainLayout";
import Dashboard from "./pages/Dashboard";
import ManageDevice from "./pages/ManageDevice";
import ManageGuardian from "./pages/ManageGuardian";
import ManageVip from "./pages/ManageVip";
import ManageAdmin from "./pages/ManageAdmin";
import ManageEmergencyLogs from "./pages/ManageEmergencyLogs"; 
import GuardianConcerns from "./pages/GuardianConcerns"; 
import ManageActionHistory from "./pages/ManageActionHistory";
import Profile from "./pages/Profile";
import './index.css'


export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<RequireAuth />}>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="devices" element={<ManageDevice />} />
            <Route path="guardians" element={<ManageGuardian />} />
            <Route path="vips" element={<ManageVip />} />
            <Route path="admins" element={<ManageAdmin />} />
            <Route path="emergency-logs" element={<ManageEmergencyLogs />} />
            <Route path="guardian-concerns" element={<GuardianConcerns />} />
            <Route path="action-history" element={<ManageActionHistory />} />
            <Route path="profile" element={<Profile />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}