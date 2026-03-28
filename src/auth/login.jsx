import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import TextField from "../ui/components/TextField";
import PasswordField from "../ui/components/PasswordField";
import PrimaryButton from "../ui/components/PrimaryButton";
import icaneLogoWhite from "../assets/images/icane-logo-white.png";
import icaneLabel from "../assets/images/icane-label.png";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const STEP_LOGIN = "login";
const STEP_OTP = "otp";
const STEP_CHANGE_CRED = "change_credentials";

export default function Login() {
  const navigate = useNavigate();

  // Step
  const [step, setStep] = useState(STEP_LOGIN);

  // Login form
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // OTP step
  const [firstEmail, setFirstEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpError, setOtpError] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const otpRefs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];
  const countdownRef = useRef(null);

  // Change credentials step
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [changeError, setChangeError] = useState("");
  const [stepLoading, setStepLoading] = useState(false);

  // ── Helper for dynamic heading/description ────────────────────────────────
  const getHeading = () => "Welcome Admin!";

  const getDescription = () => {
    if (step === STEP_LOGIN) return "Ready to go? Log in and manage the iCane.";
    if (step === STEP_CHANGE_CRED) return "Change your credentials before proceeding to our dashboard.";
    return "";
  };

  // ── Login ──────────────────────────────────────────────────────────────────
  const handleLogin = async (e) => {
    e?.preventDefault();
    const newErrors = {};
    if (!identifier.trim()) newErrors.identifier = "Email or Username is required";
    if (!password) newErrors.password = "Password is required";
    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrors({ general: data.message || "Login failed." });
        return;
      }

      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("admin_id", data.admin_id);
      localStorage.setItem("role", data.role);
      localStorage.setItem("first_name", data.first_name);
      localStorage.setItem("last_name", data.last_name);

      if (data.is_first_login) {
        setFirstEmail(data.email);
        await requestOtp(data.email);
        setStep(STEP_OTP);
        return;
      }
      navigate("/dashboard");
    } catch {
      setErrors({ general: "Cannot reach the server." });
    } finally {
      setLoading(false);
    }
  };

  // ── OTP helpers ───────────────────────────────────────────────────────────
  const requestOtp = async (email) => {
    setIsSending(true);
    try {
      await fetch(`${API_URL}/api/admin/request-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      startCountdown();
    } finally {
      setIsSending(false);
    }
  };

  const startCountdown = () => {
    setCountdown(60);
    if (countdownRef.current) clearInterval(countdownRef.current);
    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleOtpChange = (index, value) => {
    if (value.length <= 1 && /^[0-9]*$/.test(value)) {
      const next = [...otp];
      next[index] = value;
      setOtp(next);
      setOtpError("");
      if (value && index < 5) otpRefs[index + 1].current?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0)
      otpRefs[index - 1].current?.focus();
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const next = [...otp];
    pasted.split("").forEach((ch, i) => {
      next[i] = ch;
    });
    setOtp(next);
    otpRefs[Math.min(pasted.length, 5)].current?.focus();
  };

  const handleVerifyOtp = async () => {
    const code = otp.join("");
    if (code.length !== 6) {
      setOtpError("Please enter the complete 6-digit code.");
      return;
    }
    setOtpLoading(true);
    setOtpError("");
    try {
      const res = await fetch(`${API_URL}/api/admin/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: firstEmail, otp_code: code }),
      });
      const data = await res.json();
      if (!res.ok) {
        setOtpError(data.message || "Invalid OTP.");
        return;
      }
      setStep(STEP_CHANGE_CRED);
    } catch {
      setOtpError("Cannot reach the server.");
    } finally {
      setOtpLoading(false);
    }
  };

  // ── Change credentials ─────────────────────────────────────────────────────
  const handleChangeCredentials = async () => {
    setChangeError("");

    // Username validation
    if (!newUsername.trim()) {
      setChangeError("Username is required.");
      return;
    }

    // Password validation – match the rules shown in PasswordField
    const pwd = newPassword;
    const hasLower = /[a-z]/.test(pwd);
    const hasUpper = /[A-Z]/.test(pwd);
    const hasNumber = /[0-9]/.test(pwd);
    const hasSpecial = /[!@#$%^&*]/.test(pwd);
    const hasLength = pwd.length >= 8;

    if (!hasLower || !hasUpper) {
      setChangeError("Password must contain both lowercase and uppercase letters.");
      return;
    }
    if (!hasNumber) {
      setChangeError("Password must contain at least one number.");
      return;
    }
    if (!hasSpecial) {
      setChangeError("Password must contain at least one special character (!@#$%^&*).");
      return;
    }
    if (!hasLength) {
      setChangeError("Password must be at least 8 characters long.");
      return;
    }

    setStepLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/change-credentials`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: firstEmail,
          new_username: newUsername,
          new_password: newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setChangeError(data.message || "Failed to update credentials.");
        return;
      }
      localStorage.setItem("username", newUsername);
      navigate("/dashboard");
    } catch {
      setChangeError("Cannot reach the server.");
    } finally {
      setStepLoading(false);
    }
  };

  useEffect(() => {
    if (step === STEP_OTP) setTimeout(() => otpRefs[0].current?.focus(), 100);
  }, [step]);

  useEffect(() => () => {
    if (countdownRef.current) clearInterval(countdownRef.current);
  }, []);

  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* LEFT COLUMN - Branding with centered large logo */}
      <div className="hidden lg:block lg:w-1/2 relative bg-[#11285A]">
        {/* Large semi-transparent logo (centered) */}
        <div className="absolute inset-0 flex items-center justify-center">
          <img
            src={icaneLogoWhite}
            alt="iCane Logo"
            className="w-[70%] max-w-md opacity-30"
          />
        </div>

        {/* Content container (small logo, label, description) - positioned above the large logo */}
        <div className="absolute top-[30%] left-1/2 transform -translate-x-1/2 text-center">
          <div className="flex flex-col items-center gap-4">
            {/* Small logo */}
            <img
              src={icaneLogoWhite}
              alt="iCane Logo"
              className="w-16 h-16 object-contain"
            />
            {/* Label image */}
            <img
              src={icaneLabel}
              alt="iCane"
              className="w-48 object-contain"
            />
            {/* Description */}
            <p className="text-white text-sm max-w-xs mt-2 font-poppins">
              Secure access for administrators to manage iCane devices and monitor users.
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN - Branding + Login Form */}
      <div className="flex-1 lg:w-1/2 bg-[#FDFCFA] overflow-y-auto scrollbar-hide">
        <div className="min-h-full flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="w-full max-w-md">
            {/* Dynamic heading and description */}
            <div className="text-center mb-10">
              <h1 className="text-4xl md:text-5xl font-bold text-primary-100 mb-3 font-poppins">
                {getHeading()}
              </h1>
              <p className="text-lg text-gray-600 mb-2 font-poppins">
                {getDescription()}
              </p>
            </div>

            {/* ── STEP: LOGIN ───────────────────────────────────────────────── */}
            {step === STEP_LOGIN && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.4,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                {errors.general && (
                  <p className="font-poppins text-center text-[#CE4B34] mb-4 text-sm">
                    {errors.general}
                  </p>
                )}
                <div className="space-y-4">
                  <TextField
                    label="Username or Email"
                    name="identifier"
                    placeholder="Enter your username or email..."
                    value={identifier}
                    onChange={(e) => {
                      setIdentifier(e.target.value);
                      setErrors((p) => ({ ...p, identifier: "", general: "" }));
                    }}
                    error={errors.identifier}
                    maxLength={50}
                    disabled={loading}
                  />
                  <PasswordField
                    label="Password"
                    name="password"
                    placeholder="Enter your password..."
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setErrors((p) => ({ ...p, password: "", general: "" }));
                    }}
                    error={errors.password}
                    maxLength={20}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="font-poppins block text-left hover:underline text-[16px] underline mt-2 w-fit text-[#1C253C]"
                  >
                    Forgot password?
                  </button>
                  <PrimaryButton
                    text={loading ? "Signing in..." : "Sign In"}
                    onClick={handleLogin}
                    disabled={loading}
                    className="w-full py-3 sm:py-4 text-base sm:text-[18px] font-medium mt-5 sm:mt-6"
                  />
                </div>
              </motion.div>
            )}

            {/* ── STEP: OTP ─────────────────────────────────────────────────── */}
            {step === STEP_OTP && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="flex flex-col gap-5"
              >
                <div className="text-center space-y-1">
                  <p className="font-poppins text-[#1C253C] text-sm">
                    Enter the{" "}
                    <span className="font-bold">6-digit verification code</span> we
                    sent to your email address.
                  </p>
                  <p className="text-sm text-gray-500">{firstEmail}</p>
                </div>

                {/* OTP inputs */}
                <div className="flex justify-center gap-2 lg:gap-3">
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      ref={otpRefs[i]}
                      type="text"
                      maxLength="1"
                      value={digit}
                      inputMode="numeric"
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      onPaste={i === 0 ? handleOtpPaste : undefined}
                      className="w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 lg:w-14 lg:h-14
                        text-center text-xl lg:text-2xl font-bold font-poppins
                        border-2 border-gray-300 rounded-lg
                        focus:border-primary-100 focus:outline-none
                        focus:ring-2 focus:ring-primary-100/20 transition-colors"
                    />
                  ))}
                </div>

                {otpError && (
                  <p className="text-center text-[#CE4B34] text-sm">{otpError}</p>
                )}

                <div className="text-center">
                  <p className="font-poppins text-[#1C253C] text-sm mb-1">
                    Didn't receive the code?
                  </p>
                  <button
                    type="button"
                    onClick={() => !isSending && countdown === 0 && requestOtp(firstEmail)}
                    disabled={countdown > 0 || isSending}
                    className={`font-poppins text-primary-100 text-sm font-medium
                      ${
                        countdown > 0 || isSending
                          ? "opacity-50 cursor-not-allowed"
                          : "hover:underline cursor-pointer"
                      }`}
                  >
                    {isSending
                      ? "Sending..."
                      : countdown > 0
                      ? `Resend in ${countdown}s`
                      : "Resend Verification Code"}
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row-reverse gap-3">
                  <PrimaryButton
                    text={otpLoading ? "Verifying..." : "Verify"}
                    onClick={handleVerifyOtp}
                    disabled={otpLoading || otp.join("").length !== 6}
                    className="w-full py-3 text-base font-medium"
                  />
                  <PrimaryButton
                    text="Cancel"
                    variant="outline"
                    onClick={() => setStep(STEP_LOGIN)}
                    disabled={otpLoading}
                    className="w-full py-3 text-base"
                  />
                </div>
              </motion.div>
            )}

            {/* ── STEP: CHANGE CREDENTIALS ──────────────────────────────────── */}
            {step === STEP_CHANGE_CRED && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="flex flex-col gap-4"
              >
                <div className="text-center space-y-1">
                  <p className="font-poppins text-[#1C253C] text-sm">
                    Choose a new username and password for your account.
                  </p>
                </div>

                <div className="space-y-4">
                  <TextField
                    label="New Username"
                    name="new-username"
                    placeholder="Choose a username..."
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    disabled={stepLoading}
                  />
                  <PasswordField
                    label="New Password"
                    name="new-password"
                    placeholder="Min. 8 characters..."
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    disabled={stepLoading}
                    showValidationRules={true}
                  />
                  {changeError && (
                    <p className="font-poppins text-center text-[#CE4B34] text-sm">
                      {changeError}
                    </p>
                  )}
                  <PrimaryButton
                    text={stepLoading ? "Saving..." : "Save & Continue"}
                    onClick={handleChangeCredentials}
                    disabled={stepLoading}
                    className="w-full py-3 sm:py-4 text-base sm:text-[18px] font-medium mt-2"
                  />
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}