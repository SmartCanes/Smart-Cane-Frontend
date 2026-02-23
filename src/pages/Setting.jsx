import { useState } from "react";
import { Icon } from "@iconify/react";
import BluetoothManager from "@/ui/components/BluetoothManager";

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

  const toggleNotification = (key) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const togglePrivacy = (key) => {
    setPrivacy((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <main className="bg-white md:bg-[#f9fafb] rounded-t-[32px] md:rounded-none min-h-[calc(100vh-var(--header-height)-var(--mobile-nav-height))] md:min-h-[calc(100vh-var(--header-height))] md:max-h-[calc(100vh-var(--header-height))] overflow-y-visible md:overflow-y-auto p-6 pb-[calc(var(--mobile-nav-height)+1.5rem)] md:pb-6">
      <div className="w-full max-w-3xl sm:max-w-full mx-auto space-y-6 md:space-y-8  md:mx-0 md:pr-6 ">
        <h2 className="text-2xl font-bold text-[#11285A] mb-1">Settings</h2>
        <p className="text-gray-500 text-sm">
          Manage your application preferences
        </p>

        <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 overflow-hidden">
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

      <BluetoothManager />
    </main>
  );
};

export default Setting;
