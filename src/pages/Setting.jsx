import { useState } from "react";
import { Icon } from "@iconify/react";
import { useUserStore } from "@/stores/useStore";

const ToggleItem = ({ icon, title, description, checked, onChange }) => (
  <div className="flex items-center justify-between py-4">
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600">
        <Icon icon={icon} className="text-2xl text-[#11285A]" />
      </div>
      <div>
        <h4 className="text-sm font-bold text-[#11285A] font-poppins">
          {title}
        </h4>
        <p className="text-xs text-gray-500 font-poppins mt-0.5">
          {description}
        </p>
      </div>
    </div>
    <button
      onClick={onChange}
      className={`w-12 h-7 rounded-full p-1 transition-colors duration-200 ease-in-out ${
        checked ? "bg-[#11285A]" : "bg-gray-200"
      }`}
    >
      <div
        className={`w-5 h-5 rounded-full bg-white shadow-sm transform transition-transform duration-200 ease-in-out ${
          checked ? "translate-x-5" : "translate-x-0"
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

  const toggleNotification = (key) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const togglePrivacy = (key) => {
    setPrivacy((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <main className="max-h-[calc(100vh-var(--header-height)-var(--mobile-nav-height))] sm:max-h-[calc(100vh-var(--header-height))] overflow-y-auto p-6">
      <div className="w-full font-poppins">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-[#11285A] mb-1">Settings</h2>
          <p className="text-gray-500 text-sm">
            Manage your application preferences
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Notification Preferences */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <div className="mb-8">
              <h3 className="text-lg font-bold text-[#11285A]">
                Notification Preferences
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Choose how you want to be notified
              </p>
            </div>

            <div className="space-y-2">
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
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <div className="mb-8">
              <h3 className="text-lg font-bold text-[#11285A]">
                Privacy & Security
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Control your data and security preferences
              </p>
            </div>

            <div className="space-y-2">
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
