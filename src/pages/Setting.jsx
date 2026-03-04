import { useState, useEffect, useRef } from "react";
import { Icon } from "@iconify/react";
import BluetoothManager from "@/ui/components/BluetoothManager";
import { changePasswordApi, logoutApi } from "@/api/authService";
import { useNavigate } from "react-router-dom";
import Modal from "@/ui/components/Modal";
import {
  useActivityReportsStore,
  useDevicesStore,
  useGuardiansStore,
  useRealtimeStore,
  useRouteStore,
  useUIStore,
  useUserStore
} from "@/stores/useStore";

// src/ui/utils/logoutModal.js
function showLogoutModal(message = "Logging out...") {
  if (document.getElementById("logout-modal-overlay")) return () => {};

  const overlay = document.createElement("div");
  overlay.id = "logout-modal-overlay";

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

    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideUp { from { opacity: 0; transform: translateY(20px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
    @keyframes fadeOut { from { opacity: 1; } to { opacity: 0; } }
    @keyframes slideDown { from { opacity: 1; transform: translateY(0) scale(1); } to { opacity: 0; transform: translateY(20px) scale(0.95); } }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    @keyframes progress { 0% { transform: translateX(-100%); } 100% { transform: translateX(200%); } }

    body.logout-modal-open {
      overflow: hidden;
      pointer-events: none;
      user-select: none;
    }
    body.logout-modal-open * { pointer-events: none; }
    body.logout-modal-open #logout-modal-overlay,
    body.logout-modal-open #logout-modal-overlay * { pointer-events: all; }
  `;
  document.head.appendChild(styleEl);

  const backdrop = document.createElement("div");
  backdrop.className = "backdrop";

  const modalContent = document.createElement("div");
  modalContent.className = "modal-content";

  const spinnerContainer = document.createElement("div");
  spinnerContainer.className = "spinner-container";

  const spinner = document.createElement("div");
  spinner.className = "spinner";
  spinnerContainer.appendChild(spinner);

  const messageContainer = document.createElement("div");
  const mainMessage = document.createElement("h3");
  mainMessage.className = "message";
  mainMessage.textContent = message;

  const subMessage = document.createElement("p");
  subMessage.className = "submessage";
  subMessage.textContent = "Please wait while we secure your session...";

  messageContainer.appendChild(mainMessage);
  messageContainer.appendChild(subMessage);

  const progressBar = document.createElement("div");
  progressBar.className = "progress-bar";
  const progressFill = document.createElement("div");
  progressFill.className = "progress-fill";
  progressBar.appendChild(progressFill);

  modalContent.appendChild(spinnerContainer);
  modalContent.appendChild(messageContainer);
  modalContent.appendChild(progressBar);

  overlay.appendChild(backdrop);
  overlay.appendChild(modalContent);

  document.body.appendChild(overlay);
  document.body.classList.add("logout-modal-open");

  return function hideLogoutModal() {
    if (!overlay.parentNode) return;
    backdrop.style.animation = "fadeOut 0.2s ease-out forwards";
    modalContent.style.animation = "slideDown 0.2s ease-out forwards";
    setTimeout(() => {
      overlay.remove();
      styleEl.remove();
      document.body.classList.remove("logout-modal-open");
    }, 200);
  };
}

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
  const { clearUser } = useUserStore();
  const { clearDevices } = useDevicesStore();
  const { clearHistory } = useActivityReportsStore();
  const { clearAllGuardians } = useGuardiansStore();
  const { disconnectWs } = useRealtimeStore();
  const { clearRoute } = useRouteStore();

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

  const isMountedRef = useRef(true);
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!newPassword) {
      setPasswordRequirements({
        hasLowercase: false,
        hasUppercase: false,
        hasNumber: false,
        hasSpecialChar: false,
        hasMinLength: false
      });
      setShowRequirements(false);
      setIsChecking(false);
      return;
    }

    setIsChecking(true);
    setShowRequirements(true);

    const timeoutId = setTimeout(() => {
      if (!isMountedRef.current) return;

      setPasswordRequirements({
        hasLowercase: /[a-z]/.test(newPassword),
        hasUppercase: /[A-Z]/.test(newPassword),
        hasNumber: /[0-9]/.test(newPassword),
        hasSpecialChar: /[!@#$%^&*]/.test(newPassword),
        hasMinLength: newPassword.length >= 8
      });

      setIsChecking(false);
    }, 200);

    return () => clearTimeout(timeoutId);
  }, [newPassword]);

  const allRequirementsMet = Object.values(passwordRequirements).every(Boolean);
  const passwordsMatch =
    newPassword === confirmPassword && confirmPassword !== "";
  const confirmPasswordError = confirmPassword && !passwordsMatch;

  const resetForm = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setErrorMessage("");
    setShowRequirements(false);
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    setIsChecking(false);
    setPasswordRequirements({
      hasLowercase: false,
      hasUppercase: false,
      hasNumber: false,
      hasSpecialChar: false,
      hasMinLength: false
    });
  };

  const handleClose = () => {
    if (isSubmitting) return;
    resetForm();
    onClose();
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
      const changedResponse = await changePasswordApi(
        currentPassword,
        newPassword,
        confirmPassword
      );

      if (changedResponse.success) {
        resetForm();
        onClose();
      }

      const hide = showLogoutModal("Password changed. Logging out...");

      try {
        const response = await logoutApi();
        if (response.success) {
          clearUser();
          clearDevices();
          clearAllGuardians();
          disconnectWs();
          clearRoute();
          clearHistory();
          navigate("/login", { replace: true });
        }
      } finally {
        hide?.();
      }
    } catch (error) {
      if (error?.response) {
        setErrorMessage(
          error.response?.data?.message ||
            error.message ||
            "Failed to change password"
        );
      } else if (error?.request) {
        setErrorMessage("Network error. Please check your connection.");
      } else {
        setErrorMessage(
          error?.message || "An error occurred. Please try again."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Change Password"
      message="Enter your current and new password"
      modalType={errorMessage ? "error" : "info"}
      variant="dialog"
      closeTimer={0}
      isSubmitting={isSubmitting}
      icon="mage:key-fill"
      width="max-w-md"
      footer={
        <div className="flex gap-3 w-full">
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className={`flex-1 px-4 py-2 border rounded-lg transition ${
              isSubmitting
                ? "border-gray-200 text-gray-400 cursor-not-allowed"
                : "border-gray-300 hover:bg-gray-200 cursor-pointer"
            }`}
          >
            Cancel
          </button>

          <button
            type="submit"
            form="change-password-form"
            disabled={!allRequirementsMet || !passwordsMatch || isSubmitting}
            className={`flex-1 px-4 py-2 rounded-lg font-bold text-white transition-colors flex items-center justify-center gap-2 ${
              allRequirementsMet && passwordsMatch && !isSubmitting
                ? "bg-[#11285A] hover:bg-[#0d1f4a] cursor-pointer"
                : "bg-gray-300 cursor-not-allowed"
            }`}
          >
            {isSubmitting ? (
              <>
                <Icon
                  icon="ph:circle-notch-bold"
                  className="w-5 h-5 animate-spin"
                />
                Changing...
              </>
            ) : (
              "Change Password"
            )}
          </button>
        </div>
      }
    >
      <form
        id="change-password-form"
        onSubmit={handleSubmit}
        className="space-y-4"
      >
        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-red-600 text-sm flex items-center gap-2">
              <Icon icon="mdi:alert-circle" className="text-lg" />
              {errorMessage}
            </p>
          </div>
        )}

        <PasswordInput
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          placeholder="Enter current password"
          label="Current Password"
          showPassword={showCurrentPassword}
          onTogglePassword={() => setShowCurrentPassword((v) => !v)}
          className="border-gray-300 focus:border-[#11285A] focus:ring-[#11285A]/20"
          disabled={isSubmitting}
        />

        <PasswordInput
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="Enter new password"
          label="New Password"
          showPassword={showNewPassword}
          onTogglePassword={() => setShowNewPassword((v) => !v)}
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
          onTogglePassword={() => setShowConfirmPassword((v) => !v)}
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
      </form>
    </Modal>
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
