import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import SidebarContent from "../ui/components/SidebarContent";
import TextField from "../ui/components/TextField";
import PasswordField from "../ui/components/PasswordField";
import PrimaryButton from "../ui/components/PrimaryButton";
import { useUserStore } from "@/stores/useStore";

const Login = () => {
  const { login, setShowLoginModal } = useUserStore();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    password: ""
  });
  const [errors, setErrors] = useState({});

  // Sample credentials
  const VALID_USERNAME = "admin";
  const VALID_PASSWORD = "admin";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field when user starts typing
    if (errors[name] || errors.general) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
        general: ""
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    const REQUIRED_MSG = "This field is required";

    // Validation
    if (!formData.username.trim()) {
      newErrors.username = REQUIRED_MSG;
    }
    if (!formData.password) {
      newErrors.password = REQUIRED_MSG;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Check credentials
    const isUsernameValid = formData.username === VALID_USERNAME;
    const isPasswordValid = formData.password === VALID_PASSWORD;

    if (!isUsernameValid || !isPasswordValid) {
      if (!isUsernameValid && !isPasswordValid) {
        setErrors({
          general: "Incorrect username and password",
          username: " ",
          password: " "
        });
      } else {
        setErrors({
          username: !isUsernameValid ? "Incorrect username" : "",
          password: !isPasswordValid ? "Incorrect password" : ""
        });
      }
      return;
    }

    // Login successful
    login(formData.username);
    setShowLoginModal(true);
    navigate("/dashboard");
  };

  return (
    <div className="min-h-dv w-full flex flex-col sm:flex-row">
      <SidebarContent />
      <div className="w-full h-dvh sm:flex-1 sm:min-h-screen relative bg-[#FDFCFA] px-6 sm:px-10">
        <Link to="/">
          <div className="sm:hidden py-4 flex gap-2 absolute top-0 left-4">
            <img
              src="src/assets/images/smartcane-logo-blue.png"
              alt="Smart Cane Logo"
              className="object-contain w-[45px]"
            />
          </div>
        </Link>

        <div className="h-screen flex flex-col items-center justify-center">
          <form
            className="w-full max-w-md sm:max-w-none lg:max-w-lg max-h-[70vh]"
            onSubmit={handleSubmit}
            noValidate
          >
            <div className="flex flex-col items-center text-center mb-10 space-y-6 sm:space-y-3">
              <h1 className="font-poppins text-center text-5xl sm:text-h1 font-bold text-[#1C253C]">
                Welcome!
              </h1>
              <p className="font-poppins text-[#1C253C] text-center text-paragraph">
                Enter your credentials below to access your dashboard and saved
                features.
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
                required
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
                text="Sign In"
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
