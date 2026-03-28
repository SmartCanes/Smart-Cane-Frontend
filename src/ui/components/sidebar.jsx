import { NavLink } from "react-router-dom";
import { Icon } from "@iconify/react";
import icaneLogo from "../../assets/images/smartcane-logo.png";

const navItems = [
  { to: "/dashboard", icon: "ph:layout-duotone", label: "Dashboard" },
  { to: "/devices", icon: "ph:cpu-duotone", label: "Devices" },
  { to: "/guardians", icon: "ph:shield-check-duotone", label: "Guardians" },
  { to: "/vips", icon: "ph:users-duotone", label: "VIPs" },
  { to: "/admins", icon: "UserCog", label: "Admins" },
  { to: "/emergency-logs", icon: "ph:warning-duotone", label: "Emergency Logs" }, // new item
];

export default function Sidebar() {
  return (
    <aside className="w-64 min-h-screen bg-primary-100 flex flex-col shadow-lg shrink-0">
      {/* Logo */}
      <div className="py-6 px-5 border-b border-white/15 flex items-center gap-3">
        <img src={icaneLogo} alt="iCane logo" className="h-8 w-8 object-contain" />
        <span className="text-white font-bold text-lg tracking-wide font-gabriela">
          iCane Admin
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-4">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl mb-1.5 transition-all duration-200 ${
                isActive
                  ? "bg-white text-primary-100 font-medium shadow-sm"
                  : "text-white/80 hover:bg-white/10 hover:text-white"
              }`
            }
          >
            <Icon icon={item.icon} className="w-5 h-5" />
            <span className="text-sm">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Version footer */}
      <div className="py-4 px-6 text-white/40 text-xs">v1.0.0</div>
    </aside>
  );
}