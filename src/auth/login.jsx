import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import TextField from "../ui/components/TextField";
import PasswordField from "../ui/components/PasswordField";
import PrimaryButton from "../ui/components/PrimaryButton";
import icaneLogoWhite from "../assets/images/icane-logo-white.png";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

const STEP_LOGIN = "login";
const STEP_OTP = "otp";
const STEP_CHANGE_CRED = "change_credentials";
const STEP_FORGOT_EMAIL = "forgot_email";
const STEP_FORGOT_OTP = "forgot_otp";
const STEP_FORGOT_RESET = "forgot_reset";

export default function Login() {
  const navigate = useNavigate();
  const [step, setStep] = useState(STEP_LOGIN);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [firstEmail, setFirstEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpError, setOtpError] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const otpRefs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];
  const countdownRef = useRef(null);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotOtp, setForgotOtp] = useState(["", "", "", "", "", ""]);
  const [forgotEmailError, setForgotEmailError] = useState("");
  const [forgotOtpError, setForgotOtpError] = useState("");
  const [forgotOtpLoading, setForgotOtpLoading] = useState(false);
  const [forgotSending, setForgotSending] = useState(false);
  const [forgotCountdown, setForgotCountdown] = useState(0);
  const forgotOtpRefs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];
  const forgotCountdownRef = useRef(null);
  const [resetPassword, setResetPassword] = useState("");
  const [resetError, setResetError] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [changeError, setChangeError] = useState("");
  const [stepLoading, setStepLoading] = useState(false);

  const getHeading = () => "Welcome Admin!";

  const getDescription = () => {
    if (step === STEP_LOGIN) return "Ready to go? Log in and manage the iCane.";
    if (step === STEP_CHANGE_CRED) return "Change your credentials before proceeding to our dashboard.";
    if (step === STEP_FORGOT_EMAIL) return "Enter your email to reset your password.";
    if (step === STEP_FORGOT_OTP) return "Enter the 6-digit code we sent to your email.";
    if (step === STEP_FORGOT_RESET) return "Set a new password for your account.";
    return "";
  };

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
        const otpReq = await requestOtp(data.email);
        if (!otpReq.ok) {
          setErrors({ general: otpReq.message || "Failed to send OTP email. Please try again." });
        }
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

  const requestOtp = async (email) => {
    setIsSending(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/request-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const detail = data?.error ? ` (${data.error})` : "";
        return { ok: false, message: (data?.message || "Failed to send OTP email") + detail };
      }

      startCountdown();
      return { ok: true, message: data?.message || "OTP sent." };
    } catch {
      return { ok: false, message: "Cannot reach the server." };
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

  const requestForgotOtp = async (email) => {
    setForgotSending(true);
    setForgotEmailError("");
    try {
      const res = await fetch(`${API_URL}/api/auth/password-reset/request-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const detail = data?.error ? ` (${data.error})` : "";
        return { ok: false, message: (data?.message || "Failed to send OTP email") + detail };
      }

      setForgotCountdown(60);
      if (forgotCountdownRef.current) clearInterval(forgotCountdownRef.current);
      forgotCountdownRef.current = setInterval(() => {
        setForgotCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(forgotCountdownRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return { ok: true, message: data?.message || "OTP sent." };
    } catch {
      return { ok: false, message: "Cannot reach the server." };
    } finally {
      setForgotSending(false);
    }
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

  const handleForgotOtpChange = (index, value) => {
    if (value.length <= 1 && /^[0-9]*$/.test(value)) {
      const next = [...forgotOtp];
      next[index] = value;
      setForgotOtp(next);
      setForgotOtpError("");
      if (value && index < 5) forgotOtpRefs[index + 1].current?.focus();
    }
  };

  const handleForgotOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !forgotOtp[index] && index > 0)
      forgotOtpRefs[index - 1].current?.focus();
  };

  const handleForgotOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const next = [...forgotOtp];
    pasted.split("").forEach((ch, i) => {
      next[i] = ch;
    });
    setForgotOtp(next);
    forgotOtpRefs[Math.min(pasted.length, 5)].current?.focus();
  };

  const handleForgotVerifyOtp = async () => {
    const code = forgotOtp.join("");
    if (code.length !== 6) {
      setForgotOtpError("Please enter the complete 6-digit code.");
      return;
    }
    setForgotOtpLoading(true);
    setForgotOtpError("");
    try {
      const res = await fetch(`${API_URL}/api/auth/password-reset/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail, otp_code: code }),
      });
      const data = await res.json();
      if (!res.ok) {
        setForgotOtpError(data.message || "Invalid OTP.");
        return;
      }
      setStep(STEP_FORGOT_RESET);
    } catch {
      setForgotOtpError("Cannot reach the server.");
    } finally {
      setForgotOtpLoading(false);
    }
  };

  const handleForgotReset = async () => {
    setResetError("");

    const pwd = resetPassword;
    const hasLower = /[a-z]/.test(pwd);
    const hasUpper = /[A-Z]/.test(pwd);
    const hasNumber = /[0-9]/.test(pwd);
    const hasSpecial = /[!@#$%^&*]/.test(pwd);
    const hasLength = pwd.length >= 8;

    if (!hasLower || !hasUpper) {
      setResetError("Password must contain both lowercase and uppercase letters.");
      return;
    }
    if (!hasNumber) {
      setResetError("Password must contain at least one number.");
      return;
    }
    if (!hasSpecial) {
      setResetError("Password must contain at least one special character (!@#$%^&*).");
      return;
    }
    if (!hasLength) {
      setResetError("Password must be at least 8 characters long.");
      return;
    }

    setResetLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/password-reset/reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: forgotEmail,
          otp_code: forgotOtp.join(""),
          new_password: resetPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setResetError(data.message || "Failed to reset password.");
        return;
      }

      // Reset local forgot states, back to login
      setForgotOtp(["", "", "", "", "", ""]);
      setResetPassword("");
      setStep(STEP_LOGIN);
      setErrors({ general: "Password updated. Please sign in." });
    } catch {
      setResetError("Cannot reach the server.");
    } finally {
      setResetLoading(false);
    }
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
    if (step === STEP_FORGOT_OTP) setTimeout(() => forgotOtpRefs[0].current?.focus(), 100);
  }, [step]);

  useEffect(() => () => {
    if (countdownRef.current) clearInterval(countdownRef.current);
    if (forgotCountdownRef.current) clearInterval(forgotCountdownRef.current);
  }, []);

  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* LEFT COLUMN - Branding (solid background, centered) */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#11285A] items-center justify-center">
        <div className="text-center flex flex-col items-center gap-4 px-10 -mt-12">
          <img
            src={icaneLogoWhite}
            alt="iCane Logo"
            className="w-44 h-44 object-contain"
          />
          <div className="text-white font-bold text-4xl tracking-wide font-gabriela">
            iCane Admin
          </div>
          <p className="text-white/80 text-base max-w-sm leading-relaxed font-poppins">
            Secure access for administrators to manage iCane devices, users, and system activity.
          </p>
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
                    onClick={() => {
                      setForgotEmail("");
                      setForgotOtp(["", "", "", "", "", ""]);
                      setForgotOtpError("");
                      setResetPassword("");
                      setResetError("");
                      setStep(STEP_FORGOT_EMAIL);
                    }}
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

            {step === STEP_FORGOT_EMAIL && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-4"
              >
                <TextField
                  label="Email Address"
                  name="forgot_email"
                  type="email"
                  placeholder="Enter your email..."
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  disabled={forgotSending}
                />
                <PrimaryButton
                  text={forgotSending ? "Sending..." : "Send OTP"}
                  onClick={async () => {
                    if (!forgotEmail.trim()) return;
                    const forgotReq = await requestForgotOtp(forgotEmail.trim());
                    if (!forgotReq.ok) {
                      setForgotEmailError(forgotReq.message || "Failed to send OTP email.");
                      return;
                    }
                    setStep(STEP_FORGOT_OTP);
                  }}
                  disabled={forgotSending || !forgotEmail.trim()}
                  className="w-full py-3 sm:py-4 text-base sm:text-[18px] font-medium"
                />
                {forgotEmailError && (
                  <p className="font-poppins text-center text-[#CE4B34] text-sm">
                    {forgotEmailError}
                  </p>
                )}
                <PrimaryButton
                  text="Back to login"
                  variant="outline"
                  onClick={() => setStep(STEP_LOGIN)}
                  disabled={forgotSending}
                  className="w-full py-3 text-base"
                />
              </motion.div>
            )}

            {step === STEP_FORGOT_OTP && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="flex flex-col gap-5"
              >
                <div className="text-center space-y-1">
                  <p className="font-poppins text-[#1C253C] text-sm">
                    Enter the{" "}
                    <span className="font-bold">6-digit verification code</span> we sent to:
                  </p>
                  <p className="text-sm text-gray-500">{forgotEmail}</p>
                </div>

                <div className="flex justify-center gap-2 lg:gap-3">
                  {forgotOtp.map((digit, i) => (
                    <input
                      key={i}
                      ref={forgotOtpRefs[i]}
                      type="text"
                      maxLength="1"
                      value={digit}
                      inputMode="numeric"
                      onChange={(e) => handleForgotOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleForgotOtpKeyDown(i, e)}
                      onPaste={i === 0 ? handleForgotOtpPaste : undefined}
                      className="w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 lg:w-14 lg:h-14
                        text-center text-xl lg:text-2xl font-bold font-poppins
                        border-2 border-gray-300 rounded-lg
                        focus:border-primary-100 focus:outline-none
                        focus:ring-2 focus:ring-primary-100/20 transition-colors"
                    />
                  ))}
                </div>

                {forgotOtpError && (
                  <p className="text-center text-[#CE4B34] text-sm">{forgotOtpError}</p>
                )}

                <div className="text-center">
                  <p className="font-poppins text-[#1C253C] text-sm mb-1">
                    Didn't receive the code?
                  </p>
                  <button
                    type="button"
                    onClick={async () => {
                      if (forgotSending || forgotCountdown > 0) return;
                      const resend = await requestForgotOtp(forgotEmail);
                      if (!resend.ok) {
                        setForgotOtpError(resend.message || "Failed to send OTP email.");
                      }
                    }}
                    disabled={forgotCountdown > 0 || forgotSending}
                    className={`font-poppins text-primary-100 text-sm font-medium
                      ${
                        forgotCountdown > 0 || forgotSending
                          ? "opacity-50 cursor-not-allowed"
                          : "hover:underline cursor-pointer"
                      }`}
                  >
                    {forgotSending
                      ? "Sending..."
                      : forgotCountdown > 0
                      ? `Resend in ${forgotCountdown}s`
                      : "Resend Verification Code"}
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row-reverse gap-3">
                  <PrimaryButton
                    text={forgotOtpLoading ? "Verifying..." : "Verify"}
                    onClick={handleForgotVerifyOtp}
                    disabled={forgotOtpLoading || forgotOtp.join("").length !== 6}
                    className="w-full py-3 text-base font-medium"
                  />
                  <PrimaryButton
                    text="Back"
                    variant="outline"
                    onClick={() => setStep(STEP_FORGOT_EMAIL)}
                    disabled={forgotOtpLoading}
                    className="w-full py-3 text-base"
                  />
                </div>
              </motion.div>
            )}

            {step === STEP_FORGOT_RESET && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="flex flex-col gap-4"
              >
                <div className="space-y-4">
                  <PasswordField
                    label="New Password"
                    name="reset-password"
                    placeholder="Min. 8 characters..."
                    value={resetPassword}
                    onChange={(e) => setResetPassword(e.target.value)}
                    disabled={resetLoading}
                    showValidationRules={true}
                  />
                  {resetError && (
                    <p className="font-poppins text-center text-[#CE4B34] text-sm">
                      {resetError}
                    </p>
                  )}
                  <PrimaryButton
                    text={resetLoading ? "Saving..." : "Update Password"}
                    onClick={handleForgotReset}
                    disabled={resetLoading}
                    className="w-full py-3 sm:py-4 text-base sm:text-[18px] font-medium mt-2"
                  />
                  <PrimaryButton
                    text="Back"
                    variant="outline"
                    onClick={() => setStep(STEP_FORGOT_OTP)}
                    disabled={resetLoading}
                    className="w-full py-3 text-base"
                  />
                </div>
              </motion.div>
            )}

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
                    onClick={async () => {
                      if (isSending || countdown > 0) return;
                      const resend = await requestOtp(firstEmail);
                      if (!resend.ok) setOtpError(resend.message || "Failed to send OTP email.");
                    }}
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