import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import TextField from "../ui/components/TextField";
import SelectField from "../ui/components/SelectField";
import PasswordField from "../ui/components/PasswordField";
import PrimaryButton from "../ui/components/PrimaryButton";
import {
  checkCredentialsApi,
  registerApi,
  sendOTPApi,
  verifyOTPApi
} from "@/api/authService";
import Loader from "@/ui/components/Loader";
import { useRegisterStore } from "@/stores/useRegisterStore";
import ScannerCamera from "@/ui/components/Scanner";
import Toast from "@/ui/components/Toast";
import ValidationModal from "@/ui/components/ValidationModal";

const barangays = [
  { value: "brgy1", label: "Barangay 1" },
  { value: "brgy2", label: "Barangay 2" },
  { value: "brgy3", label: "Barangay 3" },
  { value: "brgy4", label: "Barangay 4" },
  { value: "brgy5", label: "Barangay 5" }
];

const cities = [
  { value: "city1", label: "Manila" },
  { value: "city2", label: "Quezon City" },
  { value: "city3", label: "Makati" },
  { value: "city4", label: "Pasig" },
  { value: "city5", label: "Taguig" }
];

const provinces = [
  { value: "prov1", label: "Metro Manila" },
  { value: "prov2", label: "Bulacan" },
  { value: "prov3", label: "Cavite" },
  { value: "prov4", label: "Laguna" },
  { value: "prov5", label: "Rizal" }
];

const Register = () => {
  const isDev = (import.meta.env.VITE_ENV || "development") === "development";
  const CONTACT_NUMBER_LENGTH = 11;
  const navigate = useNavigate();
  const {
    formData,
    updateForm,
    otp,
    updateOtp,
    otpSent,
    setGuardianId,
    setOtpSent,
    setDeviceSerial,
    deviceValidated
  } = useRegisterStore();

  const [searchParams] = useSearchParams();
  const [showScanner, setShowScanner] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    visible: false,
    type: null,
    position: "center"
  });
  const [toast, setToast] = useState({
    showToast: false,
    toastMessage: "",
    toastType: ""
  });
  const [step, setStep] = useState(1);
  const [toastShown, setToastShown] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [errors, setErrors] = useState({});
  const otpRefs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];
  const countdownRef = useRef(null);

  const validateField = (name, value) => {
    switch (name) {
      case "firstName":
      case "lastName":
        if (!value.trim()) return "This field is required";
        if (!/^[a-zA-Z\s]+$/.test(value))
          return "Should contain only letters and spaces";
        if (value.length < 2) return "Should be at least 2 characters long";
        return "";

      case "username": {
        if (!value.trim()) return "This field is required";
        if (value.length < 3)
          return "Username must be at least 3 characters long";
        if (!/^[a-zA-Z0-9_]+$/.test(value))
          return "Username can only contain letters, numbers, and underscores";
        // Check if username contains at least 3 letters
        const letterCount = (value.match(/[a-zA-Z]/g) || []).length;
        if (letterCount < 3) return "Username must contain at least 3 letters";
        return "";
      }

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

  const handleChange = (name, value) => {
    if (
      (name === "firstName" || name === "lastName") &&
      value &&
      !/^[a-zA-Z\s]*$/.test(value)
    )
      return;

    const newValue =
      name === "contactNumber"
        ? value.replace(/\D/g, "").slice(0, CONTACT_NUMBER_LENGTH)
        : value;

    updateForm(name, newValue);

    // Clear error for the field
    setErrors((prev) => ({ ...prev, [name]: "" }));

    if (name === "password" || name === "confirmPassword") {
      if (formData.confirmPassword || formData.password) {
        const passwordError = validateField("password", formData.password);
        const confirmError = validateField(
          "confirmPassword",
          formData.confirmPassword
        );
        setErrors((prev) => ({
          ...prev,
          password: passwordError,
          confirmPassword: confirmError
        }));
      }
    }
  };

  const handleSelectChange = (name, value) => handleChange(name, value);

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

  const handleOtpChange = (index, value) => {
    if (value.length <= 1 && /^[0-9]*$/.test(value)) {
      updateOtp(index, value);
      setOtpError("");

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

    setIsSubmitting(true);
    try {
      switch (step) {
        case 1: {
          // Account Info
          if (isDev) {
            setStep(2);
            break;
          }
          await checkCredentialsApi({ username: formData.username });
          setStep(2);
          break;
        }

        case 2: {
          // Address / Contact Info
          if (isDev) {
            setStep(3);
            break;
          }
          await checkCredentialsApi({
            email: formData.email,
            contact_number: formData.contactNumber
          });
          await sendOtp();
          setStep(3);
          break;
        }

        case 3: {
          if (isDev) {
            setShowScanner(true);
            break;
          }

          const otpCode = otp.join("");
          if (otpCode.length !== 6) {
            setOtpError("Please enter the complete 6-digit OTP");
            break;
          }

          await verifyOTPApi(formData.email, otpCode);

          const accountPayload = {
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

          const { data } = await registerApi(accountPayload);
          setGuardianId(data.guardian_id);
          setShowScanner(true);
          break;
        }
        default: {
          console.warn("Unknown step:", step);
          break;
        }
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || error.message || "Login failed";
      if (errorMessage.includes("Username")) {
        setErrors((prev) => ({
          ...prev,
          username: "Username already taken"
        }));
        document
          .querySelector('[name="username"]')
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
        document.querySelector('[name="username"]')?.focus();
      } else if (errorMessage.includes("Email")) {
        setErrors((prev) => ({ ...prev, email: "Email already registered" }));
        document
          .querySelector('[name="email"]')
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
        document.querySelector('[name="email"]')?.focus();
      } else if (errorMessage.includes("Contact number")) {
        setErrors((prev) => ({
          ...prev,
          contactNumber: "Contact number is already registered"
        }));
        document
          .querySelector('[name="contactNumber"]')
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
        document.querySelector('[name="contactNumber"]')?.focus();
      } else if (errorMessage.includes("OTP")) {
        setOtpError(errorMessage);
      } else {
        setModalConfig({
          visible: true,
          type: "error",
          position: "center",
          message: errorMessage
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasStepErrors = () => Object.keys(validateStep(step)).length > 0;

  const sendOtp = async () => {
    setIsSendingOtp(true);
    setOtpError("");

    try {
      await sendOTPApi(formData.email);

      setOtpSent(true);
      setCountdown(60);

      // Clear any existing interval
      if (countdownRef.current) clearInterval(countdownRef.current);

      countdownRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownRef.current);
            countdownRef.current = null;
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      console.error("Failed to send OTP:", error);
      setOtpError(error.message || "Failed to send OTP. Please try again.");
    } finally {
      setIsSendingOtp(false);
    }
  };

  const resendOtp = async () => {
    if (countdown > 0 || isSendingOtp) return;
    await sendOtp();
  };

  useEffect(() => {
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  return (
    <>
      {!showScanner && (
        <div className="flex-1 flex flex-col gap-5 sm:justify-center items-center px-5 sm:min-h-screen sm:py-10 ">
          <>
            <div className="text-center space-y-2 ">
              <h1 className="hidden sm:block  text-5xl sm:text-4xl lg:text-5xl font-bold text-[#1C253C]">
                {step === 3 ? "Email Verification" : "Welcome"}
              </h1>
              <p className="hidden sm:block font-poppins text-[#1C253C] text-paragraph text-1xl">
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
              <p className="sm:hidden text-[#1C253C] text-paragraph text-lg">
                Create your account
              </p>
              {step === 3 && (
                <p className="sm:hidden font-poppins text-[#1C253C] text-paragraph text-sm">
                  Enter the{" "}
                  <span className="font-bold">6-digit verification code</span>{" "}
                  code we have sent to your email address.
                </p>
              )}
            </div>

            <form
              className="w-full max-w-sm lg:max-w-md xl:max-w-xl"
              onSubmit={handleNext}
              noValidate
            >
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
                      onChange={(e) =>
                        handleChange("firstName", e.target.value)
                      }
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
                      onChange={(e) => handleChange("lastName", e.target.value)}
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
                    onChange={(e) => handleChange("username", e.target.value)}
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
                    onChange={(e) => handleChange("password", e.target.value)}
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
                    onChange={(e) =>
                      handleChange("confirmPassword", e.target.value)
                    }
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <TextField
                      className="whitespace-nowrap "
                      label={"Lot No./Bldg./Street"}
                      placeholder="Enter your Lot No..."
                      name="streetAddress"
                      value={formData.streetAddress}
                      onChange={(e) =>
                        handleChange("streetAddress", e.target.value)
                      }
                      error={errors.streetAddress}
                      required
                    />

                    <SelectField
                      label={"Province"}
                      placeholder="Province..."
                      required
                      options={provinces}
                      onChange={(e) => {
                        handleSelectChange("province", e.target.value);
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
                        handleSelectChange("barangay", e.target.value);
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
                        handleSelectChange("city", e.target.value);
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
                      handleChange("relationship", e.target.value);
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
                    onChange={(e) =>
                      handleChange("contactNumber", e.target.value)
                    }
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
                    onChange={(e) => handleChange("email", e.target.value)}
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

              {step <= 3 && (
                <div className="mt-6 flex flex-col sm:flex-row-reverse gap-3">
                  <PrimaryButton
                    className="w-full py-3 sm:py-4 text-md sm:text-md"
                    text={
                      isSubmitting
                        ? step === 3
                          ? "Verifying..."
                          : "Checking..."
                        : `${step === 3 ? "Create Account" : "Next"}`
                    }
                    type="submit"
                    disabled={
                      isSubmitting ||
                      hasStepErrors() ||
                      (step === 3 && !otpSent && !isDev)
                    }
                  />
                  {step > 1 && (
                    <PrimaryButton
                      className="w-full py-3 sm:py-4 text-md sm:text-[18px]"
                      textColor="text-black"
                      text="Back"
                      variant="outline"
                      type="button"
                      onClick={() => {
                        setStep(step - 1);
                      }}
                    />
                  )}
                </div>
              )}

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
          </>
        </div>
      )}

      {isSubmitting && (
        <div className="absolute inset-0 sm:inset-y-0 sm:left-0 w-full sm:w-1/2 flex items-center justify-center z-30">
          <Loader size="large" color="#FDFCFA" />
        </div>
      )}

      {/* Email Verification Modal */}
      {modalConfig.visible && (
        <ValidationModal
          type={modalConfig.type}
          position={modalConfig.position}
          onAction={handleModalAction}
          email={modalConfig.email}
        />
      )}

      {showScanner && (
        <div className="flex-1 flex flex-col items-center justify-center px-5 sm:min-h-screen sm:p-10">
          <div className="text-center space-y-2 mb-5">
            <h1 className="text-5xl sm:text-4xl lg:text-5xl font-bold text-[#1C253C] text-center">
              Scan your iCane Device
            </h1>
            <p className="text-[#1C253C] text-paragraph text-1xl text-center">
              Point your camera at the QR code on your iCane device to pair it
              automatically.
            </p>
          </div>

          <ScannerCamera onClose={() => setShowScanner(false)} />
        </div>
      )}

      {deviceValidated && !toastShown && toast.showToast && (
        <Toast
          position="bottom-right"
          message={toast.toastMessage}
          type={toast.toastType}
          onClose={() => setToast({ ...toast, showToast: false })}
        />
      )}
    </>
  );
};

export default Register;
