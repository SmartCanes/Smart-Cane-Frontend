import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import SidebarContent from "../ui/components/SidebarContent";
import TextField from "../ui/components/TextField";
import PasswordField from "../ui/components/PasswordField";
import PrimaryButton from "../ui/components/PrimaryButton";

const Login = () => {
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

    // Validation
    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
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
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen w-full flex flex-col sm:flex-row">
      <SidebarContent className="hidden sm:flex sm:flex-1 sm:min-h-screen" />
      <div className="w-full sm:flex-1 sm:min-h-screen flex flex-col items-center justify-center bg-[#FDFCFA] py-12 px-6 sm:px-10">
        main
        <form
          className="w-full max-w-md sm:max-w-none lg:max-w-lg"
          onSubmit={handleSubmit}
        >
          <div className="flex flex-col items-center text-center mb-10 space-y-2 sm:space-y-3">
            <h1 className="font-poppins text-center text-h1 font-bold text-[#1C253C]">
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
              className="font-poppins block text-left hover:underline text-[16px] underline mt-2"
            >
              Forgot password?
            </Link>

            <PrimaryButton
              className="font-poppins w-full py-4 text-[18px] font-medium mt-6"
              bgColor="bg-primary-100"
              text="Sign In"
              type="submit"
            ></PrimaryButton>

            <p className="font-poppins text-center text-[18px] mt-4">
              Need An Account?{" "}
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
  );
};

export default Login;
