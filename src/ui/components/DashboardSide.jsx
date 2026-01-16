import { useNavigate, useLocation } from "react-router-dom";
import { memo, useCallback, useState } from "react";
import { HoverNavEffect } from "@/wrapper/MotionWrapper";
import { Icon } from "@iconify/react";
import { AnimatePresence, motion } from "framer-motion";

// Component for Desktop Menu Items (Walang ginalaw dito sa logic)
const MenuButton = memo(({ item, isActive, onNavigate }) => (
  <HoverNavEffect
    delay={0.1}
    direction="right"
    distance={20}
    damping={50}
    initial={false}
    className="w-full"
  >
    <AnimatePresence mode="wait">
      <motion.button
        key={item.id}
        onClick={() => onNavigate(item.path)}
        initial={{
          marginLeft: 0,
          backgroundColor: "rgba(255,255,255,0)",
          color: "#ffffffcc"
        }}
        animate={{
          marginLeft: isActive ? 16 : 0,
          backgroundColor: isActive ? "#ffffff" : "rgba(255,255,255,0)",
          color: isActive ? "#000000" : "#ffffffcc"
        }}
        exit={{
          marginLeft: 0,
          backgroundColor: "rgba(255,255,255,0)",
          color: "#ffffffcc"
        }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 30
        }}
        className="w-full h-18 rounded-l-full"
      >
        <div className="flex items-center gap-4 px-6 py-3">
          <Icon icon={item.icon} className="w-6 h-6 flex-shrink-0 text-base" />
          <span>{item.label}</span>
        </div>
      </motion.button>
    </AnimatePresence>
  </HoverNavEffect>
));

const DashboardSide = ({ className = "" }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // 1. DESKTOP MENU ITEMS
  // Ito ang ORIGINAL na listahan. Hindi natin ito ginalaw para hindi magbago ang Desktop View.
  const desktopMenuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: "solar:widget-linear",
      path: "/dashboard"
    },
    {
      id: "activity-report",
      label: "Activity Reports",
      icon: "oui:nav-reports",
      path: "/activity-report"
    },
    {
      id: "weather-board",
      label: "Weather Board",
      icon: "solar:cloud-rain-outline",
      path: "/weather-board"
    },
    {
      id: "devices",
      label: "Devices",
      icon: "mdi:devices",
      path: "/devices"
    },
    {
      id: "health",
      label: "Health",
      icon: "fa6-brands:unity",
      path: "/health"
    }
    // {
    //   id: "settings",
    //   label: "Settings",
    //   icon: "solar:settings-bold",
    //   path: "/settings"
    // }
  ];

  // 2. MOBILE MENU ITEMS (Based on Figma)
  const mobileMenuItems = [
    {
      id: "mobile-profile",
      label: "Profile",
      icon: "iconamoon:profile",
      path: "/manage-profile"
    },
    {
      id: "mobile-health",
      label: "Health",
      icon: "fa6-brands:unity",
      path: "/health"
    },
    {
      id: "mobile-home",
      label: "Home",
      icon: "material-symbols:home-rounded",
      path: "/dashboard"
    },
    {
      id: "mobile-weather",
      label: "Weather",
      icon: "material-symbols-light:weather-hail",
      path: "/weather-board"
    },
    {
      id: "mobile-devices",
      label: "Devices",
      icon: "mdi:devices",
      path: "/devices"
    }
  ];

  const handleNavigation = useCallback(
    (path) => {
      navigate(path);
      setIsMobileMenuOpen(false);
    },
    [navigate]
  );

  return (
    <>
      {/* --- MOBILE NAVIGATION (Visible only on Mobile) --- */}

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-primary-100 border-t border-white/10 z-50">
        <div className="flex justify-around items-center h-[var(--mobile-nav-height)] px-2">
          {/* mobileMenuItems array */}
          {mobileMenuItems.map((item) => (
            <HoverNavEffect delay={0.1} key={item.id}>
              <button
                onClick={() => handleNavigation(item.path)}
                className={`flex flex-col items-center justify-center w-16 py-3 transition-all duration-300 ${
                  location.pathname === item.path
                    ? "bg-white text-primary-100 font-bold shadow-md" // Active: White BG, Dark Text
                    : "text-gray-400 hover:text-white" // Inactive: Grayish
                }`}
              >
                <Icon icon={item.icon} className="text-2xl" />
                <span className="text-xs mt-1 font-poppins">{item.label}</span>
              </button>
            </HoverNavEffect>
          ))}
        </div>
      </nav>

      {/* --- DESKTOP SIDEBAR (Visible only on Desktop) --- */}
      <aside
        className={`hidden md:flex w-60 min-h-[calc(100vh-var(--header-height))] bg-primary-100 flex-col ${className}`}
      >
        <nav className="flex-1 overflow-y-auto overflow-x-hidden">
          <ul className="">
            {/*  desktopMenuItems array (ORIGINAL) */}
            {desktopMenuItems.map((item) => (
              <MenuButton
                key={item.id}
                item={item}
                isActive={location.pathname === item.path}
                onNavigate={handleNavigation}
              />
            ))}
          </ul>
        </nav>
      </aside>
    </>
  );
};

export default DashboardSide;
