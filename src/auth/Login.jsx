import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import TextField from "../ui/components/TextField";
import PasswordField from "../ui/components/PasswordField";
import PrimaryButton from "../ui/components/PrimaryButton";
import { loginApi } from "@/api/authService";
import { useUserStore } from "@/stores/useStore";

const Login = () => {
  const isDev = (import.meta.env.VITE_ENV || "development") === "development";
  const navigate = useNavigate();
  const { setUser } = useUserStore();
  const [formData, setFormData] = useState({
    username: "",
    password: ""
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

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

      const response = await loginApi(username, password);

      if (!response.success) {
        throw new Error(response.message || "Login failed");
      }

      setUser(response.data.user || response.data);
      await new Promise((resolve) => setTimeout(resolve, 300));
      navigate("/dashboard", {
        state: {
          showModal: true
        },
        replace: true
      });
    } catch (err) {
      console.error("Login error:", err);
      console.error("Error response:", err.response?.data);
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

  return (
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
            value={formData.username}
            onChange={handleChange}
            error={errors.username}
          />

          <PasswordField
            className="font-poppins relative"
            label="Password"
            placeholder="Enter your password..."
            name="password"
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
  );
};

export default Login;
