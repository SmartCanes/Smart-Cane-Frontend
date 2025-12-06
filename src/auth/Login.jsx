import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import TextField from "../ui/components/TextField";
import PasswordField from "../ui/components/PasswordField";
import PrimaryButton from "../ui/components/PrimaryButton";
import { loginApi } from "@/api/authService";
import { useUIStore, useUserStore } from "@/stores/useStore";
import Modal from "@/ui/components/Modal";
import ScannerCamera from "@/ui/components/Scanner";

const Login = () => {
  const isDev = (import.meta.env.VITE_ENV || "development") === "development";
  const navigate = useNavigate();
  const { setUser } = useUserStore();
  const { isAnimationDone } = useUIStore();

  const [credentials, setCredentials] = useState({
    username: "",
    password: ""
  });
  const [guardianId, setGuardianId] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    variant: "banner",
    title: "",
    message: "",
    actionText: "",
    onAction: () => {}
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

    const newErrors = {};
    if (!credentials.username.trim())
      newErrors.username = "Username is required";
    if (!credentials.password) newErrors.password = "Password is required";
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      if (
        isDev &&
        credentials.username === "admin" &&
        credentials.password === "admin"
      ) {
        document.cookie =
          "access_token=DEV_ACCESS_TOKEN; path=/; max-age=900; SameSite=None; Secure";
        document.cookie =
          "refresh_token=DEV_REFRESH_TOKEN; path=/; max-age=604800; SameSite=None; Secure";
        navigate("/dashboard");
        return;
      }

      await handleLogin();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Login failed";
      setErrors({
        general: msg,
        username: " ",
        password: " "
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    setModalConfig((prev) => ({ ...prev, isOpen: false }));
    setLoading(true);

    const response = await loginApi(credentials.username, credentials.password);
    if (response.data.device_registered === false) {
      setGuardianId(response.data.guardian_id);
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
    setModalConfig({
      isOpen: true,
      // onClose: () => handleLogin(),
      variant: "banner",
      title: "Paired Successfully",
      message:
        "You can now continue to dashboard and start using your account.",
      actionText: "Proceed to Dashboard",
      onAction: () => handleLogin()
    });
  };

  return (
    <>
      {!showScanner && (
        <div className="relative flex flex-col w-full sm:w-1/2 sm:ml-[50%] min-h-screen bg-[#FDFCFA] px-6 sm:px-10">
          {/* Ilalabas lang ang form pag tapos na ang transition ng Sidebar */}
          <div className="flex-1 flex flex-col justify-start sm:justify-center items-center pt-[30px] sm:pt-0 pb-8 sm:pb-0">
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
              <div className="flex flex-col items-center text-center mb-6 sm:mb-10">
                <h1 className="font-poppins text-5xl sm:text-h1 font-bold text-[#1C253C] mb-2">
                  Welcome!
                </h1>
                <p className="font-poppins text-[#1C253C] text-center font-medium text-sm sm:text-lg sm:w-2/3">
                  Enter your credentials below to access your dashboard and
                  saved features.
                </p>
              </div>

              {errors.general && (
                <p className="font-poppins text-center text-[#CE4B34] mb-4 text-sm">
                  {errors.general}
                </p>
              )}

              <div className="space-y-4">
                <TextField
                  className="font-poppins"
                  label="Username"
                  placeholder="Enter your username..."
                  name="username"
                  value={credentials.username}
                  onChange={handleChange}
                  error={errors.username}
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
                />

                <Link
                  to="/forgot-password"
                  className="font-poppins block text-left hover:underline text-[16px] underline mt-2 w-fit"
                >
                  Forgot password?
                </Link>

                <PrimaryButton
                  className="font-poppins w-full py-4 text-[18px] font-medium mt-6"
                  bgColor="bg-primary-100"
                  text={loading ? "Logging in..." : "Sign In"}
                  type="submit"
                />

                <p className="font-poppins text-center text-[18px] mt-4">
                  Didn't have an account?{" "}
                  <Link
                    to="/register"
                    className="font-poppins text-blue-500 hover:underline text-[18px]"
                  >
                    Sign Up
                  </Link>
                </p>
              </div>
            </motion.form>
          </div>
        </div>
      )}

      {showScanner && (
        <div className="flex-1 flex flex-col items-center justify-center px-5 sm:min-h-screen sm:p-10">
          <div className="text-center space-y-2 mb-5">
            <h1 className="text-5xl sm:text-4xl lg:text-5xl font-bold text-[#1C253C] text-center">
              Scan your iCane Device
            </h1>
            <p className="text-[#1C253C] text-paragraph text-1xl text-center">
              Point your camera at the QR code on your iCane device to pair it
              automatically.
            </p>
          </div>

          <ScannerCamera
            onSuccess={handleOnScan}
            showOnSuccessToast={false}
            guardianId={guardianId}
          />
        </div>
      )}

      <Modal
        isOpen={modalConfig.isOpen}
        onClose={modalConfig.onClose}
        modalType={modalConfig.modalType}
        position={modalConfig.position}
        actionText={modalConfig.actionText}
        title={modalConfig.title}
        message={modalConfig.message}
        variant={modalConfig.variant}
        onAction={modalConfig.onAction}
      />
    </>
  );
};

export default Login;
