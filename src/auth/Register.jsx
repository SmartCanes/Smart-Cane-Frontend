import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import SidebarContent from "../ui/components/SidebarContent";
import TextField from "../ui/components/TextField";
import SelectField from "../ui/components/SelectField";
import PasswordField from "../ui/components/PasswordField";
import PrimaryButton from "../ui/components/PrimaryButton";
import EmailValidationModal from "../ui/components/EmailValidationModal";
import {
  checkCredentialsApi,
  registerApi,
  sendOTPApi,
  verifyOTPApi
} from "@/api/authService";
import Loader from "@/ui/components/Loader";

const Register = () => {
  const isDev = (import.meta.env.VITE_ENV || "development") === "development";
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1 = Basic Info, 2 = Address Info, 3 = OTP Verification
  const [modalConfig, setModalConfig] = useState({
    visible: false,
    type: null,
    position: "center"
  });

  const CONTACT_NUMBER_LENGTH = 11;
  const [otp, setOtp] = useState(["", "", "", "", "", ""]); // 6-digit OTP
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [errors, setErrors] = useState({});

  // Form data state
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    password: "",
    confirmPassword: "",
    streetAddress: "",
    barangay: "",
    city: "",
    province: "",
    relationship: "",
    email: "",
    contactNumber: ""
  });

  // OTP input refs
  const otpRefs = [
    React.useRef(),
    React.useRef(),
    React.useRef(),
    React.useRef(),
    React.useRef(),
    React.useRef()
  ];

  // Validation functions
  const validateField = (name, value) => {
    switch (name) {
      case "firstName":
      case "lastName":
        if (!value.trim()) return "This field is required";
        if (!/^[a-zA-Z\s]+$/.test(value))
          return "Should contain only letters and spaces";
        if (value.length < 2) return "Should be at least 2 characters long";
        return "";

      case "username":
        if (!value.trim()) return "This field is required";
        if (value.length < 3)
          return "Username must be at least 3 characters long";
        if (!/^[a-zA-Z0-9_]+$/.test(value))
          return "Username can only contain letters, numbers, and underscores";
        // Check if username contains at least 3 letters
        const letterCount = (value.match(/[a-zA-Z]/g) || []).length;
        if (letterCount < 3) return "Username must contain at least 3 letters";
        return "";

      case "password":
        if (!value) return "This field is required";
        if (value.length < 8)
          return "Password must be at least 8 characters long";
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
        if (!value) return "This field is required";
        if (value !== formData.password) return "Passwords don't match!";
        return "";

      case "streetAddress":
        if (!value.trim()) return "This field is required";
        if (value.length < 5) return "Address should be more specific";
        return "";

      case "email":
        if (!value.trim()) return "This field is required";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
          return "Please enter a valid email address";
        return "";

      case "contactNumber":
        if (!value) return "This field is required";
        if (value.length !== CONTACT_NUMBER_LENGTH)
          return `Contact number must be ${CONTACT_NUMBER_LENGTH} digits`;
        if (!/^09\d{9}$/.test(value))
          return "Contact number must start with 09 and contain 11 digits";
        return "";

      case "province":
      case "city":
      case "barangay":
      case "relationship":
        if (!value) return "This field is required";
        return "";

      default:
        return "";
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;

    // Restrict First Name and Last Name to letters and spaces only
    if (name === "firstName" || name === "lastName") {
      // Only allow letters and spaces, block numbers and special characters
      if (value && !/^[a-zA-Z\s]*$/.test(value)) {
        return; // Don't update if invalid characters are typed
      }
    }

    // If updating contact number, allow digits only (strip non-numeric chars)
    const newValue =
      name === "contactNumber"
        ? value.replace(/[^0-9]/g, "").slice(0, CONTACT_NUMBER_LENGTH)
        : value;

    setFormData((prev) => ({
      ...prev,
      [name]: newValue
    }));

    // Validate field in real-time
    const error = validateField(name, newValue);

    // Special handling for password fields - validate both when either changes
    if (name === "password" || name === "confirmPassword") {
      const newErrors = { ...errors };

      if (name === "password") {
        // Validate the password field
        newErrors.password = error;
        // Also revalidate confirmPassword if it has a value
        if (formData.confirmPassword) {
          newErrors.confirmPassword =
            formData.confirmPassword !== newValue
              ? "Passwords don't match!"
              : "";
        }
      } else if (name === "confirmPassword") {
        // Validate confirmPassword
        newErrors.confirmPassword = error;
        // Also revalidate password if needed
        if (formData.password) {
          const passwordError = validateField("password", formData.password);
          newErrors.password = passwordError;
        }
      }

      setErrors(newErrors);
    } else {
      setErrors((prev) => ({
        ...prev,
        [name]: error
      }));
    }
  };

  const validateStep = (stepNumber) => {
    const newErrors = {};

    if (stepNumber === 1) {
      const step1Fields = [
        "firstName",
        "lastName",
        "username",
        "password",
        "confirmPassword"
      ];
      step1Fields.forEach((field) => {
        const error = validateField(field, formData[field]);
        if (error) newErrors[field] = error;
      });
    } else if (stepNumber === 2) {
      const step2Fields = [
        "streetAddress",
        "province",
        "barangay",
        "city",
        "relationship",
        "contactNumber",
        "email"
      ];
      step2Fields.forEach((field) => {
        const error = validateField(field, formData[field]);
        if (error) newErrors[field] = error;
      });
    }

    return newErrors;
  };

  // Send OTP function
  const sendOtp = async () => {
    setIsSendingOtp(true);
    setOtpError("");

    try {
      await sendOTPApi(formData.email);

      setOtpSent(true);
      setCountdown(60); // 60 seconds countdown

      // Start countdown
      const countdownInterval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      console.error("Failed to send OTP:", error);
      setOtpError("Failed to send OTP. Please try again.");
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Resend OTP function
  const resendOtp = async () => {
    if (countdown > 0) return;

    await sendOtp();
  };

  // OTP input handlers
  const handleOtpChange = (index, value) => {
    if (value.length <= 1 && /^[0-9]*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      setOtpError("");

      // Auto-focus next input
      if (value && index < 5) {
        otpRefs[index + 1].current?.focus();
      }
    }
  };

  const handleOtpKeyDown = (index, e) => {
    // Handle backspace to go to previous input
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs[index - 1].current?.focus();
    }
  };

  const hideModal = () => {
    setModalConfig({ visible: false, type: null, position: "center" });
  };

  const handleModalAction = () => {
    if (modalConfig.type === "account-created") {
      navigate("/login");
    } else if (modalConfig.type === "verification-success") {
      hideModal();
    }
    hideModal();
  };

  const handleNext = async (e) => {
    e.preventDefault();

    // Validate current step
    const stepErrors = validateStep(step);

    if (!isDev && Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);

      // Scroll to first error
      const firstErrorField = Object.keys(stepErrors)[0];
      const errorElement = document.querySelector(
        `[name="${firstErrorField}"]`
      );
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: "smooth", block: "center" });
        errorElement.focus();
      }
      return;
    }

    if (step === 1) {
      if (isDev) {
        setStep(2);
        return;
      }
      // Check username availability before proceeding to step 2
      setIsSubmitting(true);

      try {
        const checkPayload = {
          username: formData.username
        };

        await checkCredentialsApi(checkPayload);

        // Username is available, proceed to step 2
        setStep(2);
      } catch (error) {
        console.error(error);
        const errorMessage =
          error.response?.data?.message || "Username check failed";

        if (errorMessage.includes("Username")) {
          setErrors((prev) => ({
            ...prev,
            username: "Username already taken"
          }));
          document
            .querySelector('[name="username"]')
            ?.scrollIntoView({ behavior: "smooth", block: "center" });
          document.querySelector('[name="username"]')?.focus();
        } else {
          alert(errorMessage);
        }
      } finally {
        setIsSubmitting(false);
      }
    } else if (step === 2) {
      if (isDev) {
        setStep(3);
        return;
      }
      // Check email and contact number availability before proceeding to verification
      setIsSubmitting(true);

      try {
        const checkPayload = {
          email: formData.email,
          contact_number: formData.contactNumber
        };

        await checkCredentialsApi(checkPayload);
        // Email and contact number are available, send OTP and proceed to step 3
        await sendOtp();
        setStep(3);
      } catch (error) {
        console.error(error);
        const errorMessage =
          error.response?.data?.message || "Credential check failed";

        // Parse which field is taken and show appropriate error
        if (errorMessage.includes("Email")) {
          setErrors((prev) => ({ ...prev, email: "Email already registered" }));
          document
            .querySelector('[name="email"]')
            ?.scrollIntoView({ behavior: "smooth", block: "center" });
          document.querySelector('[name="email"]')?.focus();
        } else if (errorMessage.includes("Contact number")) {
          setErrors((prev) => ({
            ...prev,
            contactNumber: "Contact number already registered"
          }));
          document
            .querySelector('[name="contactNumber"]')
            ?.scrollIntoView({ behavior: "smooth", block: "center" });
          document.querySelector('[name="contactNumber"]')?.focus();
        } else {
          alert(errorMessage);
        }
      } finally {
        setIsSubmitting(false);
      }
    } else {
      if (isDev) {
        setModalConfig({
          visible: true,
          type: "account-created",
          position: "center"
        });
        return;
      }
      // Step 3: Verify OTP and create account
      setIsSubmitting(true);
      setOtpError("");

      try {
        // Verify OTP first
        const otpCode = otp.join("");

        if (otpCode.length !== 6) {
          setOtpError("Please enter the complete 6-digit OTP");
          setIsSubmitting(false);
          return;
        }

        const verifyResponse = await verifyOTPApi(formData.email, otpCode);

        const payload = {
          username: formData.username,
          password: formData.password,
          guardian_name: formData.firstName + " " + formData.lastName,
          email: formData.email,
          contact_number: formData.contactNumber,
          relationship_to_vip: formData.relationship,
          province: formData.province,
          city: formData.city,
          barangay: formData.barangay,
          street_address: formData.streetAddress
        };

        await registerApi(payload);

        setModalConfig({
          visible: true,
          type: "account-created",
          position: "center"
        });
      } catch (error) {
        console.error(error);
        const errorMessage =
          error.response?.data?.message || "Registration failed";

        if (errorMessage.includes("OTP")) {
          setOtpError(errorMessage);
        } else {
          alert(errorMessage);
        }
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // Check if current step has any errors
  const hasStepErrors = () => {
    const stepErrors = validateStep(step);
    return Object.keys(stepErrors).length > 0;
  };

  // Dummy data (keep your existing dummy data)
  const dummyBarangays = [
    { value: "brgy1", label: "Barangay 1" },
    { value: "brgy2", label: "Barangay 2" },
    { value: "brgy3", label: "Barangay 3" },
    { value: "brgy4", label: "Barangay 4" },
    { value: "brgy5", label: "Barangay 5" }
  ];

  const dummyCities = [
    { value: "city1", label: "Manila" },
    { value: "city2", label: "Quezon City" },
    { value: "city3", label: "Makati" },
    { value: "city4", label: "Pasig" },
    { value: "city5", label: "Taguig" }
  ];

  const dummyProvinces = [
    { value: "prov1", label: "Metro Manila" },
    { value: "prov2", label: "Bulacan" },
    { value: "prov3", label: "Cavite" },
    { value: "prov4", label: "Laguna" },
    { value: "prov5", label: "Rizal" }
  ];

  const [provinces, setProvinces] = useState(dummyProvinces);
  const [cities, setCities] = useState(dummyCities);
  const [barangays, setBarangays] = useState(dummyBarangays);

  return (
    <div className="min-h-screen w-full flex flex-col sm:flex-row">
      <SidebarContent />

      {isSubmitting && (
        <div className="absolute inset-0 sm:inset-y-0 sm:left-0 w-full sm:w-1/2 flex items-center justify-center z-30">
          <Loader size="large" color="#FDFCFA" />
        </div>
      )}

      {/* Email Verification Modal */}
      {modalConfig.visible && (
        <EmailValidationModal
          type={modalConfig.type}
          position={modalConfig.position}
          onAction={handleModalAction}
          email={modalConfig.email}
        />
      )}

      {step === 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[92%] flex justify-center z-10">
          {/* Optional welcome message */}
        </div>
      )}
      <div className="relative flex flex-col w-full sm:flex-1 min-h-screen bg-[#FDFCFA] px-6 sm:px-10">
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
        <div className="flex-1 flex justify-center items-center pt-24 pb-5 sm:pt-0 sm:pb-0">
          <form
            className="w-full max-w-md sm:max-w-none lg:max-w-lg"
            onSubmit={handleNext}
            noValidate
          >
            <div className="text-center mb-7 sm:mb-10">
              <h1 className="font-poppins text-5xl sm:text-h1 font-bold text-[#1C253C] mb-4">
                {step === 3 ? "Email Verification" : "Welcome"}
              </h1>
              <p className="font-poppins text-[#1C253C] text-paragraph mt-15 text-1xl">
                {step === 1 ? (
                  "Create your account to get started with iCane."
                ) : step === 2 ? (
                  "Start your journey to safer and smarter mobility by signing up."
                ) : (
                  <>
                    Enter the{" "}
                    <span className="font-bold">6-digit verification code</span>{" "}
                    we have sent to your email address.
                    <br />
                    <span className="text-sm text-gray-600">
                      {formData.email}
                    </span>
                  </>
                )}
              </p>
            </div>

            {/* Step 1: Basic Information */}
            {step === 1 && (
              <div className="space-y-3 sm:space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <TextField
                    className="font-poppins"
                    label={"First Name"}
                    placeholder="First Name..."
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleFormChange}
                    inputClassName="py-3"
                    error={errors.firstName}
                    required
                  />

                  <TextField
                    className="font-poppins"
                    label={"Last Name"}
                    placeholder="Last Name..."
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleFormChange}
                    inputClassName="py-3"
                    error={errors.lastName}
                    required
                  />
                </div>

                <TextField
                  className="font-poppins"
                  label={"Username"}
                  placeholder="Enter your username..."
                  name="username"
                  value={formData.username}
                  onChange={handleFormChange}
                  inputClassName="py-3"
                  error={errors.username}
                  required
                />

                <PasswordField
                  className="font-poppins"
                  label={"Password"}
                  placeholder="Enter your password..."
                  name="password"
                  value={formData.password}
                  onChange={handleFormChange}
                  error={errors.password}
                  showValidationRules
                  inputClassName="py-3"
                  required
                />

                <PasswordField
                  className="font-poppins"
                  label={"Re-enter Password"}
                  placeholder="Re-enter your password..."
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleFormChange}
                  error={errors.confirmPassword}
                  inputClassName="py-3"
                  required
                />
              </div>
            )}

            {/* Step 2: Address Information */}
            {step === 2 && (
              <div className="space-y-4">
                {/* Lot No./Bldg./Street and Province - Side by side */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <TextField
                    className="font-poppins"
                    label={"Lot No./Bldg./Street"}
                    placeholder="Enter your Lot No..."
                    name="streetAddress"
                    value={formData.streetAddress}
                    onChange={handleFormChange}
                    error={errors.streetAddress}
                    required
                  />

                  <SelectField
                    className="font-poppins"
                    label={"Province"}
                    placeholder="Province..."
                    required
                    options={provinces}
                    onChange={(e) => {
                      setFormData((prev) => ({
                        ...prev,
                        province: e.target.value
                      }));
                      setErrors((prev) => ({ ...prev, province: "" }));
                    }}
                    value={formData.province}
                    error={errors.province}
                  />
                </div>

                {/* Barangay and City - Side by side */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <SelectField
                    className="font-poppins"
                    label={"Barangay"}
                    placeholder="Barangay..."
                    required
                    options={barangays}
                    onChange={(e) => {
                      setFormData((prev) => ({
                        ...prev,
                        barangay: e.target.value
                      }));
                      setErrors((prev) => ({ ...prev, barangay: "" }));
                    }}
                    value={formData.barangay}
                    error={errors.barangay}
                  />

                  <SelectField
                    className="font-poppins "
                    label={"City"}
                    placeholder="City..."
                    required
                    options={cities}
                    onChange={(e) => {
                      setFormData((prev) => ({
                        ...prev,
                        city: e.target.value
                      }));
                      setErrors((prev) => ({ ...prev, city: "" }));
                    }}
                    value={formData.city}
                    error={errors.city}
                  />
                </div>

                {/* Relationship to the VIP - Full width */}
                <SelectField
                  className="font-poppins py-[16px]"
                  label={"Relationship to the VIP"}
                  placeholder="Relationship..."
                  required
                  options={[
                    { value: "Husband", label: "Husband" },
                    { value: "Wife", label: "Wife" },
                    { value: "Sibling", label: "Sibling" },
                    { value: "Legal Guardian", label: "Legal Guardian" }
                  ]}
                  onChange={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      relationship: e.target.value
                    }));
                    setErrors((prev) => ({ ...prev, relationship: "" }));
                  }}
                  value={formData.relationship || ""}
                  error={errors.relationship}
                />

                {/* Contact Number - Full width */}
                <TextField
                  className="font-poppins"
                  label={"Contact Number"}
                  placeholder="09XX XXX XXXX"
                  type="tel"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleFormChange}
                  inputMode="numeric"
                  maxLength={11}
                  error={errors.contactNumber}
                  required
                />

                {/* Email Address - Full width */}
                <TextField
                  className="font-poppins"
                  label={"Email Address"}
                  placeholder="sample.email@gmail.com"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleFormChange}
                  error={errors.email}
                  required
                />
              </div>
            )}

            {/* Step 3: OTP Verification */}
            {step === 3 && (
              <div className="space-y-6">
                {/* OTP Input Boxes */}
                <div className="flex justify-center gap-3">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={otpRefs[index]}
                      type="text"
                      maxLength="1"
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      className="w-14 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-primary-100 focus:outline-none"
                    />
                  ))}
                </div>

                {/* OTP Error Message */}
                {otpError && (
                  <div className="text-center">
                    <p className="text-red-500 text-sm">{otpError}</p>
                  </div>
                )}

                {/* Resend OTP Link */}
                <div className="text-center">
                  <p className="font-poppins text-[#1C253C] text-sm mb-2">
                    Didn't receive the code?
                  </p>
                  <button
                    type="button"
                    onClick={resendOtp}
                    disabled={countdown > 0 || isSendingOtp}
                    className={`font-poppins text-primary-100 text-sm font-medium ${
                      countdown > 0 || isSendingOtp
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:underline"
                    }`}
                  >
                    {isSendingOtp
                      ? "Sending..."
                      : countdown > 0
                        ? `Resend in ${countdown}s`
                        : "Resend Verification Code"}
                  </button>
                </div>
              </div>
            )}

            <PrimaryButton
              className="font-poppins w-full py-4 text-[18px] font-medium mt-6"
              bgColor="bg-primary-100"
              text={
                isSubmitting
                  ? step === 3
                    ? "Verifying..."
                    : "Checking..."
                  : `${step === 3 ? "Verify & Create Account" : "Next"}`
              }
              type="submit"
              disabled={
                isSubmitting ||
                hasStepErrors() ||
                (step === 3 && !otpSent && !isDev)
              }
            />

            <p className="font-poppins text-center text-[18px] mt-4">
              Already have an Account?{" "}
              <Link
                to="/login"
                className="font-poppins text-blue-500 hover:underline text-[18px]"
              >
                Sign In
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
