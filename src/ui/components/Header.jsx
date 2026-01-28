import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";
import icaneLogo from "@/assets/images/smartcane-logo.png";
import { BlinkingIcon } from "@/wrapper/MotionWrapper";
import { Link } from "react-router-dom";
import {
  useDevicesStore,
  useGuardiansStore,
  useRealtimeStore,
  useUIStore,
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

const NotificationDropdown = ({ notifications, onClose, onNavigateToAll }) => {
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const getTypeIcon = (type) => {
    switch (type) {
      case "alert":
        return "ph:warning-circle";
      case "warning":
        return "ph:warning";
      case "info":
        return "ph:info";
      default:
        return "ph:bell";
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "alert":
        return "text-red-500";
      case "warning":
        return "text-yellow-500";
      case "info":
        return "text-blue-500";
      default:
        return "text-gray-500";
    }
  };

  const formatTime = (date) => {
    const now = new Date();
    const diffMs = now - new Date(date);
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffMs / 86400000)}d ago`;
  };

  const handleNotificationClick = (notification) => {
    onClose();
  };

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl z-50 border border-gray-200 overflow-hidden animate-[slideDown_0.2s_ease-out]"
    >
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 text-lg">Notifications</h3>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">
              {notifications.length} total
            </span>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
            >
              <Icon icon="ph:x" className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-h-[400px] overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-8 text-center">
            <Icon
              icon="ph:bell-slash"
              className="w-12 h-12 mx-auto mb-3 text-gray-300"
            />
            <p className="text-gray-500 text-sm">No notifications yet</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.slice(0, 5).map((notification) => (
              <motion.button
                key={notification.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={() => handleNotificationClick(notification)}
                className={`w-full text-left p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                  !notification.read ? "bg-blue-50/50" : ""
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`mt-1 ${getTypeColor(notification.type)}`}>
                    <Icon
                      icon={getTypeIcon(notification.type)}
                      className="w-5 h-5"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-medium text-gray-900 text-sm">
                          {notification.title}
                        </h4>
                        <p className="text-gray-600 text-xs mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 whitespace-nowrap">
                          {formatTime(notification.timestamp)}
                        </span>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                      </div>
                    </div>
                    <div className="mt-2">
                      <span className="text-xs text-gray-400">
                        Device: {notification.deviceId}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </div>

      <div className="p-4 border-t border-gray-100 bg-gray-50/50">
        <div className="flex items-center justify-between">
          <button
            onClick={() => {
              onClose();
              onNavigateToAll();
            }}
            className="text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center gap-1 cursor-pointer"
          >
            See all notifications
            <Icon icon="ph:arrow-right" className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              console.log("Mark all as read");
            }}
            className="text-gray-600 hover:text-gray-700 text-sm font-medium cursor-pointer"
          >
            Mark all as read
          </button>
        </div>
      </div>
    </div>
  );
};

const Header = () => {
  const isBackendEnabled = import.meta.env.VITE_BACKEND_ENABLED === "true";
  const { user, clearUser } = useUserStore();
  const { setMobileMenuOpen, isMobileMenuOpen } = useUIStore();
  const { devices, clearDevices, selectedDevice, setSelectedDevice } =
    useDevicesStore();
  const { clearAllGuardians } = useGuardiansStore();
  const { connectionStatus, disconnectWs } = useRealtimeStore();
  const [notificationCount, setNotificationCount] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const [profileImageUrl, setProfileImageUrl] = useState(null);
  const [imageError, setImageError] = useState(false);

  const [vipOpen, setVipOpen] = useState(false);
  const vipRef = useRef(null);

  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const notificationRef = useRef(null);

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
    const fetchNotifications = () => {
      setNotificationCount(3);
    };

    fetchNotifications();
  }, []);

  useEffect(() => {
    const fetchNotifications = () => {
      const mockNotifications = [
        {
          id: 1,
          title: "Fall Detected",
          message: "John Smith's iCane detected a fall at Main Street",
          timestamp: new Date(Date.now() - 5 * 60 * 1000),
          type: "alert",
          read: false,
          deviceId: "ICN-001"
        },
        {
          id: 2,
          title: "Battery Low",
          message: "iCane device battery is at 15%",
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          type: "warning",
          read: true,
          deviceId: "IC-12345"
        },
        {
          id: 3,
          title: "Device Connected",
          message: "New iCane device paired successfully",
          timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          type: "info",
          read: false,
          deviceId: "IC-67890"
        }
      ];
      setNotifications(mockNotifications);
      setNotificationCount(mockNotifications.filter((n) => !n.read).length);
    };

    fetchNotifications();

    const interval = setInterval(() => {
      fetchNotifications();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target) &&
        !event.target.closest(".notification-button")
      ) {
        setIsNotificationOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNotificationClick = () => {
    setIsNotificationOpen(!isNotificationOpen);
  };

  const handleNavigateToNotifications = () => {
    setIsNotificationOpen(false);
    navigate("/notifications");
  };

  const showImage = profileImageUrl && !imageError;
  const userInitial = user ? user.firstName?.charAt(0).toUpperCase() : "Z";

  return (
    <>
      <header
        className={`w-full h-[var(--header-height)] bg-primary-100 flex items-center justify-between px-4 sm:px-6 md:px-8 lg:px-12 xl:px-15 relative z-50`}
      >
        {/* Logo Section - Left */}
        <div className="flex items-center h-full">
          <Link to="/dashboard" className="flex items-center gap-2 md:gap-3">
            <BlinkingIcon
              src={icaneLogo}
              alt="iCane logo"
              className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-[60px] object-contain"
            />
            <span className="text-white text-2xl sm:text-3xl md:text-4xl font-gabriela tracking-wide hidden sm:inline">
              icane
            </span>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
          aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
        >
          <motion.div
            initial={false}
            animate={{
              rotate: isMobileMenuOpen ? 90 : 0,
              scale: isMobileMenuOpen ? 1.1 : 1
            }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 20
            }}
          >
            <Icon
              icon={isMobileMenuOpen ? "ph:x" : "ph:list"}
              className="w-6 h-6"
            />
          </motion.div>
        </button>

        {/* Desktop Navigation Section - Center */}
        <div className="hidden md:flex items-center flex-1 justify-center gap-4 lg:gap-6"></div>

        {/* Desktop Actions - Right */}
        <div className="hidden md:flex items-center gap-3 lg:gap-4">
          <div ref={vipRef} className="relative">
            <button
              onClick={() => setVipOpen(!vipOpen)}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 transition px-3 py-1.5 rounded-full min-w-[140px] lg:min-w-[160px] max-w-[180px]"
            >
              <div className="w-7 h-7 lg:w-8 lg:h-8 rounded-full overflow-hidden bg-gray-200 shrink-0">
                {selectedDevice?.vip?.vipImageUrl ? (
                  <img
                    src={resolveProfileImageSrc(
                      selectedDevice?.vip?.vipImageUrl
                    )}
                    className="w-full h-full object-cover"
                    alt="VIP"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs font-semibold text-gray-500">
                    {selectedDevice?.deviceSerialNumber?.slice(-2)}
                  </div>
                )}
              </div>

              <span className="text-sm font-medium text-white truncate flex-1 text-left">
                {selectedDevice?.vip?.firstName
                  ? capitalizeWords(selectedDevice.vip.firstName)
                  : selectedDevice?.deviceSerialNumber || "No VIP"}
              </span>

              <Icon
                icon="ph:caret-down-bold"
                className="w-4 h-4 text-white shrink-0"
              />
            </button>

            {/* VIP Dropdown */}
            {vipOpen && (
              <div
                className="absolute left-1/2 -translate-x-1/2 top-12 bg-white rounded-2xl shadow-xl ring-1 ring-black/5 z-50 overflow-hidden min-w-full max-h-[60vh] flex flex-col"
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
                      <div className="w-9 h-9 rounded-full overflow-hidden bg-gray-100 shrink-0">
                        {device?.vip?.vipImageUrl ? (
                          <img
                            src={resolveProfileImageSrc(
                              device?.vip?.vipImageUrl
                            )}
                            className="w-full h-full object-cover"
                            alt="VIP"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs font-semibold text-gray-500">
                            {device?.deviceSerialNumber?.slice(-2)}
                          </div>
                        )}
                      </div>
                      <p className="text-sm font-medium text-gray-800 truncate">
                        {device.vip?.firstName && device.vip?.lastName
                          ? capitalizeWords(
                              device.vip.firstName + " " + device.vip.lastName
                            )
                          : device?.deviceSerialNumber}
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
          <div
            className={`flex items-center gap-1.5 text-white px-3 py-1.5 rounded-full font-poppins text-xs font-medium whitespace-nowrap ${
              connectionStatus ? "bg-[#55B938]" : "bg-gray-500"
            }`}
          >
            <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
            <span className="hidden lg:inline">
              {connectionStatus ? "Connected" : "Disconnected"}
            </span>
            <span className="lg:hidden">
              {connectionStatus ? "Connected" : "Disconnected"}
            </span>
          </div>
          {/* Notifications */}
          <div className="relative" ref={notificationRef}>
            <button
              onClick={handleNotificationClick}
              className="relative p-2 text-white hover:bg-white/10 rounded-full transition-colors notification-button"
              aria-label="Notifications"
            >
              <Icon icon="ph:bell" className="w-6 h-6" />
              {notificationCount > 0 && (
                <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-poppins font-bold w-4 h-4 flex items-center justify-center rounded-full border-2 border-primary-100">
                  {notificationCount > 9 ? "9+" : notificationCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            <AnimatePresence>
              {isNotificationOpen && (
                <NotificationDropdown
                  notifications={notifications}
                  onClose={() => setIsNotificationOpen(false)}
                  onNavigateToAll={handleNavigateToNotifications}
                />
              )}
            </AnimatePresence>
          </div>

          {/* Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-9 h-9 lg:w-10 lg:h-10 rounded-full overflow-hidden flex items-center justify-center transition-colors hover:ring-2 hover:ring-white/30 cursor-pointer"
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
              )}
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 top-14 w-56 animate-[slideDown_0.2s_ease-out] z-20">
                <div className="relative bg-white rounded-2xl shadow-lg">
                  <div className="absolute -top-3 right-3 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-b-[12px] border-b-white"></div>
                  <div className="py-2 flex flex-col w-full">
                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        navigate("/profile");
                      }}
                      className="w-full px-6 py-3 text-left font-poppins text-sm text-gray-700 hover:bg-gray-50 transition-colors border-b border-gray-100 cursor-pointer flex items-center gap-3"
                    >
                      <Icon icon="ph:user" className="w-4 h-4" />
                      Profile
                    </button>
                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        navigate("/settings");
                      }}
                      className="w-full px-6 py-3 text-left font-poppins text-sm text-gray-700 hover:bg-gray-50 transition-colors border-b border-gray-100 cursor-pointer flex items-center gap-3"
                    >
                      <Icon icon="ph:gear" className="w-4 h-4" />
                      Settings
                    </button>
                    <button
                      onClick={handleLogoutClick}
                      className="w-full px-6 py-3 text-left font-poppins text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer flex items-center gap-3"
                    >
                      <Icon icon="ph:sign-out" className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              <motion.div
                initial={{ y: -5, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -5, opacity: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 320,
                  damping: 24
                }}
                className="absolute top-full left-0 right-0 bg-primary-100 z-40 md:hidden"
              >
                <motion.div
                  initial="hidden"
                  animate="show"
                  exit="hidden"
                  variants={{
                    hidden: {},
                    show: {
                      transition: {
                        staggerChildren: 0.04
                      }
                    }
                  }}
                  className="px-4 py-6 space-y-6 border-t border-white/10"
                >
                  <div className="mb-6">
                    <div className="text-white/80 text-sm font-medium mb-2 px-2">
                      Select Device
                    </div>
                    <div className="space-y-2 max-h-[20vh] overflow-y-auto pr-1">
                      {devices.map((device) => (
                        <button
                          key={device.deviceId}
                          onClick={() => {
                            setSelectedDevice(device);
                            setMobileMenuOpen(false);
                          }}
                          className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${
                            selectedDevice?.deviceId === device.deviceId
                              ? "bg-white/20"
                              : "bg-white/10 hover:bg-white/15"
                          }`}
                        >
                          <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 shrink-0">
                            {device?.vip?.vipImageUrl ? (
                              <img
                                src={resolveProfileImageSrc(
                                  device?.vip?.vipImageUrl
                                )}
                                className="w-full h-full object-cover"
                                alt="VIP"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-sm font-semibold text-gray-500">
                                {device?.deviceSerialNumber?.slice(-2)}
                              </div>
                            )}
                          </div>
                          <div className="flex-1 text-left">
                            <p className="text-white font-medium">
                              {device.vip?.firstName && device.vip?.lastName
                                ? capitalizeWords(
                                    device.vip.firstName +
                                      " " +
                                      device.vip.lastName
                                  )
                                : device?.deviceSerialNumber}
                            </p>
                            <p className="text-white/60 text-xs">
                              {device.deviceSerialNumber}
                            </p>
                          </div>
                        </button>
                      ))}
                      {devices.length === 0 && (
                        <div className="text-center text-white/60 py-4">
                          No VIP devices
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                    <span className="text-white font-medium">Connection</span>
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${connectionStatus ? "bg-green-400" : "bg-red-400"}`}
                      />
                      <span className="text-white/80 text-sm">
                        {connectionStatus ? "Connected" : "Disconnected"}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        navigate("/profile");
                      }}
                      className="w-full flex items-center gap-3 p-3 text-white hover:bg-white/10 rounded-xl transition-colors"
                    >
                      <Icon icon="ph:user" className="w-5 h-5" />
                      <span className="font-medium">Profile</span>
                    </button>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        navigate("/settings");
                      }}
                      className="w-full flex items-center gap-3 p-3 text-white hover:bg-white/10 rounded-xl transition-colors"
                    >
                      <Icon icon="ph:gear" className="w-5 h-5" />
                      <span className="font-medium">Settings</span>
                    </button>
                    <button
                      onClick={() => {
                        handleNavigateToNotifications();
                        setMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3 p-3 text-white hover:bg-white/10 rounded-xl transition-colors relative"
                    >
                      <Icon icon="ph:bell" className="w-5 h-5" />
                      <span className="font-medium">Notifications</span>
                      {notificationCount > 0 && (
                        <span className="absolute right-3 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                          {notificationCount > 9 ? "9+" : notificationCount}
                        </span>
                      )}
                    </button>
                    <button
                      onClick={handleLogoutClick}
                      className="w-full flex items-center gap-3 p-3 text-red-400 hover:bg-white/10 rounded-xl transition-colors"
                    >
                      <Icon icon="ph:sign-out" className="w-5 h-5" />
                      <span className="font-medium">Logout</span>
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </header>
    </>
  );
};

export default Header;
