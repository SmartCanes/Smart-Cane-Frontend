import { NavLink } from "react-router-dom";
import { 
  LayoutDashboard, 
  Cpu, 
  User, 
  Glasses, 
  UserCog, 
  AlertTriangle, 
  MessageSquare 
} from "lucide-react";
import icaneLogo from "../../assets/images/smartcane-logo.png";

const DeviceIcon = ({ className }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M9 3c0 0 3 2 3 9s-3 9-3 9" />
    <path d="M9 21 L20 21" />
    <path d="M9 3 Q7 3 7 5" />
  </svg>
);

const navItems = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/devices",   icon: DeviceIcon,             label: "Devices" },
  { to: "/guardians", icon: User,            label: "Guardians" },
  { to: "/vips",      icon: Glasses,         label: "VIPs" },
  { to: "/admins",    icon: UserCog,         label: "Admins" },
  { to: "/emergency-logs", icon: AlertTriangle, label: "Emergency Logs" },
  { to: "/guardian-concerns", icon: MessageSquare, label: "Guardian Concerns" },
];

export default function Sidebar() {
  return (
    <aside className="w-64 h-screen bg-primary-100 flex flex-col shadow-lg shrink-0 sticky top-0">
      {/* Logo */}
      <div className="py-6 px-5 border-b border-white/15 flex items-center gap-3">
        <img src={icaneLogo} alt="iCane logo" className="h-8 w-8 object-contain" />
        <span className="text-white font-bold text-lg tracking-wide font-gabriela">
          iCane Admin
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-4 overflow-y-auto">
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
            <item.icon className="w-5 h-5" />
            <span className="text-sm">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Version footer */}
      <div className="py-4 px-6 text-white/40 text-xs">v1.0.0</div>
    </aside>
  );
}