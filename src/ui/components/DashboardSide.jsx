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
      id: "manage-profile",
      label: "Manage Profile",
      icon: "iconamoon:profile",
      path: "/manage-profile"
    },
    {
      id: "settings",
      label: "Settings",
      icon: "solar:settings-bold",
      path: "/settings"
    }
  ];

  // 2. MOBILE MENU ITEMS (Based on Figma)
  // Ito ay bago at visible lang sa mobile. Dito natin pinalitan ang labels at icons.
  const mobileMenuItems = [
    {
      id: "mobile-home",
      label: "Home",           // Figma Label
      icon: "solar:home-2-bold", // Figma Icon style
      path: "/dashboard"       // Same functionality
    },
    {
      id: "mobile-track",
      label: "Track",          // Figma Label
      icon: "solar:map-point-search-linear", // Figma Icon style
      path: "/activity-report"
    },
    {
      id: "mobile-notes",
      label: "Notes",          // Figma Label
      icon: "solar:document-add-linear", // Figma Icon style
      path: "/notes"   // Separate Notes page
    },
    {
      id: "mobile-guardian",
      label: "Guardian",       // Figma Label
      icon: "solar:shield-user-outline", // Figma Icon style
      path: "/manage-profile"
    }
    // Note: Tinanggal ko ang Settings dito kasi 4 items lang ang nasa Figma screenshot
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
      {/* Pinalitan ang bg-white ng bg-primary-100 para maging dark blue gaya sa Figma */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-primary-100 border-t border-white/10 z-50">
        <div className="flex justify-around items-center h-[var(--mobile-nav-height)] px-2">
          {/* Ginagamit natin dito ang mobileMenuItems array */}
          {mobileMenuItems.map((item) => (
            <HoverNavEffect delay={0.1} key={item.id}>
              <button
                onClick={() => handleNavigation(item.path)}
                className={`flex flex-col items-center justify-center flex-1 py-2 ${
                  location.pathname === item.path
                    ? "text-white font-bold" // Active: White & Bold
                    : "text-gray-400"        // Inactive: Grayish
                }`}
              >
                <Icon icon={item.icon} className="text-2xl" />
                <span className="text-xs mt-1 font-poppins">
                  {item.label}
                </span>
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
            {/* Ginagamit natin dito ang desktopMenuItems array (ORIGINAL) */}
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