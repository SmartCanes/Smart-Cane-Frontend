import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import SidebarContent from "../ui/components/SidebarContent";
import TextField from "../ui/components/TextField";
import PasswordField from "../ui/components/PasswordField";
import PrimaryButton from "../ui/components/PrimaryButton";
import { useUserStore } from "@/stores/useStore";
import { loginApi } from "@/api/authService";

const Login = () => {
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

    // Show password required indicator when Sign In is clicked and username has value
    if (username.trim()) {
      setShowPasswordRequired(true);
    }

    // Validation
    const newErrors = {};
    if (!username.trim()) newErrors.username = "This field is required";
    if (!password) newErrors.password = "This field is required";
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      console.log(import.meta.env.VITE_DEV);
      if (
        import.meta.env.VITE_DEV &&
        username === "admin" &&
        password === "admin"
      ) {
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
    <div className="min-h-dv w-full flex flex-col sm:flex-row">
      <SidebarContent />
      <div className="w-full h-dvh sm:flex-1 sm:min-h-screen relative bg-[#FDFCFA] px-6 sm:px-10">
        {/* <Link to="/">
          <div className="sm:hidden py-4 flex gap-2 absolute top-0 left-4">
            <img
              src="src/assets/images/smartcane-logo-blue.png"
              alt="Smart Cane Logo"
              className="object-contain w-[45px]"
            />
          </div>
        </Link> */}
        <div className="absolute top-0 left-0 bg-primary-100 rounded-b-[30%] h-48 w-full sm:hidden flex justify-center items-center">
          <h1 className="font-gabriela text-8xl text-[#FDFCFA]">iCane</h1>
        </div>

        <div className="h-screen flex flex-col items-center justify-center">
          <form
            className="w-full max-w-md sm:max-w-none lg:max-w-lg max-h-[70vh]"
            onSubmit={handleSubmit}
            noValidate
          >
            <div className="flex flex-col items-center text-center mb-10 space-y-6 sm:space-y-3">
              <p className="font-poppins text-[#1C253C] text-center text-paragraph text-2xl">
                Login to your Account
              </p>
            </div>

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
      </div>
    </div>
  );
};

export default Login;
