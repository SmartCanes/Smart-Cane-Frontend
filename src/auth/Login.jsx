import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import TextField from "../ui/components/TextField";
import PasswordField from "../ui/components/PasswordField";
import PrimaryButton from "../ui/components/PrimaryButton";
import { loginApi } from "@/api/authService";
import { useUIStore, useUserStore } from "@/stores/useStore";
import Modal from "@/ui/components/Modal";
import ScannerCamera from "@/ui/components/Scanner";
import ReCAPTCHA from "react-google-recaptcha"; // CAPTCHA: Importing ReCAPTCHA component

const Login = () => {
  const isBackendEnabled = import.meta.env.VITE_BACKEND_ENABLED === "true";
  const navigate = useNavigate();
  const { setUser } = useUserStore();
  const { isAnimationDone } = useUIStore();

  const [credentials, setCredentials] = useState({
    identifier: "",
    password: ""
  });
  const [guardianId, setGuardianId] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [captchaValue, setCaptchaValue] = useState(null); // CAPTCHA: State for storing CAPTCHA verification value
  const [captchaLoading, setCaptchaLoading] = useState(true); // CAPTCHA: State for CAPTCHA loading status
  const [retryAfter, setRetryAfter] = useState(0);
  const [redirectSeconds, setRedirectSeconds] = useState(null);

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
    setCredentials((prev) => ({
      ...prev,
      [name]: value
    }));
    if (errors[name] || errors.general) {
      setErrors((prev) => ({ ...prev, [name]: "", general: "" }));
    }
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
    if (!captchaValue) newErrors.captcha = "Please complete the CAPTCHA"; // CAPTCHA: Validation for CAPTCHA completion
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await handleLogin();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Login failed";
      const retrySeconds = parseInt(msg.match(/(\d+)(?:s| seconds)/)?.[1]);

      if (!isNaN(retrySeconds)) {
        startCountdown(retrySeconds);
      }

      setErrors({
        general: msg,
        identifier: " ",
        password: " "
      });
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
      return;
    }

    setUser(response.data.user || response.data);
    await new Promise((resolve) => setTimeout(resolve, 300));
    navigate("/dashboard", {
      state: {
        showModal: true
      },
      replace: true
    });
  };

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

    const timer = setTimeout(() => {
      setRedirectSeconds((s) => s - 1);
    }, 1000);

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
      setCaptchaLoading(false); // CAPTCHA: Set loading to false when CAPTCHA is ready
      console.log("grecaptcha is ready!");
    };

    // Dynamically create and append the script tag
    const script = document.createElement("script");
    script.src = "https://www.google.com/recaptcha/"; // CAPTCHA: Loading Google reCAPTCHA script
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    const firstInput = document.querySelector("input:not([disabled])");
    firstInput?.focus();

    return () => {
      document.head.removeChild(script);
      delete window.onloadCallback;
    };
  }, []);

  return (
    <>
      <div className="relative flex flex-col min-h-[calc(100vh-140px)] w-full bg-[#FDFCFA] overflow-hidden">
        {!showScanner && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={
              isAnimationDone ? { opacity: 1, x: 0 } : { opacity: 0, x: 100 }
            }
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex-1 flex flex-col gap-7 justify-start sm:justify-center items-center pt-[30px] sm:pt-0 pb-8 sm:pb-0 px-6"
          >
            <div className="flex flex-col gap-5 text-center">
              <h1 className="hidden sm:block text-5xl sm:text-5xl lg:text-6xl font-bold text-[#1C253C]">
                Welcome!
              </h1>
              <p className="hidden sm:block text-[#1C253C] text-paragraph text-1xl">
                Ready to go? Log in and jump straight into your dashboard.
              </p>
              <p className="sm:hidden text-[#1C253C] text-paragraph text-lg">
                Login to your account
              </p>
            </div>
            <motion.form
              initial={{ opacity: 0, y: 50 }}
              animate={
                isAnimationDone ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }
              }
              transition={{ duration: 0.6 }}
              className="w-full max-w-md sm:max-w-none lg:max-w-lg"
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
                  maxLength={20}
                  disabled={retryAfter > 0}
                />

                <Link
                  to="/forgot-password"
                  className="font-poppins block text-left hover:underline text-[16px] underline mt-2 w-fit"
                >
                  Forgot password?
                </Link>

                <div className="captcha-container">
                  {/* CAPTCHA: Loading indicator for CAPTCHA */}
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
                </div>

                {/* CAPTCHA: Error message for CAPTCHA */}
                {errors.captcha && (
                  <p className="font-poppins text-[#CE4B34] text-sm mt-2">
                    {errors.captcha}
                  </p>
                )}

                <PrimaryButton
                  className="font-poppins w-full py-4 text-[18px] font-medium mt-6"
                  bgColor="bg-primary-100"
                  text={loading ? "Signing in..." : "Sign In"}
                  type="submit"
                  disabled={retryAfter > 0 || loading || captchaLoading} // CAPTCHA: Disable button while CAPTCHA is loading
                />

                <p className="font-poppins text-center text-[18px] mt-4">
                  Didn't have an account?{" "}
                  <Link
                    to="/register"
                    className="font-poppins text-blue-500 hover:underline text-[18px] text-nowrap"
                  >
                    Sign Up
                  </Link>
                </p>
              </div>
            </motion.form>
          </motion.div>
        )}
        {showScanner && (
          <div className="flex flex-col gap-7 sm:justify-center items-center pt-[30px] sm:pt-5 pb-8 sm:pb-5 px-6">
            <div className="space-y-2">
              <h1 className="text-4xl sm:text-3xl lg:text-4xl font-bold text-[#1C253C] text-center">
                Scan your iCane Device
              </h1>
              <p className="text-[#1C253C] text-paragraph text-1xl text-center">
                Point your camera at the QR code on your iCane device to pair it
                automatically.
              </p>
            </div>

            <ScannerCamera onSuccess={handleOnScan} guardianId={guardianId} />
          </div>
        )}
      </div>

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