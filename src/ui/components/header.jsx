import { useState, useRef, useEffect, useCallback } from "react";
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";
import api from "../../api/client";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

export default function Header({ onMenuClick }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifLoading, setNotifLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [profileImageUrl, setProfileImageUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const profileDropdownRef = useRef(null);
  const notifDropdownRef = useRef(null);
  const navigate = useNavigate();

  const firstName = localStorage.getItem("first_name") || "Admin";
  const lastName = localStorage.getItem("last_name") || "";
  const initials = [firstName, lastName]
    .filter(Boolean)
    .map((n) => n[0].toUpperCase())
    .join("");

  // Function to fetch profile from backend
  const fetchProfile = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/admin/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 401) {
        // Unauthorized – clear storage and redirect
        localStorage.clear();
        navigate("/login");
        return;
      }

      if (!res.ok) throw new Error("Failed to fetch profile");

      const data = await res.json();
      setProfileImageUrl(data.profile_image_url);
      // Store the image URL in localStorage for quick access
      localStorage.setItem("profile_image_url", data.profile_image_url || "");
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch profile on mount
  useEffect(() => {
    fetchProfile();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchNotifications = useCallback(async () => {
    setNotifLoading(true);
    try {
      const res = await api.get("/api/notifications?limit=20");
      if (res && res.ok) {
        setNotifications(res.data.items || []);
        setUnreadCount(res.data.unread_count || 0);
      }
    } finally {
      setNotifLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const id = setInterval(fetchNotifications, 30000);
    return () => clearInterval(id);
  }, [fetchNotifications]);

  // Listen for profile-updated event (e.g., after image upload/removal)
  useEffect(() => {
    const handleProfileUpdate = () => {
      // Re-fetch to get the latest image URL
      fetchProfile();
    };

    window.addEventListener("profile-updated", handleProfileUpdate);
    return () => window.removeEventListener("profile-updated", handleProfileUpdate);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (notifDropdownRef.current && !notifDropdownRef.current.contains(event.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const onUpdate = () => fetchNotifications();
    window.addEventListener("notifications-updated", onUpdate);
    return () => window.removeEventListener("notifications-updated", onUpdate);
  }, [fetchNotifications]);

  const handleLogout = () => {
    localStorage.clear();
    setDropdownOpen(false);
    setNotifOpen(false);
    navigate("/login", { replace: true });
  };

  const handleProfile = () => {
    setDropdownOpen(false);
    navigate("/profile");
  };

  const markReadAndGo = async (n) => {
    try {
      if (!n.is_read) {
        await api.patch(`/api/notifications/${n.notification_id}/read`, {});
      }
    } finally {
      setNotifOpen(false);
      fetchNotifications();
      if (n.link_path) navigate(n.link_path);
    }
  };

  const markAllRead = async () => {
    await api.patch("/api/notifications/read-all", {});
    fetchNotifications();
  };

  const notifIcon = (type) => {
    if (type === "guardian_concern") return "ph:warning-circle";
    if (type === "admin_created") return "ph:user-plus";
    if (type === "admin_setup_completed") return "ph:check-circle";
    return "ph:bell";
  };

  const timeAgo = (iso) => {
    if (!iso) return "";
    const normalized = /([zZ]|[+-]\d{2}:\d{2})$/.test(iso) ? iso : `${iso}Z`;
    const d = new Date(normalized);
    if (Number.isNaN(d.getTime())) return "";
    const ms = Date.now() - d.getTime();
    const s = Math.floor(ms / 1000);
    if (s < 60) return "just now";
    const m = Math.floor(s / 60);
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    const days = Math.floor(h / 24);
    return `${days}d ago`;
  };

  return (
    <header className="w-full h-[var(--header-height)] bg-primary-100 flex items-center justify-between px-4 sm:px-6 lg:px-8 sticky top-0 z-50 shadow-sm">
      <div className="flex items-center gap-2 text-white font-semibold tracking-wide">
        <button
          type="button"
          onClick={onMenuClick}
          className="lg:hidden inline-flex items-center justify-center p-2 rounded-lg hover:bg-white/10"
          aria-label="Open menu"
        >
          <Icon icon="ph:list" className="w-6 h-6" />
        </button>
        <span className="text-sm sm:text-base">Admin Panel</span>
      </div>

      {/* Right – Actions */}
      <div className="flex items-center gap-3 lg:gap-4">
        {/* Notifications */}
        <div className="relative" ref={notifDropdownRef}>
          <button
            onClick={() => {
              setNotifOpen((p) => !p);
              fetchNotifications();
            }}
            className="relative p-2 text-white hover:bg-white/10 rounded-full transition-colors"
            aria-label="Notifications"
          >
            <Icon icon="ph:bell" className="w-6 h-6" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[11px] font-bold flex items-center justify-center ring-2 ring-primary-100">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="fixed left-2 right-2 top-[calc(var(--header-height)+0.5rem)] sm:absolute sm:left-auto sm:right-0 sm:top-12 sm:w-[min(92vw,380px)] animate-slideDown z-30">
              <div className="relative bg-white rounded-2xl shadow-lg ring-1 ring-black/5 overflow-hidden">
                <div className="hidden sm:block absolute -top-3 right-3 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-b-[12px] border-b-white" />

                <div className="px-4 sm:px-5 py-3.5 sm:py-4 border-b border-gray-100 flex items-center justify-between gap-3">
                  <div className="font-semibold text-gray-800 text-sm sm:text-base">Notifications</div>
                  <button
                    onClick={markAllRead}
                    className="text-[11px] sm:text-xs font-semibold text-primary-100 hover:opacity-80 whitespace-nowrap"
                    disabled={unreadCount === 0}
                  >
                    Mark all read
                  </button>
                </div>

                <div className="max-h-[min(68vh,460px)] overflow-y-auto">
                  {notifLoading ? (
                    <div className="p-4 sm:p-5 text-sm text-gray-500">Loading...</div>
                  ) : notifications.length === 0 ? (
                    <div className="p-6 sm:p-8 text-center text-sm text-gray-500">
                      No notifications yet.
                    </div>
                  ) : (
                    <div className="py-2">
                      {notifications.map((n) => (
                        <button
                          key={n.notification_id}
                          onClick={() => markReadAndGo(n)}
                          className={`w-full px-4 sm:px-5 py-3 text-left hover:bg-gray-50 transition-colors flex gap-3 ${
                            n.is_read ? "bg-white" : "bg-blue-50/40"
                          }`}
                        >
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                            n.is_read ? "bg-gray-100 text-gray-700" : "bg-primary-100/10 text-primary-100"
                          }`}>
                            <Icon icon={notifIcon(n.type)} className="w-5 h-5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 sm:gap-3">
                              <div className={`text-sm font-semibold leading-snug break-words sm:line-clamp-2 ${n.is_read ? "text-gray-800" : "text-[#0f2a55]"}`}>
                                {n.title}
                              </div>
                              <div className="text-[11px] text-gray-400 whitespace-nowrap sm:pt-0.5">
                                {timeAgo(n.created_at)}
                              </div>
                            </div>
                            {n.body && (
                              <div className="text-xs text-gray-600 mt-1 line-clamp-3 sm:line-clamp-2 break-words">
                                {n.body}
                              </div>
                            )}
                            {!n.is_read && (
                              <div className="mt-1">
                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary-100">
                                  <span className="w-1.5 h-1.5 rounded-full bg-primary-100" />
                                  New
                                </span>
                              </div>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Profile dropdown */}
        <div className="relative" ref={profileDropdownRef}>
          <button
            onClick={() => setDropdownOpen((prev) => !prev)}
            className="flex items-center gap-2 p-1.5 rounded-full hover:bg-white/10 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white font-medium text-sm overflow-hidden">
              {profileImageUrl ? (
                <img
                  src={profileImageUrl}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                initials
              )}
            </div>
           {/* <span className="text-white text-sm font-medium hidden sm:inline">
            {firstName}
          </span> */}
            <Icon
              icon="ph:caret-down"
              className="w-4 h-4 text-white/80 hidden sm:block"
            />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-12 w-[min(88vw,14rem)] animate-slideDown z-20">
              <div className="relative bg-white rounded-2xl shadow-lg ring-1 ring-black/5">
                <div className="absolute -top-3 right-3 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-b-[12px] border-b-white" />
                <div className="py-2">
                  <div className="px-5 py-3 border-b border-gray-100">
                    <div className="font-medium text-gray-800">
                      {[firstName, lastName].filter(Boolean).join(" ")}
                    </div>
                  </div>
                  <button
                    onClick={handleProfile}
                    className="w-full flex items-center gap-3 px-5 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Icon icon="ph:user" className="w-4 h-4" />
                    Profile
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-5 py-3 text-left text-sm text-red-600 hover:bg-red-50 transition-colors"
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
    </header>
  );
}