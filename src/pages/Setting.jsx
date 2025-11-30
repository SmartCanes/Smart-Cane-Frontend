import { useState } from "react";
import { Icon } from "@iconify/react";
import { useUserStore } from "@/stores/useStore";
import avatarPlaceholder from "@/assets/images/team-photo.png";
import Toast from "@/ui/components/Toast";

const ToggleItem = ({ icon, title, description, checked, onChange }) => (
  <div className="flex items-start justify-between py-3 gap-3">
    <div className="flex items-start gap-3 flex-1">
      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#F0F4FF] flex items-center justify-center flex-shrink-0">
        <Icon icon={icon} className="text-xl sm:text-2xl text-[#11285A]" />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm sm:text-base font-semibold text-[#1F2937] font-poppins leading-tight">
          {title}
        </h4>
        <p className="text-xs sm:text-sm text-[#6B7280] font-poppins mt-0.5 leading-relaxed">
          {description}
        </p>
      </div>
    </div>
    <button
      onClick={onChange}
      className={`relative inline-flex items-center h-6 w-11 sm:h-7 sm:w-12 rounded-full flex-shrink-0 transition-colors duration-200 ease-in-out focus:outline-none ${
        checked ? "bg-[#11285A]" : "bg-[#E5E7EB]"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 sm:h-5 sm:w-5 transform rounded-full bg-white shadow-md transition-transform duration-200 ease-in-out ${
          checked ? "translate-x-6 sm:translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  </div>
);

const Setting = () => {
  const { connectionStatus } = useUserStore();

  const [notifications, setNotifications] = useState({
    push: true,
    email: true,
    sms: false,
    emergency: true
  });

  const [privacy, setPrivacy] = useState({
    location: true,
    twoFactor: true,
    analytics: false
  });

  const [profile, setProfile] = useState({
    fullName: "Sarah Johnson",
    email: "sarah.johnson@email.com",
    phone: "0912345678",
    birthday: "1985-06-15"
  });

  const [originalProfile, setOriginalProfile] = useState({
    fullName: "Sarah Johnson",
    email: "sarah.johnson@email.com",
    phone: "0912345678",
    birthday: "1985-06-15"
  });

  const [showToast, setShowToast] = useState(false);
  const [toastConfig, setToastConfig] = useState({
    message: "",
    type: "info"
  });
  const [isEditMode, setIsEditMode] = useState(false);

  const toggleNotification = (key) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const togglePrivacy = (key) => {
    setPrivacy((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleProfileChange = ({ target }) => {
    const { name, value } = target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditProfile = () => {
    setIsEditMode(true);
    setToastConfig({ message: "Edit mode activated", type: "info" });
    setShowToast(true);
  };

  const handleSaveProfile = () => {
    setOriginalProfile(profile);
    setIsEditMode(false);
    setToastConfig({ message: "Profile saved successfully", type: "success" });
    setShowToast(true);
  };

  const handleCancelEdit = () => {
    setProfile(originalProfile);
    setIsEditMode(false);
    setToastConfig({ message: "Changes cancelled", type: "warning" });
    setShowToast(true);
  };

  return (
    <main className="bg-white md:bg-[#f9fafb] rounded-t-[32px] md:rounded-none min-h-[calc(100vh-var(--header-height)-var(--mobile-nav-height))] md:min-h-[calc(100vh-var(--header-height))] md:max-h-[calc(100vh-var(--header-height))] overflow-y-visible md:overflow-y-auto p-4 sm:p-6 pb-[calc(var(--mobile-nav-height)+1.5rem)] md:pb-6">
      {showToast && (
        <Toast
          message={toastConfig.message}
          type={toastConfig.type}
          duration={3000}
          position="top-right"
          onClose={() => setShowToast(false)}
        />
      )}
      
      <div className="w-full font-poppins max-w-3xl mx-auto space-y-6 md:space-y-8 md:max-w-5xl md:mx-0 md:pr-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-center gap-4">
              <img
                src={avatarPlaceholder}
                alt={profile.fullName}
                className="w-16 h-16 rounded-full object-cover"
              />
              <div>
                <h3 className="text-lg font-semibold text-[#11285A]">
                  {profile.fullName}
                </h3>
                <p className="text-sm text-gray-500">{profile.email}</p>
              </div>
            </div>

            {!isEditMode ? (
              <button 
                onClick={handleEditProfile}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[#11285A] text-[#11285A] text-sm font-semibold hover:bg-blue-50 transition-colors"
              >
                <Icon icon="solar:pen-bold" className="text-lg" />
                Edit Profile
              </button>
            ) : (
              <div className="flex gap-2">
                <button 
                  onClick={handleSaveProfile}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#11285A] text-white text-sm font-semibold hover:bg-[#0d1b3d] transition-colors"
                >
                  <Icon icon="solar:check-circle-bold" className="text-lg" />
                  Save
                </button>
                <button 
                  onClick={handleCancelEdit}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-300 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-colors"
                >
                  <Icon icon="solar:close-circle-bold" className="text-lg" />
                  Cancel
                </button>
              </div>
            )}
          </div>

          <div className="mt-8 grid md:grid-cols-2 gap-5">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Full Name
              </label>
              <input
                type="text"
                name="fullName"
                value={profile.fullName}
                onChange={handleProfileChange}
                disabled={!isEditMode}
                className={`w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-card-100 focus:border-transparent ${
                  !isEditMode ? "bg-gray-100 cursor-not-allowed" : "bg-gray-50"
                }`}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={profile.email}
                onChange={handleProfileChange}
                disabled={!isEditMode}
                className={`w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-card-100 focus:border-transparent ${
                  !isEditMode ? "bg-gray-100 cursor-not-allowed" : "bg-gray-50"
                }`}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={profile.phone}
                onChange={handleProfileChange}
                disabled={!isEditMode}
                className={`w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-card-100 focus:border-transparent ${
                  !isEditMode ? "bg-gray-100 cursor-not-allowed" : "bg-gray-50"
                }`}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Date of Birth
              </label>
              <input
                type="date"
                name="birthday"
                value={profile.birthday}
                onChange={handleProfileChange}
                disabled={!isEditMode}
                className={`w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-card-100 focus:border-transparent ${
                  !isEditMode ? "bg-gray-100 cursor-not-allowed" : "bg-gray-50"
                }`}
              />
            </div>
          </div>
        </div>

        <div className="mb-4 md:mb-6">
          <h2 className="text-2xl font-bold text-[#11285A] mb-1">Settings</h2>
          <p className="text-gray-500 text-sm">
            Manage your application preferences
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
          {/* Notification Preferences */}
          <div className="bg-white rounded-2xl p-5 sm:p-8 shadow-sm border border-gray-100">
            <div className="mb-6 sm:mb-8">
              <h3 className="text-base sm:text-lg font-bold text-[#11285A]">
                Notification Preferences
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Choose how you want to be notified
              </p>
            </div>

            <div className="space-y-1">
              <ToggleItem
                icon="solar:bell-bold"
                title="Push Notifications"
                description="Receive alerts on your device"
                checked={notifications.push}
                onChange={() => toggleNotification("push")}
              />
              <ToggleItem
                icon="solar:letter-bold"
                title="Email Notifications"
                description="Get updates via email"
                checked={notifications.email}
                onChange={() => toggleNotification("email")}
              />
              <ToggleItem
                icon="solar:chat-round-dots-bold"
                title="SMS Alerts"
                description="Receive text messages for urgent alerts"
                checked={notifications.sms}
                onChange={() => toggleNotification("sms")}
              />
              <ToggleItem
                icon="solar:danger-triangle-bold"
                title="Emergency Alerts"
                description="Critical notifications for safety events"
                checked={notifications.emergency}
                onChange={() => toggleNotification("emergency")}
              />
            </div>
          </div>

          {/* Privacy & Security */}
          <div className="bg-white rounded-2xl p-5 sm:p-8 shadow-sm border border-gray-100">
            <div className="mb-6 sm:mb-8">
              <h3 className="text-base sm:text-lg font-bold text-[#11285A]">
                Privacy & Security
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Control your data and security preferences
              </p>
            </div>

            <div className="space-y-1">
              <ToggleItem
                icon="solar:map-point-bold"
                title="Location Tracking"
                description="Allow guardians to view your location"
                checked={privacy.location}
                onChange={() => togglePrivacy("location")}
              />
              <ToggleItem
                icon="solar:shield-check-bold"
                title="Two-Factor Authentication"
                description="Extra security for your account"
                checked={privacy.twoFactor}
                onChange={() => togglePrivacy("twoFactor")}
              />
              <ToggleItem
                icon="carbon:analytics"
                title="Usage Analytics"
                description="Help improve iCane with usage data"
                checked={privacy.analytics}
                onChange={() => togglePrivacy("analytics")}
              />
            </div>

            <div className="mt-8 pt-6 border-t border-gray-100">
              <button className="flex items-center gap-2 px-5 py-3 rounded-xl border border-[#11285A] text-[#11285A] font-semibold text-sm hover:bg-blue-50 transition-colors">
                <Icon icon="mage:key-fill" className="text-lg" />
                Change Password
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Setting;
