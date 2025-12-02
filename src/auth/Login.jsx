import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import SidebarContent from "../ui/components/SidebarContent"; // Ito na yung updated file
import TextField from "../ui/components/TextField";
import PasswordField from "../ui/components/PasswordField";
import PrimaryButton from "../ui/components/PrimaryButton";
import { useUserStore } from "@/stores/useStore";
import { loginApi } from "@/api/authService";

const Login = () => {
  const isDev = (import.meta.env.VITE_ENV || "development") === "development";
  const { login, setShowLoginModal } = useUserStore();
  const navigate = useNavigate();

  // State para malaman kung tapos na ang animation ng SidebarContent
  const [isAnimationDone, setIsAnimationDone] = useState(false);

  const [formData, setFormData] = useState({ username: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPasswordRequired, setShowPasswordRequired] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name] || errors.general) {
      setErrors((prev) => ({ ...prev, [name]: "", general: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { username, password } = formData;
    if (username.trim()) setShowPasswordRequired(true);
    // ... (Validation Logic Here) ...
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
        localStorage.setItem("access_token", "DEV_ADMIN_TOKEN");
        navigate("/dashboard");
        return;
      }
      const response = await loginApi(username, password);
      localStorage.setItem("access_token", response.data.access_token);
      login(response.data.guardian_id);
      setShowLoginModal(true);
      navigate("/dashboard");
    } catch (err) {
      const msg = err.response?.data?.message || "Login failed";
      setErrors({ general: msg, username: " ", password: " " });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col sm:flex-row relative">
      
      {/* SIDEBAR SECTION ANIMATION
      */}
      <SidebarContent onAnimationComplete={() => setIsAnimationDone(true)} />

      {/* FORM SECTION */}
      <div className="relative flex flex-col w-full sm:w-1/2 sm:ml-[50%] min-h-screen bg-[#FDFCFA] px-6 sm:px-10">
        
        {/* Ilalabas lang ang form pag tapos na ang transition ng Sidebar */}
        <div className="flex-1 flex flex-col justify-start sm:justify-center items-center pt-[30px] sm:pt-0 pb-8 sm:pb-0">
          <motion.form
            initial={{ opacity: 0, y: 50 }}
            animate={isAnimationDone ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
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
                  Enter your credentials below to access your dashboard and saved features.
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
                  value={formData.username}
                  onChange={handleChange}
                  error={errors.username}
                />

                <PasswordField
                  className="font-poppins relative"
                  label="Password"
                  placeholder="Enter your password..."
                  name="password"
                  required={showPasswordRequired}
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  error={errors.password}
                  showErrorIcon={false}
                />

                <div className="w-full">
                  <Link
                    to="/forgot-password"
                    className="font-poppins block text-left text-[#1C253C] hover:underline text-sm underline font-medium mt-1 w-fit"
                  >
                    Forgot password?
                  </Link>
                </div>

                <PrimaryButton
                  className="font-poppins w-full py-3.5 text-base font-medium mt-6"
                  bgColor="bg-primary-100"
                  text={loading ? "Logging in..." : "Sign in"}
                  type="submit"
                />

                <p className="font-poppins text-center text-sm text-gray-600 mt-6">
                  Didn't have an account?{" "}
                  <Link
                    to="/register"
                    className="font-poppins text-blue-500 font-medium hover:underline"
                  >
                    Sign Up
                  </Link>
                </p>
              </div>
          </motion.form>
        </div>
      </div>
    </div>
  );
};

export default Login;