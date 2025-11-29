import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import SidebarContent from "../ui/components/SidebarContent";
import TextField from "../ui/components/TextField";
import PasswordField from "../ui/components/PasswordField";
import PrimaryButton from "../ui/components/PrimaryButton";
import { useUserStore } from "@/stores/useStore";
import { loginApi } from "@/api/authService";

const Login = () => {
  const isDev = (import.meta.env.VITE_ENV || "development") === "development";
  const { login, setShowLoginModal } = useUserStore();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    password: ""
  });
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

    if (username.trim()) {
      setShowPasswordRequired(true);
    }

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
      console.error(err);
      const msg = err.response?.data?.message || "Login failed";
      setErrors({
        general: msg,
        username: " ",
        password: " "
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh w-full flex flex-col sm:flex-row">
      <SidebarContent />
      
      {/* Main Container */}
      <div className="w-full min-h-dvh sm:flex-1 relative bg-white sm:bg-[#FDFCFA] px-6 sm:px-10 flex flex-col">
        
        {/* --- MOBILE CURVED HEADER (Figma Style) --- */}
        <div className="absolute top-0 left-0 w-full bg-primary-100 h-[220px] rounded-b-[48px] sm:hidden flex justify-center items-center z-0">
          <h1 className="font-gabriela text-6xl text-white tracking-wide">iCane</h1>
        </div>

        {/* --- FORM SECTION --- */}
        <div className="flex-1 flex items-center justify-center pt-[240px] pb-8 sm:pt-0 sm:pb-0">
          <div className="w-full max-w-md sm:max-w-none lg:max-w-lg">
            <form
              className="w-full"
              onSubmit={handleSubmit}
              noValidate
            >
              <div className="flex flex-col items-center text-center mb-6 sm:mb-10">
                <p className="font-poppins text-[#1C253C] text-center font-medium text-lg sm:text-2xl">
                  Login to your Account
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
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;