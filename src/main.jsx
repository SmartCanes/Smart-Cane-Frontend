import { StrictMode } from "react";
import { createRoot } from "react-dom/client"; // Ito lang ang kailangan
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";

// Import ng CSS para sa Leaflet (TAMA ITO)
import "leaflet/dist/leaflet.css";

// Mga Pages at Components
import Welcome from "./pages/Welcome.jsx";
import GuestPage from "./pages/GuestPage.jsx";
import Login from "./auth/Login.jsx";
import Register from "./auth/Register.jsx";
import ForgotPassword from "./auth/FogotPassword.jsx";
import Dashboard from "./pages/Dashboard.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<GuestPage />} />
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
