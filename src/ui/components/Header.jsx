import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";
import icaneLogo from "@/assets/images/smartcane-logo.png";
import { BlinkingIcon } from "@/wrapper/MotionWrapper";
import { Link } from "react-router-dom";
import {
  useActivityReportsStore,
  useDeviceLogsStore,
  useDevicesStore,
  useGuardiansStore,
  useNotificationsStore, // added van
  useRealtimeStore,
  useUIStore,
  useUserStore
} from "@/stores/useStore";
import { logoutApi } from "@/api/authService";
import DefaultProfile from "./DefaultProfile";
import { capitalizeWords } from "@/utils/Capitalize";
import { openNotificationTarget } from "@/utils/importantNotifications";
import { resolveProfileImageSrc } from "@/utils/ResolveImage";
import { useRouteStore } from "@/stores/useRouteStore";
import Modal from "./Modal";

const LOGOUT_TRANSITION_MS = 550;

// color map for notification icon bubbles — added van
const COLOR = {
  blue: { bg: "bg-blue-100", icon: "text-blue-600" },
  indigo: { bg: "bg-indigo-100", icon: "text-indigo-600" },
  green: { bg: "bg-green-100", icon: "text-green-600" },
  orange: { bg: "bg-orange-100", icon: "text-orange-600" },
  purple: { bg: "bg-purple-100", icon: "text-purple-600" },
  red: { bg: "bg-red-100", icon: "text-red-600" },
  gray: { bg: "bg-gray-100", icon: "text-gray-500" }
};

// convert UTC timestamp to Manila time van
const toManilaDate = (raw) => {
  if (!raw) return null;
  const str = typeof raw === "string" ? raw.replace(" ", "T") : String(raw);
  const withZ = !str.endsWith("Z") && !str.includes("+") ? str + "Z" : str;
  const date = new Date(withZ);
  return isNaN(date.getTime()) ? null : date;
};

// format timestamp added van
const formatTime = (raw) => {
  const date = toManilaDate(raw);
  if (!date) return "—";
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days = Math.floor(diff / 86_400_000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString("en-PH", {
    timeZone: "Asia/Manila",
    month: "short",
    day: "numeric",
    year: "numeric"
  });
};

const NotificationDropdown = ({
  notifications,
  unreadCount, // added van
  onClose,
  onNotifClick, // added van
  onSeeAll, // added van
  onMarkAllRead // added van
}) => {
  const dropdownRef = useRef(null);
  const { markAsRead } = useNotificationsStore(); // added van

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl z-50 border border-gray-200 overflow-hidden animate-[slideDown_0.2s_ease-out]"
    >
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900 text-lg">
              Notifications
            </h3>
            {/* unread badge van */}
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
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
            {notifications.slice(0, 5).map((notif) => {
              const c = COLOR[notif.color] || COLOR.gray; // color map van
              return (
                <motion.button
                  key={notif.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  onClick={() => {
                    if (!notif.read) markAsRead(notif.historyId); // mark read on click van
                    onClose();
                    onNotifClick(notif);
                  }}
                  className={`w-full text-left p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                    !notif.read ? "bg-blue-50/50" : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/*  icon  van */}
                    <div
                      className={`shrink-0 w-8 h-8 rounded-lg ${c.bg} flex items-center justify-center mt-0.5`}
                    >
                      <Icon icon={notif.icon} className={`w-4 h-4 ${c.icon}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h4 className="font-medium text-gray-900 text-sm truncate">
                            {notif.title}
                          </h4>
                          <p className="text-gray-600 text-xs mt-0.5 line-clamp-2">
                            {notif.message}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {/* timestamp van*/}
                          <span className="text-xs text-gray-400 whitespace-nowrap">
                            {formatTime(notif.timestamp)}
                          </span>
                          {!notif.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full shrink-0" />
                          )}
                        </div>
                      </div>
                      {/* guardian name van */}
                      <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1">
                        <Icon icon="ph:user-circle" className="w-3 h-3" />
                        {notif.guardianName}
                      </p>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        )}
      </div>

      <div className="p-4 border-t border-gray-100 bg-gray-50/50">
        <div className="flex items-center justify-between">
          <button
            onClick={() => {
              onClose();
              onSeeAll(); // added van
            }}
            className="text-[#11285A] hover:text-[#11285A]/80 font-medium text-sm flex items-center gap-1 cursor-pointer"
          >
            See all notifications
            <Icon icon="ph:arrow-right" className="w-4 h-4" />
          </button>
          {/* mark all read button van */}
          {unreadCount > 0 && (
            <button
              onClick={onMarkAllRead}
              className="text-gray-600 hover:text-gray-800 text-sm font-medium cursor-pointer transition-colors"
            >
              Mark all as read
            </button>
          )}
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
  const { clearDeviceLogs, getDeviceLogs } = useDeviceLogsStore();
  const { clearAllGuardians } = useGuardiansStore();
  const { disconnectWs, componentHealth } = useRealtimeStore();
  const { clearRoute } = useRouteStore();
  const { clearHistory } = useActivityReportsStore();

  // real notifications van
  const { history } = useActivityReportsStore();
  const { getNotifications, markAllRead } = useNotificationsStore(); // added van
  const currentGuardianId = user?.guardian_id ?? user?.guardianId; // added van
  const deviceLogs = getDeviceLogs(selectedDevice?.deviceId);

  // notifications from history van
  const allNotifications = getNotifications(
    history,
    deviceLogs,
    currentGuardianId
  );

  // real unread count van
  const unreadCount = allNotifications.filter((n) => !n.read).length;
  const allIds = allNotifications.map((n) => n.historyId); // added van

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [profileImageUrl, setProfileImageUrl] = useState(null);
  const [imageError, setImageError] = useState(false);
  const [vipOpen, setVipOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const [logoutSubmitting, setLogoutSubmitting] = useState(false);

  // removed mock notifications
  // removed notificationCount hardcoded
  // removed setInterval polling mock data

  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const vipRef = useRef(null);
  const notificationRef = useRef(null);

  useEffect(() => {
    if (!devices.length) return;
    if (!selectedDevice) {
      setSelectedDevice(devices[0]);
      return;
    }
    const latestSelectedDevice = devices.find(
      (device) => device.deviceId === selectedDevice.deviceId
    );
    if (latestSelectedDevice) {
      setSelectedDevice(latestSelectedDevice);
    }
  }, [devices, selectedDevice, setSelectedDevice]);

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

  const clearSessionAndNavigateToLogin = () => {
    clearUser();
    clearDevices();
    clearAllGuardians();
    disconnectWs();
    clearRoute();
    clearHistory();
    clearDeviceLogs();
    setIsDropdownOpen(false);
    setIsNotificationOpen(false);
    setMobileMenuOpen(false);
    setLogoutConfirmOpen(false);
    navigate("/login");
  };

  const handleLogoutClick = () => {
    setIsDropdownOpen(false);
    setMobileMenuOpen(false);
    setLogoutConfirmOpen(true);
  };

  const handleLogoutConfirm = async () => {
    if (logoutSubmitting) return;
    setLogoutSubmitting(true);

    const waitForTransition = new Promise((resolve) => {
      setTimeout(resolve, LOGOUT_TRANSITION_MS);
    });

    if (!isBackendEnabled) {
      await waitForTransition;
      clearSessionAndNavigateToLogin();
      setLogoutSubmitting(false);
      return;
    }

    try {
      const [response] = await Promise.all([logoutApi(), waitForTransition]);
      if (response.success) {
        clearSessionAndNavigateToLogin();
      }
    } catch (error) {
      console.error("Logout failed:", error);
      clearSessionAndNavigateToLogin();
    } finally {
      setLogoutSubmitting(false);
    }
  };

  const handleNotificationClick = () => {
    setIsNotificationOpen(!isNotificationOpen);
  };

  const handleNavigateToNotifications = () => {
    setIsNotificationOpen(false);
    navigate("/notifications");
  };

  const handleNotificationItemClick = (notification) => {
    openNotificationTarget(navigate, notification);
  };

  const showImage = profileImageUrl && !imageError;
  const userInitial = user ? user.firstName?.charAt(0).toUpperCase() : "Z";

  return (
    <>
      <header className="w-full h-[var(--header-height)] bg-primary-100 flex items-center justify-between px-4 sm:px-6 md:px-8 lg:px-12 xl:px-15 relative z-50">
        {/* Logo */}
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

        {/* Mobile hamburger */}
        <button
          data-tour="tour-mobile-menu"
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
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <Icon
              icon={isMobileMenuOpen ? "ph:x" : "ph:list"}
              className="w-6 h-6"
            />
          </motion.div>
        </button>

        {/* Desktop center placeholder */}
        <div className="hidden md:flex items-center flex-1 justify-center gap-4 lg:gap-6" />

        {/* Desktop right */}
        <div className="hidden md:flex items-center gap-3 lg:gap-4">
          {/* VIP selector */}
          <div ref={vipRef} className="relative">
            <button
              data-tour="tour-vip-dropdown"
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

            {vipOpen && (
              <div
                className="absolute left-1/2 -translate-x-1/2 top-12 bg-white rounded-2xl shadow-xl ring-1 ring-black/5 z-50 overflow-hidden min-w-full max-h-[60vh] flex flex-col"
                style={{ minWidth: vipRef.current?.offsetWidth }}
              >
                <div className="py-2 max-h-80 overflow-y-auto">
                  {devices.map((device) => {
                    const isSelected =
                      selectedDevice?.deviceId === device.deviceId;
                    return (
                      <button
                        key={device.deviceId}
                        onClick={() => {
                          setVipOpen(false);
                          if (isSelected) return;
                          setSelectedDevice(device);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition cursor-pointer"
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
                    );
                  })}
                  {devices.length === 0 && (
                    <div className="py-8 text-center text-sm text-gray-400">
                      No VIP available
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Connection pill */}
          <div
            data-tour="tour-connection-status"
            className={`flex items-center gap-1.5 text-white px-3 py-1.5 rounded-full font-poppins text-xs font-medium whitespace-nowrap ${
              componentHealth.raspberryPiStatus ? "bg-[#55B938]" : "bg-gray-500"
            }`}
          >
            <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
            <span className="hidden lg:inline">
              {componentHealth.raspberryPiStatus ? "Connected" : "Disconnected"}
            </span>
            <span className="lg:hidden">
              {componentHealth.raspberryPiStatus ? "Connected" : "Disconnected"}
            </span>
          </div>

          {/* Bell van */}
          <div className="relative" ref={notificationRef}>
            <button
              data-tour="tour-notifications"
              onClick={handleNotificationClick}
              className="relative p-2 text-white hover:bg-white/10 rounded-full transition-colors notification-button cursor-pointer"
              aria-label="Notifications"
            >
              <Icon icon="ph:bell" className="w-6 h-6" />
              {/* unread count van */}
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-poppins font-bold min-w-[1.1rem] h-4 px-1 flex items-center justify-center rounded-full border-2 border-primary-100 leading-none">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            <AnimatePresence>
              {isNotificationOpen && (
                //  added van
                <NotificationDropdown
                  notifications={allNotifications}
                  unreadCount={unreadCount}
                  onClose={() => setIsNotificationOpen(false)}
                  onNotifClick={handleNotificationItemClick}
                  onSeeAll={handleNavigateToNotifications}
                  onMarkAllRead={() => markAllRead(allIds)}
                />
              )}
            </AnimatePresence>
          </div>

          {/* Profile dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              data-tour="tour-profile-menu"
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
                  <div className="absolute -top-3 right-3 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-b-[12px] border-b-white" />
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
                        navigate("/activity-logs");
                      }}
                      className="w-full px-6 py-3 text-left font-poppins text-sm text-gray-700 hover:bg-gray-50 transition-colors border-b border-gray-100 cursor-pointer flex items-center gap-3"
                    >
                      <Icon icon="oui:nav-reports" className="w-4 h-4" />
                      History
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

        {/* Mobile slide-down menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              <motion.div
                initial={{ y: -5, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -5, opacity: 0 }}
                transition={{ type: "spring", stiffness: 320, damping: 24 }}
                className="absolute top-full left-0 right-0 bg-primary-100 z-40 md:hidden"
              >
                <motion.div
                  initial="hidden"
                  animate="show"
                  exit="hidden"
                  variants={{
                    hidden: {},
                    show: { transition: { staggerChildren: 0.04 } }
                  }}
                  className="px-4 py-6 space-y-6 border-t border-white/10"
                >
                  <div data-tour="tour-mobile-vip" className="mb-6">
                    <div className="text-white/80 text-sm font-medium mb-2 px-2">
                      Select Device
                    </div>
                    <div className="space-y-2 max-h-[20vh] overflow-y-auto pr-1">
                      {devices.map((device) => {
                        const isSelected =
                          selectedDevice?.deviceId === device.deviceId;
                        return (
                          <button
                            key={device.deviceId}
                            onClick={() => {
                              setMobileMenuOpen(false);
                              if (isSelected) return;
                              setSelectedDevice(device);
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
                        );
                      })}
                      {devices.length === 0 && (
                        <div className="text-center text-white/60 py-4">
                          No VIP devices
                        </div>
                      )}
                    </div>
                  </div>

                  <div
                    data-tour="tour-mobile-connection"
                    className="flex items-center justify-between p-3 bg-white/5 rounded-xl"
                  >
                    <span className="text-white font-medium">Connection</span>
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${componentHealth.raspberryPiStatus ? "bg-green-400" : "bg-red-400"}`}
                      />
                      <span className="text-white/80 text-sm">
                        {componentHealth.raspberryPiStatus
                          ? "Connected"
                          : "Disconnected"}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <button
                      data-tour="tour-mobile-profile"
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
                        navigate("/activity-logs");
                      }}
                      className="w-full flex items-center gap-3 p-3 text-white hover:bg-white/10 rounded-xl transition-colors"
                    >
                      <Icon icon="oui:nav-reports" className="w-5 h-5" />
                      <span className="font-medium">History</span>
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

                    {/* mobile bell van */}
                    <button
                      data-tour="tour-mobile-notifications"
                      onClick={() => {
                        handleNavigateToNotifications();
                        setMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3 p-3 text-white hover:bg-white/10 rounded-xl transition-colors relative"
                    >
                      <Icon icon="ph:bell" className="w-5 h-5" />
                      <span className="font-medium">Notifications</span>
                      {/* unread count van */}
                      {unreadCount > 0 && (
                        <span className="absolute right-3 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                          {unreadCount > 9 ? "9+" : unreadCount}
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

      <Modal
        isOpen={logoutConfirmOpen}
        onClose={() => {
          if (!logoutSubmitting) setLogoutConfirmOpen(false);
        }}
        title="Confirm Logout"
        message="Are you sure you want to log out from your account?"
        modalType="warning"
        variant="dialog"
        closeTimer={0}
        confirmText="Logout"
        submittingText="Signing out..."
        handleCancel={() => setLogoutConfirmOpen(false)}
        handleConfirm={handleLogoutConfirm}
        isSubmitting={logoutSubmitting}
      />
    </>
  );
};

export default Header;
