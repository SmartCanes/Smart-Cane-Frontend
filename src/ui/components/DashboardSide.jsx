import { Icon } from "@iconify/react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import icaneLogo from "@/assets/images/smartcane-logo.png";
import findCaneIcon from "@/assets/images/findcane.png";
import { BlinkingIcon } from "@/wrapper/MotionWrapper";

const DashboardSide = ({ className = "" }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: "solar:widget-linear",
      path: "/dashboard"
    },
    {
      id: "activity-report",
      label: "Activity Report",
      icon: "oui:nav-reports",
      path: "/activity-report"
    },
    {
      id: "alerts",
      label: "Alerts",
      icon: "uiw:bell",
      path: "/alerts"
    },
    // {
    //   id: "find-my-cane",
    //   label: "Find My Cane",
    //   icon: "custom-image",
    //   customIcon: findCaneIcon,
    //   path: "/find-my-cane"
    // },
    {
      id: "guardian-access",
      label: "Guardian Access",
      icon: "solar:users-group-two-rounded-bold",
      path: "/guardian-access"
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
    },
    {
      id: "weather-board",
      label: "Weather Board",
      icon: "mdi:weather-partly-cloudy",
      path: "/weather-board"
    }
  ];

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <aside
      className={`w-60 h-screen bg-primary-100 flex flex-col ${className}`}
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
              <li key={item.id}>
                <button
                  onClick={() => handleNavigation(item.path)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-poppins text-base transition-all duration-200 ${
                    isActive
                      ? "bg-white/10 text-white font-medium"
                      : "text-white/80 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {item.customIcon ? (
                    <img
                      src={item.customIcon}
                      alt={item.label}
                      className="w-6 h-6 object-contain flex-shrink-0"
                    />
                  ) : (
                    <Icon icon={item.icon} className="text-2xl flex-shrink-0" />
                  )}
                  <span>{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};

export default DashboardSide;
