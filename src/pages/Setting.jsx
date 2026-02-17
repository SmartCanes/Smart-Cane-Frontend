import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import BluetoothManager from "@/ui/components/BluetoothManager";
import { changePasswordApi, logoutApi } from "@/api/authService";
import { useNavigate } from "react-router-dom";

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
      className={`relative inline-flex items-center h-6 w-11 sm:h-7 sm:w-12 rounded-full flex-shrink-0 transition-colors duration-200 ease-in-out focus:outline-none cursor-pointer ${
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

const PasswordRequirement = ({ label, isValid, isChecking }) => {
  return (
    <div className="flex items-center gap-2">
      {isChecking ? (
        <Icon icon="eos-icons:loading" className="text-blue-500 text-sm" />
      ) : isValid ? (
        <Icon icon="mdi:check-circle" className="text-green-500 text-sm" />
      ) : (
        <Icon icon="mdi:close-circle" className="text-red-500 text-sm" />
      )}
      <span
        className={`text-xs ${isValid ? "text-gray-700" : "text-gray-500"}`}
      >
        {label}
      </span>
    </div>
  );
};

const PasswordInput = ({
  value,
  onChange,
  placeholder,
const PasswordInput = ({ 
  value, 
  onChange, 
  placeholder, 
  label,
  error,
  success,
  showPassword,
  onTogglePassword,
  className = "",
  disabled = false
}) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={onChange}
          className={`w-full px-4 py-3 pr-12 rounded-xl border focus:ring-2 outline-none transition-all ${className} ${
            disabled ? "bg-gray-50 cursor-not-allowed opacity-70" : ""
          }`}
          placeholder={placeholder}
          required
          disabled={disabled}
        />
        <button
          type="button"
          onClick={onTogglePassword}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
          disabled={disabled}
        >
          <Icon
            icon={showPassword ? "mdi:eye-off" : "mdi:eye"}
            className="text-xl text-gray-500 hover:text-gray-700"
          />
        </button>
      </div>
      {error && (
        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
          <Icon icon="mdi:alert-circle" className="text-sm" />
          {error}
        </p>
      )}
      {success && (
        <p className="text-green-500 text-xs mt-1 flex items-center gap-1">
          <Icon icon="mdi:check-circle" className="text-sm" />
          {success}
        </p>
      )}
    </div>
  );
};

const ChangePasswordModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordRequirements, setPasswordRequirements] = useState({
    hasLowercase: false,
    hasUppercase: false,
    hasNumber: false,
    hasSpecialChar: false,
    hasMinLength: false
  });
  const [isChecking, setIsChecking] = useState(false);
  const [showRequirements, setShowRequirements] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [logoutMessage, setLogoutMessage] = useState("");

  useEffect(() => {
    if (newPassword) {
      setIsChecking(true);
      setShowRequirements(true);
      const timeout = setTimeout(() => {
        setPasswordRequirements({
          hasLowercase: /[a-z]/.test(newPassword),
          hasUppercase: /[A-Z]/.test(newPassword),
          hasNumber: /[0-9]/.test(newPassword),
          hasSpecialChar: /[!@#$%^&*]/.test(newPassword),
          hasMinLength: newPassword.length >= 8
        });
        setIsChecking(false);
      }, 200);
      return () => clearTimeout(timeout);
    } else {
      setPasswordRequirements({
        hasLowercase: false,
        hasUppercase: false,
        hasNumber: false,
        hasSpecialChar: false,
        hasMinLength: false
      });
    }
  }, [newPassword]);

  const allRequirementsMet = Object.values(passwordRequirements).every(Boolean);
  const passwordsMatch =
    newPassword === confirmPassword && confirmPassword !== "";
  const confirmPasswordError = confirmPassword && !passwordsMatch;

  const handleLogout = async () => {
    try {
      await logoutApi();
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      navigate("/login");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    if (!allRequirementsMet) {
      setErrorMessage("Please meet all password requirements!");
      return;
    }
    if (!passwordsMatch) {
      setErrorMessage("Passwords do not match!");
      return;
    }
    if (currentPassword === newPassword) {
      setErrorMessage("New password cannot be the same as current password!");
      return;
    }

    setIsSubmitting(true);

    try {
      console.log("Sending password change request...");

      const response = await changePasswordApi(
        currentPassword,
        newPassword,
        confirmPassword
      );

      console.log("Change password response:", response);

      setLogoutMessage("Password changed successfully! Logging you out...");
      setShowSuccessModal(true);

      setTimeout(async () => {
        await handleLogout();
      }, 2000);
    } catch (error) {
      console.error("Password change error details:", error);

      if (error.response) {
        setErrorMessage(
          error.response?.data?.message ||
            error.message ||
            "Failed to change password"
        );
      } else if (error.request) {
        setErrorMessage("Network error. Please check your connection.");
      } else {
        setErrorMessage(
          error.message || "An error occurred. Please try again."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setErrorMessage("");
    setShowRequirements(false);
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  };

  const handleClose = () => {
    if (!isSubmitting) {
      resetForm();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {showSuccessModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon
                icon="mdi:check-circle"
                className="text-4xl text-green-600"
              />
            </div>
            <h3 className="text-xl font-bold text-[#11285A] mb-2">Success!</h3>
            <p className="text-gray-600">{logoutMessage}</p>
            <div className="mt-4 flex justify-center">
              <Icon
                icon="eos-icons:loading"
                className="text-2xl text-[#11285A]"
              />
            </div>
          </div>
        </div>
      )}

      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-200 cursor-pointer"
        onClick={handleClose}
      />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-white rounded-2xl shadow-xl w-full max-w-md transform transition-all duration-200 scale-100 opacity-100"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6 sm:p-8">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-bold text-[#11285A]">
                  Change Password
                </h3>
                <button
                  onClick={handleClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
                  disabled={isSubmitting}
                >
                  <Icon icon="mdi:close" className="text-xl text-gray-500" />
                </button>
              </div>
              <p className="text-sm text-gray-500">
                Enter your current and new password
              </p>
            </div>

            {errorMessage && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-red-600 text-sm flex items-center gap-2">
                  <Icon icon="mdi:alert-circle" className="text-lg" />
                  {errorMessage}
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <PasswordInput
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                label="Current Password"
                showPassword={showCurrentPassword}
                onTogglePassword={() =>
                  setShowCurrentPassword(!showCurrentPassword)
                }
                className="border-gray-300 focus:border-[#11285A] focus:ring-[#11285A]/20"
                disabled={isSubmitting}
              />

              <PasswordInput
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                label="New Password"
                showPassword={showNewPassword}
                onTogglePassword={() => setShowNewPassword(!showNewPassword)}
                className={
                  newPassword && !allRequirementsMet
                    ? "border-red-300 focus:border-red-400 focus:ring-red-200"
                    : newPassword && allRequirementsMet
                      ? "border-green-300 focus:border-green-400 focus:ring-green-200"
                      : "border-gray-300 focus:border-[#11285A] focus:ring-[#11285A]/20"
                }
                disabled={isSubmitting}
              />

              {showRequirements && (
                <div className="bg-blue-50 p-4 rounded-xl">
                  <p className="text-sm font-medium text-[#11285A] mb-3">
                    Password requirements:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <PasswordRequirement
                      label="Lowercase (a-z)"
                      isValid={passwordRequirements.hasLowercase}
                      isChecking={isChecking && newPassword !== ""}
                    />
                    <PasswordRequirement
                      label="Uppercase (A-Z)"
                      isValid={passwordRequirements.hasUppercase}
                      isChecking={isChecking && newPassword !== ""}
                    />
                    <PasswordRequirement
                      label="Number (0-9)"
                      isValid={passwordRequirements.hasNumber}
                      isChecking={isChecking && newPassword !== ""}
                    />
                    <PasswordRequirement
                      label="Special Character (!@#$%^&*)"
                      isValid={passwordRequirements.hasSpecialChar}
                      isChecking={isChecking && newPassword !== ""}
                    />
                    <PasswordRequirement
                      label="At least 8 Characters"
                      isValid={passwordRequirements.hasMinLength}
                      isChecking={isChecking && newPassword !== ""}
                    />
                  </div>
                  {newPassword && allRequirementsMet && (
                    <div className="mt-3 pt-3 border-t border-blue-200">
                      <p className="text-green-600 text-sm font-medium flex items-center gap-2">
                        <Icon icon="mdi:check-circle" className="text-lg" />
                        All requirements met!
                      </p>
                    </div>
                  )}
                </div>
              )}

              <PasswordInput
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                label="Confirm New Password"
                showPassword={showConfirmPassword}
                onTogglePassword={() =>
                  setShowConfirmPassword(!showConfirmPassword)
                }
                error={confirmPasswordError ? "Passwords do not match" : ""}
                success={passwordsMatch ? "Passwords match" : ""}
                className={
                  confirmPasswordError
                    ? "border-red-300 focus:border-red-400 focus:ring-red-200"
                    : confirmPassword && passwordsMatch
                      ? "border-green-300 focus:border-green-400 focus:ring-green-200"
                      : "border-gray-300 focus:border-[#11285A] focus:ring-[#11285A]/20"
                }
                disabled={isSubmitting}
              />

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-3 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={
                    !allRequirementsMet || !passwordsMatch || isSubmitting
                  }
                  className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    allRequirementsMet && passwordsMatch && !isSubmitting
                      ? "bg-[#11285A] text-white hover:bg-[#0d1f4a] hover:shadow-lg"
                      : "bg-gray-200 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <Icon icon="eos-icons:loading" className="text-lg" />
                      Changing...
                    </>
                  ) : (
                    "Change Password"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

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

  const [isModalOpen, setIsModalOpen] = useState(false);

  const toggleNotification = (key) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const togglePrivacy = (key) => {
    setPrivacy((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <main className="bg-white md:bg-[#f9fafb] rounded-t-[32px] md:rounded-none min-h-[calc(100vh-var(--header-height)-var(--mobile-nav-height))] md:min-h-[calc(100vh-var(--header-height))] md:max-h-[calc(100vh-var(--header-height))] overflow-y-visible md:overflow-y-auto p-6 pb-[calc(var(--mobile-nav-height)+1.5rem)] md:pb-6">
        <div className="w-full max-w-3xl sm:max-w-full mx-auto space-y-6 md:space-y-8  md:mx-0 md:pr-6 ">
          <h2 className="text-2xl font-bold text-[#11285A] mb-1">Settings</h2>
          <p className="text-gray-500 text-sm">
            Manage your application preferences
          </p>

          <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 overflow-hidden">
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
                <button
                  onClick={openModal}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl border border-[#11285A] text-[#11285A] font-semibold text-sm hover:bg-blue-50 hover:border-[#0d1f4a] transition-all cursor-pointer"
                >
                  <Icon icon="mage:key-fill" className="text-lg" />
                  Change Password
                </button>
              </div>
            </div>
          </div>
        </div>

        <BluetoothManager />
        <ChangePasswordModal isOpen={isModalOpen} onClose={closeModal} />
      </main>
    </>
  );
};

export default Setting;