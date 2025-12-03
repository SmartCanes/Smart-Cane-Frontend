import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import TextField from "../ui/components/TextField";
import PasswordField from "../ui/components/PasswordField";
import PrimaryButton from "../ui/components/PrimaryButton";
import { loginApi } from "@/api/authService";
import { useUserStore } from "@/stores/useStore";
import Modal from "@/ui/components/Modal";
import ScannerCamera from "@/ui/components/Scanner";
import { useLoginStore } from "@/stores/useLoginStore";

const Login = () => {
  const isDev = (import.meta.env.VITE_ENV || "development") === "development";
  const navigate = useNavigate();
  const { setUser, clearStore } = useUserStore();
  const {
    username,
    password,
    setCredentials,
    clearLoginStore,
    showScanner,
    setShowScanner,
    guardianId,
    setGuardianId
  } = useLoginStore();
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    onClose: () => {},
    type: null,
    message: "",
    modalType: null,
    onAction: null
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(
      name === "username" ? value : username,
      name === "password" ? value : password
    );
    if (errors[name] || errors.general) {
      setErrors((prev) => ({ ...prev, [name]: "", general: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!username.trim()) newErrors.username = "This field is required";
    if (!password) newErrors.password = "This field is required";
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      if (isDev && username === "admin" && password === "admin") {
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
    const response = await loginApi(username, password);

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
    clearLoginStore();
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
      onClose: () => {
        clearStore();
        setModalConfig((prev) => ({ ...prev, isOpen: false }));
      },
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
        <div className="flex-1 flex flex-col items-center sm:justify-center gap-5 px-5 ">
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
          <form
            className="w-full max-w-sm lg:max-w-md xl:max-w-xl"
            onSubmit={handleSubmit}
            noValidate
          >
            {errors.general && (
              <p className="font-poppins text-center text-[#CE4B34] mb-6">
                {errors.general}
              </p>
            )}

            <div className="space-y-4">
              <TextField
                className="font-poppins"
                label="Username"
                placeholder="Enter your username..."
                name="username"
                value={username}
                onChange={handleChange}
                error={errors.username}
              />

              <PasswordField
                className="font-poppins relative"
                label="Password"
                placeholder="Enter your password..."
                name="password"
                type="password"
                value={password}
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
          </form>
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
        modalType={modalConfig.type}
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
