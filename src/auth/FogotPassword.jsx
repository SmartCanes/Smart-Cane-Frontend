import PasswordField from "../ui/components/PasswordField";
import TextField from "../ui/components/TextField";
import PrimaryButton from "../ui/components/PrimaryButton";
import { useState } from "react";
import Modal from "@/ui/components/Modal";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useUIStore } from "@/stores/useStore";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1 = Enter Email, 2 = Change Password
  const [showModal, setShowModal] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: ""
  });

  const [errors, setErrors] = useState({});
  const { isAnimationDone } = useUIStore();
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
    }
  };

  return (
    <>
      {/* Verification Code Modal */}
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
            <div className="w-full flex flex-col items-center text-center mb-6 sm:mb-10">
              <h1 className="font-poppins text-4xl sm:text-5xl lg:text-[64px] font-bold text-[#1C253C] mb-6">
                {step === 1 ? "Forgot Password" : "Change Password"}
              </h1>

              <div className="mb-4 sm:mb-6">
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
            </div>

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
                <div className="flex justify-center mt-3">
                  <PrimaryButton
                    className="w-full py-3 sm:py-4 text-md sm:text-[18px]"
                    textColor="text-black"
                    text="Back"
                    variant="outline"
                    type="button"
                    onClick={() => navigate("/login")}
                  />
                </div>
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
                <PrimaryButton
                  className="w-full py-3 sm:py-4 text-md sm:text-[18px]"
                  textColor="text-black"
                  text="Back"
                  variant="outline"
                  type="button"
                  onClick={() => navigate("/login")}
                />
              </div>
            )}
          </motion.form>
        </motion.div>
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        variant="banner"
        title="Forgot Password"
      >
        <>
          We've sent a <span className="font-bold">verification code</span> to
          your email:
          <br />
          {userEmail ?? "********@gmail.com"}
          <br />
          <br />
          Please check your <span className="font-bold">Inbox</span> or{" "}
          <span className="font-bold">Spam</span> folder.
        </>
      </Modal>
    </>
  );
};

export default ForgotPassword;
