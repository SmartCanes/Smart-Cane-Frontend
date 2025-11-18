import { useNavigate, useLocation, Link } from "react-router-dom";
import { useState } from "react";
import icaneLogo from "@/assets/images/smartcane-logo.png";
import { BlinkingIcon, HoverNavEffect, SlideUp } from "@/wrapper/MotionWrapper";
import { Icon } from "@iconify/react";

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
      label: "Activity Report",
      labelMobile: "Activity",
      icon: "oui:nav-reports",
      path: "/activity-report"
    },
    {
      id: "weather-board",
      label: "Weather Board",
      labelMobile: "Weather",
      icon: "mdi:weather-partly-cloudy",
      path: "/weather-board"
    },
    {
      id: "alerts",
      label: "Alerts",
      labelMobile: "Alerts",
      icon: "uiw:bell",
      path: "/alerts"
    },
    {
      id: "guardian-access",
      label: "Guardian Profile",
      labelMobile: "Guardian",
      icon: "solar:users-group-two-rounded-bold",
      path: "/guardian-access"
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

  const handleNavigation = (path) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="flex justify-around items-center h-16 px-2">
          {menuItems.map((item) => (
            <HoverNavEffect delay={0.1}>
              <button
                key={item.id}
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
        className={`hidden md:flex w-60 h-screen bg-primary-100 flex-col ${className}`}
      >
        {/* Logo and Brand - Same height as header */}
        <div className="h-[80px] flex items-center justify-start px-6 border-b border-gray-700/30">
          <Link to="/dashboard">
            <div className="flex items-center gap-3">
              <BlinkingIcon
                src={icaneLogo}
                alt="iCane logo"
                className="h-12 w-[60px] object-contain"
              />
              <span className="text-white text-4xl font-gabriela tracking-wide">
                icane
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-4 py-6 overflow-y-auto">
          <ul className="space-y-10">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;

              return (
                <HoverNavEffect
                  delay={0.1}
                  direction="right"
                  key={item.id}
                  className={`w-full`}
                >
                  <button
                    onClick={() => handleNavigation(item.path)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-poppins text-base ${
                      isActive
                        ? "bg-white/10 text-white font-medium"
                        : "text-white/80 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <Icon icon={item.icon} className="w-6 h-6 flex-shrink-0" />
                    {/* Text */}
                    <span>{item.label}</span>
                  </button>
                </HoverNavEffect>
              );
            })}
          </ul>
        </nav>
      </aside>
    </>
  );
};

export default DashboardSide;
