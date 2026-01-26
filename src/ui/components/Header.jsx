import { useState, useRef, useEffect } from "react";
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";
import icaneLogo from "@/assets/images/smartcane-logo.png";
import { BlinkingIcon } from "@/wrapper/MotionWrapper";
import { Link } from "react-router-dom";
import {
  useDevicesStore,
  useGuardiansStore,
  useRealtimeStore,
  useUserStore
} from "@/stores/useStore";
import { logoutApi } from "@/api/authService";
import DefaultProfile from "./DefaultProfile";
import { capitalizeWords } from "@/utils/Capitalize";
import { resolveProfileImageSrc } from "@/utils/ResolveImage";

function showLogoutModal(message = "Logging out...") {
  if (document.getElementById("logout-modal-overlay")) return;

  // Create overlay container
  const overlay = document.createElement("div");
  overlay.id = "logout-modal-overlay";

  // Create and append framer-motion-like styles
  const styleEl = document.createElement("style");
  styleEl.innerHTML = `
    #logout-modal-overlay {
      position: fixed;
      inset: 0;
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: center;
      pointer-events: all;
    }
    
    #logout-modal-overlay .backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(4px);
      opacity: 0;
      animation: fadeIn 0.3s ease-out forwards;
    }
    
    #logout-modal-overlay .modal-content {
      position: relative;
      z-index: 10;
      background: white;
      border-radius: 1rem;
      padding: 2.5rem;
      min-width: 300px;
      max-width: 90%;
      text-align: center;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
      border: 1px solid #f3f4f6;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1.5rem;
      font-family: system-ui, -apple-system, sans-serif;
      opacity: 0;
      transform: translateY(20px) scale(0.95);
      animation: slideUp 0.3s ease-out 0.1s forwards;
    }
    
    #logout-modal-overlay .spinner-container {
      position: relative;
      width: 4rem;
      height: 4rem;
    }
    
    #logout-modal-overlay .spinner {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      border-radius: 50%;
      border: 4px solid #f3f3f3;
      border-top: 4px solid #11285A;
      animation: spin 1s linear infinite;
    }
    
    #logout-modal-overlay .message {
      font-size: 1.25rem;
      font-weight: 600;
      color: #111827;
      margin: 0;
    }
    
    #logout-modal-overlay .submessage {
      font-size: 0.875rem;
      color: #6b7280;
      margin: 0;
    }
    
    #logout-modal-overlay .progress-bar {
      width: 100%;
      height: 4px;
      background: #f3f4f6;
      border-radius: 2px;
      overflow: hidden;
      margin-top: 0.5rem;
    }
    
    #logout-modal-overlay .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #11285A, #3b82f6);
      border-radius: 2px;
      width: 0%;
      animation: progress 2s ease-in-out infinite;
    }
    
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    
    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(20px) scale(0.95);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }
    
    @keyframes fadeOut {
      from { opacity: 1; }
      to { opacity: 0; }
    }
    
    @keyframes slideDown {
      from {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
      to {
        opacity: 0;
        transform: translateY(20px) scale(0.95);
      }
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    @keyframes progress {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(200%); }
    }
    
    /* Disable body scroll and interaction */
    body.logout-modal-open {
      overflow: hidden;
      pointer-events: none;
      user-select: none;
    }
    
    body.logout-modal-open * {
      pointer-events: none;
    }
    
    body.logout-modal-open #logout-modal-overlay,
    body.logout-modal-open #logout-modal-overlay * {
      pointer-events: all;
    }
  `;
  document.head.appendChild(styleEl);

  // Create backdrop
  const backdrop = document.createElement("div");
  backdrop.className = "backdrop";

  // Create modal content
  const modalContent = document.createElement("div");
  modalContent.className = "modal-content";

  // Create spinner container
  const spinnerContainer = document.createElement("div");
  spinnerContainer.className = "spinner-container";

  const spinner = document.createElement("div");
  spinner.className = "spinner";

  spinnerContainer.appendChild(spinner);

  // Create message container
  const messageContainer = document.createElement("div");

  const mainMessage = document.createElement("h3");
  mainMessage.className = "message";
  mainMessage.textContent = message;

  const subMessage = document.createElement("p");
  subMessage.className = "submessage";
  subMessage.textContent = "Please wait while we secure your session...";

  messageContainer.appendChild(mainMessage);
  messageContainer.appendChild(subMessage);

  // Create progress bar
  const progressBar = document.createElement("div");
  progressBar.className = "progress-bar";

  const progressFill = document.createElement("div");
  progressFill.className = "progress-fill";

  progressBar.appendChild(progressFill);

  // Assemble modal
  modalContent.appendChild(spinnerContainer);
  modalContent.appendChild(messageContainer);
  modalContent.appendChild(progressBar);

  // Assemble overlay
  overlay.appendChild(backdrop);
  overlay.appendChild(modalContent);

  // Add to document
  document.body.appendChild(overlay);
  document.body.classList.add("logout-modal-open");

  // Return hide function with animations
  return function hideLogoutModal() {
    if (!overlay.parentNode) return;

    // Add exit animations
    backdrop.style.animation = "fadeOut 0.2s ease-out forwards";
    modalContent.style.animation = "slideDown 0.2s ease-out forwards";

    // Remove elements after animation
    setTimeout(() => {
      overlay.remove();
      styleEl.remove();
      document.body.classList.remove("logout-modal-open");
    }, 200);
  };
}

const Header = () => {
  const isBackendEnabled = import.meta.env.VITE_BACKEND_ENABLED === "true";
  const { user, clearUser } = useUserStore();
  const { devices, clearDevices } = useDevicesStore();
  const { clearAllGuardians } = useGuardiansStore();
  const { connectionStatus, disconnectWs } = useRealtimeStore();
  const [notificationCount, setNotificationCount] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const [profileImageUrl, setProfileImageUrl] = useState(null);
  const [imageError, setImageError] = useState(false);

  const [selectedDevice, setSelectedDevice] = useState(null);
  const [vipOpen, setVipOpen] = useState(false);
  const vipRef = useRef(null);

  useEffect(() => {
    if (devices.length && !selectedDevice) {
      setSelectedDevice(devices[0]);
    }
  }, [devices]);

  useEffect(() => {
    const handler = (e) => {
      if (vipRef.current && !vipRef.current.contains(e.target)) {
        setVipOpen(false);
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    setImageError(false);
    if (user?.guardianImageUrl) {
      let url = user.guardianImageUrl;
      if (!url.startsWith("http") && !url.startsWith("blob:")) {
        url = `${import.meta.env.VITE_BACKEND_URL || "http://localhost:5000"}/uploads/${url}`;
      }
      setProfileImageUrl(url);
    } else if (user?.profileImage) {
      setProfileImageUrl(user.profileImage);
    } else {
      setProfileImageUrl(null);
    }
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNotificationClick = () => {};

  const handleLogoutClick = async () => {
    if (!isBackendEnabled) {
      clearUser();
      navigate("/login");
      return;
    }
    const enablePage = showLogoutModal("Logging out...");
    try {
      setIsLoggingOut(true);

      const response = await logoutApi();
      if (response.success) {
        clearUser();
        clearDevices();
        clearAllGuardians();
        disconnectWs();
        setIsDropdownOpen(false);
        setIsLoggingOut(false);
        navigate("/login");
      }
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setIsLoggingOut(false);
      enablePage();
    }
  };

  useEffect(() => {
    // Placeholder: Replace with actual notification fetching logic
    const fetchNotifications = () => {
      // Simulate fetching notification count
      setNotificationCount(3); // Example static count
    };

    fetchNotifications();
  }, []);

  const showImage = profileImageUrl && !imageError;
  const userInitial = user ? user.firstName?.charAt(0).toUpperCase() : "Z";

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

      <div className="flex items-center gap-3 sm:gap-4">
        <div ref={vipRef} className="relative">
          <button
            onClick={() => setVipOpen(!vipOpen)}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 transition px-3 py-1.5 rounded-full w-full max-w-[120px] "
          >
            <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 shrink-0">
              {selectedDevice?.vip?.vipImageUrl ? (
                <img
                  src={resolveProfileImageSrc(selectedDevice?.vip?.vipImageUrl)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs font-semibold text-gray-500">
                  {selectedDevice?.deviceSerialNumber?.slice(-2)}
                </div>
              )}
            </div>

            <span className="text-sm font-medium text-white truncate max-w-[120px] sm:max-w-[100px]">
              {(selectedDevice?.vip?.firstName &&
                selectedDevice?.vip?.lastName &&
                capitalizeWords(selectedDevice?.vip?.firstName)) ||
                selectedDevice?.deviceSerialNumber ||
                "No VIP"}
            </span>

            <Icon icon="ph:caret-down-bold" className="w-4 h-4 text-white" />
          </button>

          {/* Dropdown */}
          {vipOpen && (
            <div
              className="absolute right-0 top-12 bg-white rounded-2xl shadow-xl ring-1 ring-black/5 z-50 overflow-hidden min-w-full sm:min-w-[170px]"
              style={{ minWidth: vipRef.current?.offsetWidth }}
            >
              <div className="py-2 max-h-80 overflow-y-auto">
                {devices.map((device) => (
                  <button
                    key={device.deviceId}
                    onClick={() => {
                      setSelectedDevice(device);
                      setVipOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition"
                  >
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 shrink-0">
                      {device?.vip?.vipImageUrl ? (
                        <img
                          src={resolveProfileImageSrc(device?.vip?.vipImageUrl)}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs font-semibold text-gray-500">
                          {device?.deviceSerialNumber?.slice(-2)}
                        </div>
                      )}
                    </div>

                    <p className="text-sm font-medium text-gray-800 truncate max-w-[150px] sm:max-w-[120px]">
                      {(device.vip?.firstName &&
                        device.vip?.lastName &&
                        capitalizeWords(
                          device?.vip?.firstName + " " + device?.vip?.lastName
                        )) ||
                        device?.deviceSerialNumber}
                    </p>
                  </button>
                ))}

                {devices.length === 0 && (
                  <div className="py-8 text-center text-sm text-gray-400">
                    No VIP available
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

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
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden flex items-center justify-center transition-colors duration-200 cursor-pointer"
            aria-label="User menu"
          >
            {showImage ? (
              <img
                loading="lazy"
                src={profileImageUrl}
                alt="Profile"
                className="w-full h-full object-cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <DefaultProfile userInitial={userInitial} />
              //   <div
              //     className="w-full h-full bg-white hover:bg-gray-100 text-primary-100
              //  flex items-center justify-center font-poppins font-semibold
              //  text-sm sm:text-base"
              //   >
              //     {userInitial}
              //   </div>
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
                    className="w-full px-6 py-3 text-left font-poppins text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200 border-b border-gray-100 cursor-pointer"
                  >
                    Profile
                  </button>
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      navigate("/settings");
                    }}
                    disabled={isLoggingOut}
                    className="w-full px-6 py-3 text-left font-poppins text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200 border-b border-gray-100 cursor-pointer"
                  >
                    Settings
                  </button>
                  <button
                    onClick={handleLogoutClick}
                    className="w-full px-6 py-3 text-left font-poppins text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200 flex gap-2 cursor-pointer"
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
