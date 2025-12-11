import PasswordField from "../ui/components/PasswordField";
import TextField from "../ui/components/TextField";
import PrimaryButton from "../ui/components/PrimaryButton";
import { useState, useRef, useEffect } from "react";
import Modal from "@/ui/components/Modal";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useUIStore } from "@/stores/useStore";
import {
  forgotPasswordApi,
  forgotPasswordResetApi,
  forgotPasswordVerifyApi
} from "@/api/authService";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { isAnimationDone } = useUIStore();

  const [step, setStep] = useState(1);

  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState("");
  const [modalTitle, setModalTitle] = useState("");

  const [userEmail, setUserEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpError, setOtpError] = useState("");

  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: ""
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [otpExpiryTime, setOtpExpiryTime] = useState(null);
  const otpRefs = Array.from({ length: 6 }, () => useRef(null));

  useEffect(() => {
    if (step === 2 && otpExpiryTime) {
      const timer = setInterval(() => {
        if (new Date() > otpExpiryTime) {
          setOtpError("OTP has expired. Please request a new one.");
          clearInterval(timer);
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [step, otpExpiryTime]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({ ...prev, [name]: value }));

    // Special handling for password fields
    if (name === "newPassword" || name === "confirmPassword") {
      const passwordVal = name === "newPassword" ? value : formData.newPassword;
      const confirmVal =
        name === "confirmPassword" ? value : formData.confirmPassword;

      const passwordError = validateField("password", passwordVal);
      const confirmError = validateField(
        "confirmPassword",
        confirmVal,
        { password: passwordVal } // pass latest password
      );

      setErrors((prev) => ({
        ...prev,
        newPassword: passwordError,
        confirmPassword: confirmError
      }));
      return;
    }

    // Validate other fields individually
    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleEmailChange = (e) => {
    setUserEmail(e.target.value);
    if (emailError) setEmailError("");
  };

  const handleOtpChange = (index, value) => {
    if (!/^[0-9]?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (otpError) setOtpError("");

    if (value && index < 5) {
      otpRefs[index + 1].current.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs[index - 1].current.focus();
    }
  };

  // Show modal with timeout
  const showModalWithTimeout = (title, content, duration = 3000) => {
    setModalTitle(title);
    setModalContent(content);
    setShowModal(true);

    setTimeout(() => {
      setShowModal(false);
    }, duration);
  };

  const validateField = (name, value, formData) => {
    switch (name) {
      case "password":
        if (!value) return "Password is required";
        if (value.length < 8)
          return "Password must be at least 8 characters long";
        if (value.length > 64) return "Password must not exceed 64 characters";
        if (!/(?=.*[a-z])/.test(value))
          return "Password must contain at least one lowercase letter";
        if (!/(?=.*[A-Z])/.test(value))
          return "Password must contain at least one uppercase letter";
        if (!/(?=.*\d)/.test(value))
          return "Password must contain at least one number";
        if (!/(?=.*[@$!%*?&])/.test(value))
          return "Password must contain at least one special character (@$!%*?&)";
        return "";

      case "confirmPassword":
        if (!value) return "Confirm Password is required";
        if (value !== formData.password) return "Passwords don't match!";
        return "";

      default:
        return "";
    }
  };

  // Handle NEXT button (all 3 steps)
  const handleNext = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const REQUIRED_MSG = "This field is required";

    try {
      /** ----------------------
       * STEP 1: Request OTP
       * ---------------------*/
      if (step === 1) {
        if (!userEmail.trim()) {
          setEmailError(REQUIRED_MSG);
          setIsLoading(false);
          return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(userEmail)) {
          setEmailError("Please enter a valid email address");
          setIsLoading(false);
          return;
        }

        // Use API_BASE_URL consistently

        const response = await forgotPasswordApi(userEmail);
        console.log("Request OTP response:", response);

        // Check if the response indicates success
        if (response.status || response.message) {
          showModalWithTimeout(
            "Password Reset",
            `We've sent a verification code to your email: ${userEmail}`,
            3000
          );

          const expiry = new Date();
          expiry.setMinutes(expiry.getMinutes() + 5);
          setOtpExpiryTime(expiry);

          // Wait for modal to close before changing step
          setTimeout(() => {
            setStep(2);
          }, 3000);
        }
      }

      /** ----------------------
       * STEP 2: Verify OTP
       * ---------------------*/
      if (step === 2) {
        const code = otp.join("");

        if (code.length < 6) {
          setOtpError(REQUIRED_MSG);
          setIsLoading(false);
          return;
        }

        // TEST MODE - remove or keep based on your needs
        if (userEmail === "admin@gmail.com" && code === "123456") {
          setStep(3);
          setIsLoading(false);
          return;
        }

        const response = await forgotPasswordVerifyApi(userEmail, code);

        // Handle both response formats
        if (response.success || response.message === "OTP verified") {
          setStep(3);
        } else {
          setOtpError(response.message || "Invalid OTP");
        }
      }

      /** ----------------------
       * STEP 3: Reset Password
       * ---------------------*/
      if (step === 3) {
        const stepErrors = {};

        if (!formData.newPassword) stepErrors.newPassword = REQUIRED_MSG;
        if (!formData.confirmPassword)
          stepErrors.confirmPassword = REQUIRED_MSG;

        if (formData.newPassword !== formData.confirmPassword) {
          stepErrors.confirmPassword = "Password doesn't match!";
        }

        if (formData.newPassword.length < 6) {
          stepErrors.newPassword = "Password must be at least 6 characters";
        }

        if (Object.keys(stepErrors).length) {
          setErrors(stepErrors);
          setIsLoading(false);
          return;
        }

        const response = await forgotPasswordResetApi(
          userEmail,
          formData.newPassword,
          formData.confirmPassword
        );

        if (response.status || response.message) {
          showModalWithTimeout(
            "Success",
            "Password successfully updated!",
            2000
          );

          setTimeout(() => {
            navigate("/login");
          }, 2000);
        }
      }
    } catch (error) {
      console.error("Forgot password error:", error);

      if (step === 1) {
        setEmailError(
          error.response?.data?.message ||
            error.message ||
            "Failed to send OTP. Please try again."
        );
      }

      if (step === 2) {
        // More specific error handling for OTP verification
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          setOtpError(
            error.response?.data?.message ||
              error.message ||
              "Invalid OTP. Please try again."
          );
        } else if (error.request) {
          // The request was made but no response was received
          setOtpError("Network error. Please check your connection.");
        } else {
          // Something happened in setting up the request
          setOtpError("Something went wrong. Please try again.");
        }
      }

      if (step === 3) {
        const msg =
          error.response?.data?.message ||
          error.message ||
          "Failed to reset password";

        if (msg.includes("session expired")) {
          showModalWithTimeout(
            "Session Expired",
            "Session expired. Please start the reset process again.",
            3000
          );

          setTimeout(() => {
            setStep(1);
          }, 3000);
        } else {
          setErrors({ general: msg });
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP
  const resendOtp = async () => {
    if (!userEmail) return;

    try {
      setIsLoading(true);

      const response = await forgotPasswordApi(userEmail);
      console.log("Resend OTP response:", response);

      if (response.status || response.message) {
        setOtp(["", "", "", "", "", ""]);
        setOtpError("");

        const expiry = new Date();
        expiry.setMinutes(expiry.getMinutes() + 5);
        setOtpExpiryTime(expiry);

        showModalWithTimeout(
          "Verification",
          "New OTP sent to your email!",
          3000
        );
      }
    } catch (error) {
      setOtpError("Failed to resend OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="relative flex flex-col min-h-[calc(100vh-140px)] w-full bg-[#FDFCFA] overflow-hidden">
        <motion.div
          initial={{ opacity: 0, x: 100 }}
          animate={
            isAnimationDone ? { opacity: 1, x: 0 } : { opacity: 0, x: 100 }
          }
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex-1 flex flex-col gap-7 justify-start sm:justify-center items-center pt-[30px] sm:pt-0 pb-8 sm:pb-0 px-6"
        >
          <motion.form
            initial={{ opacity: 0, y: 50 }}
            animate={
              isAnimationDone ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }
            }
            transition={{ duration: 0.6 }}
            className="w-full max-w-md sm:max-w-none lg:max-w-lg"
            onSubmit={handleNext}
            noValidate
          >
            {/* HEADER */}
            <div className="w-full flex flex-col items-center text-center mb-6 sm:mb-10">
              <h1 className="font-poppins text-4xl sm:text-5xl lg:text-[64px] font-bold text-[#1C253C] mb-6">
                {step === 1 && "Forgot Password"}
                {step === 2 && "Verification Code"}
                {step === 3 && "Change Password"}
              </h1>

              <div className="mb-4 sm:mb-6">
                <p className="font-poppins text-[#1C253C] text-paragraph">
                  {step === 1 &&
                    "Enter your email address and we'll send you a code."}

                  {step === 2 && (
                    <>
                      We've sent a verification code to: <br />
                      <span className="font-semibold">{userEmail}</span>
                      <br />
                      <span className="text-sm text-gray-600">
                        (Expires in 5 minutes)
                      </span>
                    </>
                  )}

                  {step === 3 && (
                    <>
                      Your code has been verified. <br />
                      Enter your new password.
                    </>
                  )}
                </p>
              </div>
            </div>

            {/* STEP 1 — EMAIL */}
            {step === 1 && (
              <div className="space-y-4">
                <TextField
                  label="Email Address"
                  placeholder="sample.email@gmail.com"
                  type="email"
                  value={userEmail}
                  onChange={handleEmailChange}
                  error={emailError}
                  required
                />

                <PrimaryButton
                  className="w-full py-4 text-[18px]"
                  bgColor="bg-primary-100"
                  text={isLoading ? "Sending..." : "Send Code"}
                  type="submit"
                  disabled={isLoading}
                />

                <PrimaryButton
                  className="w-full py-3 mt-2"
                  text="Back"
                  variant="outline"
                  type="button"
                  onClick={() => navigate("/login")}
                  disabled={isLoading}
                />
              </div>
            )}

            {/* STEP 2 — OTP */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="flex justify-center gap-2">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={otpRefs[index]}
                      type="text"
                      maxLength="1"
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      className="w-12 h-12 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-primary-100 focus:outline-none"
                      disabled={isLoading}
                    />
                  ))}
                </div>

                {otpError && (
                  <p className="text-red-500 text-sm text-center">{otpError}</p>
                )}

                <div className="text-center text-sm text-gray-600">
                  Didn't receive code?{" "}
                  <button
                    type="button"
                    onClick={resendOtp}
                    className="text-primary-100 hover:underline font-medium"
                    disabled={isLoading}
                  >
                    Resend OTP
                  </button>
                </div>

                <PrimaryButton
                  className="w-full py-4 text-[18px]"
                  bgColor="bg-primary-100"
                  text={isLoading ? "Verifying..." : "Verify Code"}
                  type="submit"
                  disabled={isLoading}
                />

                <PrimaryButton
                  className="w-full py-3 mt-2"
                  text="Back"
                  variant="outline"
                  type="button"
                  onClick={() => setStep(1)}
                  disabled={isLoading}
                />
              </div>
            )}

            {/* STEP 3 — CHANGE PASSWORD */}
            {step === 3 && (
              <div className="space-y-4">
                <PasswordField
                  label="New Password"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  error={errors.newPassword}
                  hint="Must be at least 6 characters"
                  required
                  showValidationRules
                  disabled={isLoading}
                />

                <PasswordField
                  label="Re-enter Password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  error={errors.confirmPassword}
                  required
                  disabled={isLoading}
                />

                <PrimaryButton
                  className="w-full py-4 text-[18px]"
                  bgColor="bg-primary-100"
                  text={isLoading ? "Updating..." : "Submit"}
                  type="submit"
                  disabled={isLoading}
                />

                <PrimaryButton
                  className="w-full py-3 mt-2"
                  text="Back"
                  variant="outline"
                  type="button"
                  onClick={() => navigate("/login")}
                  disabled={isLoading}
                />
              </div>
            )}
          </motion.form>
        </motion.div>
      </div>

      {/* MODAL */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        variant="banner"
        title={modalTitle}
      >
        <div className="text-center">{modalContent}</div>
      </Modal>
    </>
  );
};

export default ForgotPassword;
