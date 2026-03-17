import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import TextField from "../ui/components/TextField";
import PasswordField from "../ui/components/PasswordField";
import PrimaryButton from "../ui/components/PrimaryButton";
import { loginApi, sendOTPApi, verifyOTPApi } from "@/api/authService";
import { useSettingsStore, useUIStore, useUserStore } from "@/stores/useStore";
import Modal from "@/ui/components/Modal";
import ScannerCamera from "@/ui/components/Scanner";
import ReCAPTCHA from "react-google-recaptcha";

const Login = () => {
  const isBackendEnabled = import.meta.env.VITE_BACKEND_ENABLED === "true";
  const navigate = useNavigate();
  const { setUser } = useUserStore();
  const { isAnimationDone } = useUIStore();
  const { settings } = useSettingsStore();

  const [credentials, setCredentials] = useState({
    identifier: "",
    password: ""
  });
  const [guardianId, setGuardianId] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [captchaValue, setCaptchaValue] = useState(null);
  const [captchaLoading, setCaptchaLoading] = useState(true);
  const [retryAfter, setRetryAfter] = useState(0);
  const [redirectSeconds, setRedirectSeconds] = useState(null);

  // 2FA state to van
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [twoFAEmail, setTwoFAEmail] = useState("");
  const [twoFAUserData, setTwoFAUserData] = useState(null);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpError, setOtpError] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const otpRefs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];
  const countdownRef = useRef(null);

  const shouldShowCaptcha =
    credentials.identifier.trim().length > 0 && credentials.password.length > 0;

  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    variant: "banner",
    title: "",
    message: "",
    actionText: "",
    onAction: () => {},
    onClose: () => {},
    autoRedirect: false
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({ ...prev, [name]: value }));
    if (errors[name] || errors.general) {
      setErrors((prev) => ({ ...prev, [name]: "", general: "" }));
    }
  };

  const preventClipboardAction = (event) => event.preventDefault();

  // Final step: set user and go to dashboard
  const completeLogin = async (userData) => {
    setUser(userData);
    await new Promise((resolve) => setTimeout(resolve, 300));
    navigate("/dashboard", { state: { showModal: true }, replace: true });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !isBackendEnabled &&
      credentials.identifier === "admin" &&
      credentials.password === "admin"
    ) {
      navigate("/dashboard");
      return;
    }

    const newErrors = {};
    if (!credentials.identifier.trim())
      newErrors.identifier = "Email or Username is required";
    if (!credentials.password) newErrors.password = "Password is required";
    if (shouldShowCaptcha && !captchaValue)
      newErrors.captcha = "Please complete the CAPTCHA";
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await handleLogin();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Login failed";
      const retrySeconds = parseInt(msg.match(/(\d+)(?:s| seconds)/)?.[1]);
      if (!isNaN(retrySeconds)) startCountdown(retrySeconds);
      setErrors({ general: msg, identifier: " ", password: " " });
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    setModalConfig((prev) => ({ ...prev, isOpen: false }));
    setLoading(true);

    const payload = {
      password: credentials.password,
      identifier: credentials.identifier.trim()
    };

    const response = await loginApi(payload);

    if (response.data.deviceRegistered === false) {
      setGuardianId(response.data.guardianId);
      setModalConfig({
        isOpen: true,
        variant: "banner",
        title: "No Valid Device",
        message:
          "It seems like you don't have a paired iCane device. Please pair your device to continue.",
        onClose: () => setModalConfig((prev) => ({ ...prev, isOpen: false }))
      });
      setShowScanner(true);
      setLoading(false);
      return;
    }

    const userData = response.data.user || response.data;

    // check if 2fa is enable to van
    if (settings.privacy.twoFactor) {
      const email = userData.email;
      setTwoFAEmail(email);
      setTwoFAUserData(userData);
      setLoading(false);
      await sendTwoFAOtp(email);
      setShow2FAModal(true);
      return;
    }

    // 2fa off to van
    await completeLogin(userData);
  };

  //2fa helper to van

  const sendTwoFAOtp = async (email) => {
    setIsSendingOtp(true);
    setOtpError("");
    try {
      await sendOTPApi(email);
      setCountdown(60);
      if (countdownRef.current) clearInterval(countdownRef.current);
      countdownRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownRef.current);
            countdownRef.current = null;
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      setOtpError(
        err.response?.data?.message || "Failed to send OTP. Please try again."
      );
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (value.length <= 1 && /^[0-9]*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      setOtpError("");
      if (value && index < 5) otpRefs[index + 1].current?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs[index - 1].current?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    if (!pasted) return;
    const newOtp = [...otp];
    pasted.split("").forEach((char, i) => {
      newOtp[i] = char;
    });
    setOtp(newOtp);
    setOtpError("");
    const nextIndex = Math.min(pasted.length, 5);
    otpRefs[nextIndex].current?.focus();
  };

  const handle2FAVerify = async () => {
    const otpCode = otp.join("");
    if (otpCode.length !== 6) {
      setOtpError("Please enter the complete 6-digit code.");
      return;
    }
    setOtpLoading(true);
    setOtpError("");
    try {
      await verifyOTPApi(twoFAEmail, otpCode);
      setShow2FAModal(false);
      resetOtpState();
      await completeLogin(twoFAUserData);
    } catch (err) {
      setOtpError(
        err.response?.data?.message || "Invalid code. Please try again."
      );
    } finally {
      setOtpLoading(false);
    }
  };

  const resetOtpState = () => {
    setOtp(["", "", "", "", "", ""]);
    setOtpError("");
    setCountdown(0);
    if (countdownRef.current) clearInterval(countdownRef.current);
  };

  const handleResendOtp = async () => {
    if (countdown > 0 || isSendingOtp) return;
    await sendTwoFAOtp(twoFAEmail);
  };

  // kasama to van
  useEffect(() => {
    if (show2FAModal) {
      setTimeout(() => otpRefs[0].current?.focus(), 100);
    }
  }, [show2FAModal]);

  // kasama to van
  useEffect(() => {
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  // Scanner / redirect helpers

  const handleOnScan = () => {
    setRedirectSeconds(10);
    setModalConfig({
      isOpen: true,
      variant: "banner",
      title: "Paired Successfully",
      actionText: "Proceed to Dashboard",
      onAction: handleLogin,
      onClose: () => {},
      autoRedirect: true
    });
  };

  useEffect(() => {
    if (!modalConfig.isOpen || !modalConfig.autoRedirect) return;
    if (redirectSeconds === null) return;
    if (redirectSeconds === 0) {
      handleLogin();
      return;
    }
    const timer = setTimeout(() => setRedirectSeconds((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [modalConfig.isOpen, modalConfig.autoRedirect, redirectSeconds]);

  const startCountdown = (seconds) => {
    setRetryAfter(seconds);
    const interval = setInterval(() => {
      setRetryAfter((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setErrors((prevErrors) => ({ ...prevErrors, general: "" }));
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    window.onloadCallback = () => {
      setCaptchaLoading(false);
    };
    const script = document.createElement("script");
    script.src = "https://www.google.com/recaptcha/";
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    const isDesktop = window.matchMedia
      ? window.matchMedia("(min-width: 640px)").matches
      : window.innerWidth >= 640;
    if (isDesktop) {
      const firstInput = document.querySelector("input:not([disabled])");
      firstInput?.focus();
    }
    return () => {
      document.head.removeChild(script);
      delete window.onloadCallback;
    };
  }, []);

  return (
    <>
      <div className="relative flex flex-col flex-1 min-h-0 w-full bg-[#FDFCFA] overflow-y-auto md:overflow-hidden scrollbar-hide">
        {!showScanner && (
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={
              isAnimationDone ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }
            }
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="flex-1 flex flex-col gap-6 sm:gap-7 justify-start sm:justify-center items-center pt-4 sm:pt-8 pb-6 sm:pb-8 px-4 sm:px-6 transform-gpu will-change-transform"
          >
            <div className="text-center space-y-2">
              <h1 className="hidden sm:block text-3xl md:text-4xl lg:text-5xl font-bold text-[#1C253C]">
                Welcome
              </h1>
              <p className="hidden sm:block font-poppins text-[#1C253C] text-paragraph text-1xl">
                Ready to go? Log in and jump straight into your dashboard.
              </p>
              <p className="sm:hidden text-[#1C253C] text-base">
                Login to your account
              </p>
            </div>

            <motion.form
              initial={{ opacity: 0, y: 16 }}
              animate={
                isAnimationDone ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }
              }
              transition={{
                duration: 0.4,
                ease: [0.22, 1, 0.36, 1],
                delay: 0.05
              }}
              className="w-full max-w-md sm:max-w-none lg:max-w-lg transform-gpu will-change-transform"
              onSubmit={handleSubmit}
              noValidate
            >
              {errors.general && (
                <p className="font-poppins text-center text-[#CE4B34] mb-4 text-sm">
                  {retryAfter > 0
                    ? `Too many failed login attempts. Try again in ${retryAfter} seconds.`
                    : errors.general}
                </p>
              )}

              <div className="space-y-4">
                <TextField
                  className="font-poppins"
                  label="Email or Username"
                  placeholder="Enter your email or username..."
                  name="identifier"
                  value={credentials.identifier}
                  onChange={handleChange}
                  error={errors.identifier}
                  inputClassName="py-3 sm:py-4"
                  maxLength={50}
                  disabled={retryAfter > 0}
                />
                <PasswordField
                  className="font-poppins relative"
                  label="Password"
                  placeholder="Enter your password..."
                  name="password"
                  type="password"
                  value={credentials.password}
                  onChange={handleChange}
                  error={errors.password}
                  showErrorIcon={false}
                  inputClassName="py-3 sm:py-4"
                  onPaste={preventClipboardAction}
                  onCopy={preventClipboardAction}
                  onCut={preventClipboardAction}
                  onDrop={preventClipboardAction}
                  maxLength={20}
                  disabled={retryAfter > 0}
                />
                <Link
                  to="/forgot-password"
                  className="font-poppins block text-left hover:underline text-[16px] underline mt-2 w-fit"
                >
                  Forgot password?
                </Link>

                {shouldShowCaptcha && (
                  <div className="captcha-container">
                    {captchaLoading && (
                      <p className="text-center text-gray-500 mb-2">
                        Loading CAPTCHA...
                      </p>
                    )}
                    <ReCAPTCHA
                      sitekey={import.meta.env.VITE_CAPTCHA_KEY}
                      onChange={(value) => {
                        setCaptchaValue(value);
                        if (errors.captcha)
                          setErrors((prev) => ({ ...prev, captcha: "" }));
                      }}
                      asyncScriptOnLoad={() => setCaptchaLoading(false)}
                    />
                    {errors.captcha && (
                      <p className="font-poppins text-[#CE4B34] text-sm mt-2">
                        {errors.captcha}
                      </p>
                    )}
                  </div>
                )}

                <PrimaryButton
                  className="font-poppins w-full py-3 sm:py-4 text-base sm:text-[18px] font-medium mt-5 sm:mt-6"
                  bgColor="bg-primary-100"
                  text={loading ? "Signing in..." : "Sign In"}
                  type="submit"
                  disabled={retryAfter > 0 || loading || captchaLoading}
                />
              </div>
            </motion.form>

            <p className="text-center text-base sm:text-[18px]">
              Didn't have an account?{" "}
              <Link
                to="/register"
                className="font-poppins text-blue-500 hover:underline text-base sm:text-[18px]"
              >
                Sign Up
              </Link>
            </p>
          </motion.div>
        )}

        {showScanner && (
          <div className="flex flex-col gap-6 sm:gap-7 sm:justify-center items-center pt-4 sm:pt-5 pb-6 sm:pb-5 px-4 sm:px-6">
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#1C253C] text-center">
                Scan your iCane Device
              </h1>
              <p className="text-[#1C253C] text-sm sm:text-base text-center">
                Point your camera at the QR code on your iCane device to pair it
                automatically.
              </p>
            </div>
            <ScannerCamera onSuccess={handleOnScan} guardianId={guardianId} />
          </div>
        )}
      </div>

      {/*2FA OPT Modal */}
      {show2FAModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

          {/* modal card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6 sm:p-8"
          >
            {/* Header */}
            <div className="text-center space-y-1 mb-6">
              <h2 className="text-2xl font-bold text-[#1C253C]">
                Email Verification
              </h2>
              <p className="font-poppins text-[#1C253C] text-sm">
                Enter the{" "}
                <span className="font-bold">6-digit verification code</span> we
                sent to your email address.
              </p>
              <p className="text-sm text-gray-500">{twoFAEmail}</p>
            </div>

            {/* inputs OTP */}
            <div className="flex justify-center gap-2 lg:gap-3 mb-4">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={otpRefs[index]}
                  type="text"
                  maxLength="1"
                  value={digit}
                  inputMode="numeric"
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  onPaste={index === 0 ? handleOtpPaste : undefined}
                  className="w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 lg:w-14 lg:h-14 text-center text-xl lg:text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-primary-100 focus:outline-none transition-colors"
                />
              ))}
            </div>

            {/* OTP error */}
            {otpError && (
              <p className="text-center text-red-500 text-sm mb-3">
                {otpError}
              </p>
            )}

            {/* Resend */}
            <div className="text-center mb-6">
              <p className="font-poppins text-[#1C253C] text-sm mb-1">
                Didn't receive the code?
              </p>
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={countdown > 0 || isSendingOtp}
                className={`font-poppins text-primary-100 text-sm font-medium ${
                  countdown > 0 || isSendingOtp
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:underline cursor-pointer"
                }`}
              >
                {isSendingOtp
                  ? "Sending..."
                  : countdown > 0
                    ? `Resend in ${countdown}s`
                    : "Resend Verification Code"}
              </button>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row-reverse gap-3">
              <PrimaryButton
                className="w-full py-3 text-base font-medium"
                bgColor="bg-primary-100"
                text={otpLoading ? "Verifying..." : "Verify"}
                type="button"
                onClick={handle2FAVerify}
                disabled={otpLoading || otp.join("").length !== 6}
              />
              <PrimaryButton
                className="w-full py-3 text-base"
                textColor="text-black"
                text="Cancel"
                variant="outline"
                type="button"
                onClick={() => {
                  setShow2FAModal(false);
                  resetOtpState();
                  setTwoFAUserData(null);
                  setTwoFAEmail("");
                }}
                disabled={otpLoading}
              />
            </div>
          </motion.div>
        </div>
      )}

      {/* Scanner success modal (unchanged) */}
      <Modal
        isOpen={modalConfig.isOpen}
        onClose={modalConfig.onClose}
        modalType={modalConfig.modalType}
        position={modalConfig.position}
        actionText={modalConfig.actionText}
        title={modalConfig.title}
        message={
          modalConfig.autoRedirect ? (
            <div className="space-y-2">
              <p className="text-sm text-gray-700 mt-1">
                You can now continue to dashboard and start using your account.
              </p>
              <p className="text-sm opacity-70">
                Redirecting in {redirectSeconds}s…
              </p>
            </div>
          ) : (
            modalConfig.message
          )
        }
        variant={modalConfig.variant}
        onAction={modalConfig.onAction}
      />
    </>
  );
};

export default Login;
