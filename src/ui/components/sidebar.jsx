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
  { to: "/action-history", icon: ClipboardList, label: "Action History" },
];

function SidebarNav({ onNavigate }) {
  return (
    <nav className="flex-1 py-4 sm:py-6 px-3 sm:px-4 overflow-y-auto">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          onClick={onNavigate}
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
  );
}

export default function Sidebar({ isMobileOpen = false, onCloseMobile = () => {} }) {
  return (
    <>
      <aside className="hidden lg:flex w-64 h-screen bg-primary-100 flex-col shadow-lg shrink-0 sticky top-0">
        <div className="py-6 px-5 border-b border-white/15 flex items-center gap-3">
          <img src={icaneLogo} alt="iCane logo" className="h-8 w-8 object-contain" />
          <span className="text-white font-bold text-lg tracking-wide font-gabriela">
            iCane Admin
          </span>
        </div>

        <SidebarNav />

        <div className="py-4 px-6 text-white/40 text-xs">v1.0.0</div>
      </aside>

      <div
        className={`lg:hidden fixed inset-0 z-50 transition ${isMobileOpen ? "pointer-events-auto" : "pointer-events-none"}`}
      >
        <div
          onClick={onCloseMobile}
          className={`absolute inset-0 bg-black/40 transition-opacity duration-200 ${isMobileOpen ? "opacity-100" : "opacity-0"}`}
        />

        <aside
          className={`absolute left-0 top-0 h-full w-[86vw] max-w-72 bg-primary-100 flex flex-col shadow-xl transform transition-transform duration-200 ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}`}
        >
          <div className="py-5 px-4 border-b border-white/15 flex items-center gap-3">
            <img src={icaneLogo} alt="iCane logo" className="h-8 w-8 object-contain" />
            <span className="text-white font-bold text-lg tracking-wide font-gabriela">
              iCane Admin
            </span>
          </div>

          <SidebarNav onNavigate={onCloseMobile} />

          <div className="py-4 px-6 text-white/40 text-xs">v1.0.0</div>
        </aside>
      </div>
    </>
  );
}