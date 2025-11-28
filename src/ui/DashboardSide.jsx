import { useNavigate, useLocation, Link } from "react-router-dom";
import { memo, useCallback, useState } from "react";
import icaneLogo from "@/assets/images/smartcane-logo.png";
import { BlinkingIcon, HoverNavEffect } from "@/wrapper/MotionWrapper";
import { Icon } from "@iconify/react";
import { AnimatePresence, motion } from "framer-motion";

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

  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      labelMobile: "Dashboard",
      icon: "solar:widget-linear",
      path: "/dashboard"
    },
    {
      id: "activity-report",
      label: "Activity Reports",
      labelMobile: "Activity",
      icon: "oui:nav-reports",
      path: "/activity-report"
    },
    {
      id: "weather-board",
      label: "Weather Board",
      labelMobile: "Weather",
      icon: "solar:cloud-rain-outline",
      path: "/weather-board"
    },
    {
      id: "manage-profile",
      label: "Manage Profile",
      labelMobile: "Profile",
      icon: "iconamoon:profile",
      path: "/manage-profile"
    },
    {
      id: "settings",
      label: "Settings",
      labelMobile: "Settings",
      icon: "solar:settings-bold",
      path: "/settings"
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
      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="flex justify-around items-center h-[var(--mobile-nav-height)] px-2">
          {menuItems.map((item) => (
            <HoverNavEffect delay={0.1} key={item.id}>
              <button
                onClick={() => handleNavigation(item.path)}
                className={`flex flex-col items-center justify-center flex-1 py-2 ${
                  location.pathname === item.path
                    ? "text-card-100"
                    : "text-gray-500"
                }`}
              >
                <Icon icon={item.icon} className="text-2xl" />
                <span className="text-xs mt-1 font-poppins">
                  {item.labelMobile}
                </span>
              </button>
            </HoverNavEffect>
          ))}
        </div>
      </nav>

      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:flex w-60 min-h-[calc(100vh-var(--header-height))] bg-primary-100 flex-col ${className}`}
      >
        <nav className="flex-1 overflow-y-auto overflow-x-hidden">
          <ul className="">
            {menuItems.map((item) => (
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
