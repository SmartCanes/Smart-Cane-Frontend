import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  User,
  Glasses,
  UserCog,
  AlertTriangle,
  MessageSquare,
  ClipboardList,
} from "lucide-react";
import icaneLogo from "../../assets/images/smartcane-logo.png";


const DeviceIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M9 3c0 0 3 2 3 9s-3 9-3 9" />
    <path d="M9 21 L20 21" />
    <path d="M9 3 Q7 3 7 5" />
  </svg>
);

const navItems = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/devices", icon: DeviceIcon, label: "Devices" },
  { to: "/guardians", icon: User, label: "Guardians" },
  { to: "/vips", icon: Glasses, label: "VIPs" },
  { to: "/admins", icon: UserCog, label: "Admins" },
  { to: "/emergency-logs", icon: AlertTriangle, label: "Emergency Logs" },
  { to: "/guardian-concerns", icon: MessageSquare, label: "Concerns" },
  { to: "/action-history", icon: ClipboardList, label: "Archives" },
];

function DesktopSidebar() {
  return (
    <aside className="hidden lg:flex w-64 h-screen flex-col bg-primary-100 shrink-0 sticky top-0 z-50">
      <div className="py-6 px-6 flex items-center gap-3 shrink-0">
        <img src={icaneLogo} alt="iCane logo" className="h-9 w-9 object-contain drop-shadow-sm" />
        <span className="text-white font-bold text-xl tracking-wide font-gabriela">
          iCane
        </span>
      </div>

      <nav className="flex-1 py-6 px-4 overflow-y-auto scrollbar-hide space-y-1.5 min-h-0">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium ${isActive
                ? "bg-white text-primary-100 shadow-sm"
                : "text-white/70 hover:bg-white/10 hover:text-white"
              }`
            }
          >
            <item.icon className="w-5 h-5 shrink-0" />
            <span className="text-sm tracking-wide">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="py-4 px-6 text-center text-white/40 text-[11px] font-medium border-t border-white/5 shrink-0">v1.0.0</div>
    </aside>
  );
}

function MobileBottomNav() {
  return (
    <div className="lg:hidden fixed bottom-4 left-3 right-3 z-50">
      <div className="bg-white rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.12)] p-1.5">
        <div className="flex items-center justify-between w-full">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center justify-center shrink-0 transition-all duration-200 rounded-full ${
                  isActive
                    ? "bg-primary-100 text-white w-10 h-10 sm:w-11 sm:h-11 shadow-md"
                    : "text-gray-400 hover:text-gray-800 hover:bg-gray-50 w-8 h-8 sm:w-10 sm:h-10"
                }`
              }
            >
              <item.icon className="w-[1.15rem] h-[1.15rem]" />
            </NavLink>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Sidebar() {
  return (
    <>
      <DesktopSidebar />
      <MobileBottomNav />
    </>
  );
}