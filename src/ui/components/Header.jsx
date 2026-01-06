import { useState, useRef, useEffect } from "react";
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";
import icaneLogo from "@/assets/images/smartcane-logo.png";
import { BlinkingIcon } from "@/wrapper/MotionWrapper";
import { Link } from "react-router-dom";
import { useRealtimeStore, useUserStore } from "@/stores/useStore";
import { logoutApi } from "@/api/authService";

const Header = () => {
  const isBackendEnabled = import.meta.env.VITE_BACKEND_ENABLED === "true";
  const { user, clearUser } = useUserStore();
  const { connectionStatus, disconnectWs } = useRealtimeStore();
  const [notificationCount, setNotificationCount] = useState(0);
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

  const handleLogoutClick = async () => {
    if (!isBackendEnabled) {
      clearUser();
      navigate("/login");
      return;
    }
    setIsDropdownOpen(false);
    try {
      const response = await logoutApi();
      if (response.success) {
        clearUser();
        disconnectWs();
        navigate("/login");
      }
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const getProfileImageUrl = () => {
    if (!user) return null;

    if (user.guardianImageUrl) {
      // If it's just a relative path (like "profile_pics/filename.jpg"),
      // we need to prepend the base URL
      let imageUrl = user.guardianImageUrl;

      // Check if it's already a full URL
      if (!imageUrl.startsWith("http") && !imageUrl.startsWith("blob:")) {
        // Prepend the base URL - use your backend URL
        imageUrl = `${import.meta.env.VITE_BACKEND_URL || "http://localhost:5000"}/uploads/${imageUrl}`;
      }

      return imageUrl;
    }

    // Also check for profileImage if it exists
    if (user.profileImage) {
      return user.profileImage;
    }

    return null;
  };

  const profileImageUrl = getProfileImageUrl();
  const userInitial = user ? user.username?.charAt(0).toUpperCase() : "Z";

  return (
    <header
      className={`w-full max-h-[var(--header-height)] bg-primary-100 flex items-center px-5 sm:px-15 justify-between`}
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
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Online Status Badge */}
        <div
          className={
            "flex items-center gap-1.5 text-white px-3 py-1 rounded-full font-poppins text-xs font-medium " +
            (connectionStatus ? "bg-[#55B938]" : "bg-gray-500")
          }
        >
          <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
          {connectionStatus ? "Online" : "Offline"}
        </div>
        <button
          onClick={handleNotificationClick}
          className="relative p-2 text-white hover:bg-white/10 rounded-full transition-colors duration-200"
          aria-label="Notifications"
        >
          <Icon icon="ph:bell" className="w-6 h-6" />
          {notificationCount > 0 && (
            <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-poppins font-bold w-4 h-4 flex items-center justify-center rounded-full border-2 border-primary-100">
              {notificationCount > 9 ? "9+" : notificationCount}
            </span>
          )}
        </button>
        {/* User Avatar with Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden flex items-center justify-center transition-colors duration-200"
            aria-label="User menu"
          >
            {profileImageUrl ? (
              <>
                {/* Profile Image */}
                <img
                  src={profileImageUrl}
                  alt="Profile"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = "none";
                    // Show the initial as fallback when image fails
                    const fallbackElement =
                      e.target.parentElement.querySelector(
                        ".profile-initial-fallback"
                      );
                    if (fallbackElement) {
                      fallbackElement.classList.remove("hidden");
                    }
                  }}
                />
                {/* Hidden fallback initial - shown if image fails */}
                <div className="profile-initial-fallback hidden w-full h-full bg-white hover:bg-gray-100 text-primary-100 flex items-center justify-center font-poppins font-semibold text-sm sm:text-base">
                  {userInitial}
                </div>
              </>
            ) : (
              /* Default initial when no profile image */
              <div className="w-full h-full bg-white hover:bg-gray-100 text-primary-100 flex items-center justify-center font-poppins font-semibold text-sm sm:text-base">
                {userInitial}
              </div>
            )}
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 top-14 w-56 animate-[slideDown_0.2s_ease-out] z-[100]">
              {/* Dropdown content */}
              <div className="relative bg-white rounded-2xl shadow-lg">
                {/* Arrow pointer - triangle pointing up to profile icon */}
                <div className="absolute -top-3 right-3 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-b-[12px] border-b-white"></div>

                {/* Ito 'yung bagong container na nagse-center ng lahat */}
                <div className="py-2 flex flex-col w-full">
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      navigate("/profile");
                    }}
                    className="w-full px-6 py-3 text-left font-poppins text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200 border-b border-gray-100"
                  >
                    Profile
                  </button>
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      navigate("/settings");
                    }}
                    className="w-full px-6 py-3 text-left font-poppins text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200 border-b border-gray-100"
                  >
                    Settings
                  </button>
                  <button
                    onClick={handleLogoutClick}
                    className="w-full px-6 py-3 text-left font-poppins text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                  >
                    Logout
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
