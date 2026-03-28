import { useState, useRef, useEffect } from "react";
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";
import icaneLogo from "../../assets/images/smartcane-logo.png";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function Header() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [profileImageUrl, setProfileImageUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef(null);
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
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    setDropdownOpen(false);
    navigate("/");
  };

  const handleProfile = () => {
    setDropdownOpen(false);
    navigate("/profile");
  };

  return (
    <header className="w-full h-[var(--header-height)] bg-primary-100 flex items-center justify-between px-6 lg:px-8 sticky top-0 z-50 shadow-sm">
      -

      {/* Right – Actions */}
      <div className="flex items-center gap-3 lg:gap-4">
        {/* Notification bell (placeholder) */}
        <button
          className="relative p-2 text-white hover:bg-white/10 rounded-full transition-colors"
          aria-label="Notifications"
        >
          <Icon icon="ph:bell" className="w-6 h-6" />
        </button>

        {/* Profile dropdown */}
        <div className="relative" ref={dropdownRef}>
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
            <div className="absolute right-0 top-12 w-56 animate-slideDown z-20">
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