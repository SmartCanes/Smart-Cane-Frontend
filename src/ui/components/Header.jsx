import { useState, useRef, useEffect } from "react";
import { Icon } from "@iconify/react";
import notifBell from "@/assets/images/notifbell.png";
import { useNavigate } from "react-router-dom";
import { useUserStore } from "@/stores/useStore";
import icaneLogo from "@/assets/images/smartcane-logo.png";
import { BlinkingIcon } from "@/wrapper/MotionWrapper";
import { Link } from "react-router-dom";

const Header = () => {
  const { connectionStatus, user, logout } = useUserStore();
  const { notificationCount, setNotificationCount } = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleProfileClick = () => {
    setIsDropdownOpen(false);
  };

  const handleNotificationClick = () => {};

  const handleLogoutClick = () => {
    setIsDropdownOpen(false);
    logout();
    navigate("/");
  };

  return (
    <header
      className={`w-full max-h-[var(--header-height)] bg-primary-100 flex items-center px-4 justify-between`}
    >
      <div className="h-[var(--header-height)] flex items-center justify-start ">
        <Link to="/dashboard">
          <div className="flex items-center gap-3">
            <BlinkingIcon
              src={icaneLogo}
              alt="iCane logo"
              className="h-12 w-[60px] object-contain"
            />
            <span className="hidden sm:flex text-white text-4xl font-gabriela tracking-wide">
              icane
            </span>
          </div>
        </Link>
      </div>
      {/* Right Section: Online Badge, Notification, User Avatar */}
      <div className="flex items-center gap-4">
        {/* Online Status Badge */}
        <div
          className={
            "flex items-center gap-2 text-white px-4 py-1.5 rounded-md font-poppins text-sm font-medium " +
            (connectionStatus ? "bg-green-500" : "bg-gray-500")
          }
        >
          <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
          {connectionStatus ? "Online" : "Offline"}
        </div>
        <button
          onClick={handleNotificationClick}
          className="relative p-2 text-white hover:bg-white/10 rounded-lg transition-colors duration-200"
          aria-label="Notifications"
        >
          <img
            src={notifBell}
            alt="Notifications"
            className="w-6 h-6 object-contain"
          />
          {notificationCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-poppins font-semibold w-5 h-5 flex items-center justify-center rounded-full">
              {notificationCount > 9 ? "9+" : notificationCount}
            </span>
          )}
        </button>
        {/* User Avatar with Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-10 h-10 bg-blue-500 hover:bg-blue-600 text-white rounded-full flex items-center justify-center font-poppins font-semibold text-lg transition-colors duration-200"
            aria-label="User menu"
          >
            {user ? user.userName.charAt(0).toUpperCase() : "Z"}
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 top-14 w-56 animate-[slideDown_0.2s_ease-out] z-[100]">
              {/* Dropdown content */}
              <div className="relative bg-white rounded-2xl shadow-lg">
                {/* Arrow pointer - triangle pointing up to profile icon */}
                <div className="absolute -top-3 right-3 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-b-[12px] border-b-white"></div>

                {/* Ito 'yung bagong container na nagse-center ng lahat */}
                <div className="p-6 flex flex-col items-center gap-4">
                  {/* Profile Button (Ginawa nating text na lang 'yung itsura) */}
                  <button
                    onClick={handleProfileClick}
                    className="w-full px-4 py-2 text-center font-poppins text-lg font-semibold text-gray-800 hover:bg-gray-50 transition-colors duration-200 rounded-lg"
                  >
                    Profile
                  </button>

                  {/* Log Out Button (Pill-shaped) */}
                  <button
                    onClick={handleLogoutClick}
                    className="flex items-center justify-center gap-2 px-6 py-3 font-poppins text-base transition-colors duration-200 rounded-full"
                    style={{ backgroundColor: "#F3C8C8", color: "#CE4B34" }}
                  >
                    <Icon icon="ic:baseline-logout" className="text-xl" />
                    <span className="font-medium">Log Out</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
