import SidebarContent from "../ui/components/SidebarContent";
import PasswordField from "../ui/components/PasswordField";
import TextField from "../ui/components/TextField";
import PrimaryButton from "../ui/components/PrimaryButton";
import ValidationModal from "../ui/components/ValidationModal";
import { useState } from "react";
import { Link } from "react-router-dom";

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1 = Enter Email, 2 = Change Password
  const [showModal, setShowModal] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: ""
  });

  const [errors, setErrors] = useState({});

  const VALID_EMAIL = "admin@gmail.com";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const handleEmailChange = (e) => {
    const email = e.target.value;
    setUserEmail(email);
    // Clear error when user starts typing
    if (emailError) {
      setEmailError("");
    }
  };

  const handleNext = (e) => {
    e.preventDefault();
    const REQUIRED_MSG = "This field is required";
    if (step === 1) {
      // Validate email
      if (!userEmail.trim()) {
        setEmailError(REQUIRED_MSG);
        return;
      }

      if (userEmail !== VALID_EMAIL) {
        setEmailError("Email not registered");
        return;
      }

      setShowModal(true);
      // Auto-hide modal and move to step 2 after 4 seconds
      setTimeout(() => {
        setShowModal(false);
        setTimeout(() => setStep(2), 500); // Slight delay before transitioning
      }, 4000);
    } else {
      const step2Errors = {};
      if (!formData.newPassword) step2Errors.newPassword = REQUIRED_MSG;
      if (!formData.confirmPassword) step2Errors.confirmPassword = REQUIRED_MSG;
      if (formData.newPassword !== formData.confirmPassword) {
        step2Errors.confirmPassword = "Password don't match!";
      }

      if (Object.keys(step2Errors).length) {
        setErrors((prev) => ({ ...prev, ...step2Errors }));
        return;
      }
      console.log("Password changed");
    }
  };

  return (
    <div className="relative w-full min-h-screen flex flex-col lg:flex-row">
      <SidebarContent className="order-2 lg:order-1 lg:w-1/2" />

      {/* Verification Code Modal */}
      {showModal && (
        <ValidationModal
          type="verification-code"
          email={userEmail}
          position="top-center"
        />
      )}

      <div className="order-1 lg:order-2 w-full lg:w-1/2 h-full flex flex-col items-center justify-center bg-[#FDFCFA] py-12 px-6 sm:px-10">
        <div className="w-full max-w-md lg:max-w-lg flex flex-col items-center text-center">
          <h1 className="font-poppins text-4xl sm:text-5xl lg:text-[64px] font-bold text-[#1C253C] mb-6">
            {step === 1 ? "Forgot Password" : "Change Password"}
          </h1>

          <div className="mb-10">
            <p className="font-poppins text-[#1C253C] text-paragraph">
              {step === 1 ? (
                "Enter your email address and we'll send you a code to reset your password."
              ) : (
                <>
                  We've sent an code to your
                  <br />
                  afri*********@gmail.com
                </>
              )}
            </p>
          </div>

          <form className="w-full text-left" onSubmit={handleNext} noValidate>
            {/* Step 1: Enter Email */}
            {step === 1 && (
              <div className="space-y-4">
                <TextField
                  className="font-poppins"
                  label="Email Address"
                  placeholder="sample.email@gmail.com"
                  type="email"
                  name="email"
                  value={userEmail}
                  onChange={handleEmailChange}
                  error={emailError}
                  required
                />

                <PrimaryButton
                  className="font-poppins w-full py-4 text-[18px] font-medium mt-6"
                  bgColor="bg-primary-100"
                  text="Send Code"
                  type="submit"
                />
              </div>
            )}

            {/* Step 2: Change Password */}
            {step === 2 && (
              <div className="space-y-4">
                <PasswordField
                  className="font-poppins"
                  label="New Password"
                  placeholder="enter your new password"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  error={errors.newPassword}
                  showValidationRules
                  required
                />

                <PasswordField
                  className="font-poppins"
                  label="Re-enter Password"
                  placeholder="re-enter your password..."
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  error={errors.confirmPassword}
                  required
                />

                <PrimaryButton
                  className="font-poppins w-full py-4 text-[18px] font-medium mt-6"
                  bgColor="bg-primary-100"
                  text="Submit"
                  type="submit"
                />

              
                
              </div>
            )}

            
          </form>
        </div>
      </div>
    </div>
  );
};



export default ForgotPassword;
