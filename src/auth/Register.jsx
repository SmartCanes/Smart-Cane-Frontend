import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
import Modal from "@/ui/components/Modal";
import TermsAndConditions from "@/ui/components/TermsAndConditions";
import { pairDevice, validateDeviceSerial } from "@/api/backendService";
import { motion } from "framer-motion";
import { useUIStore } from "@/stores/useStore";
import ReCAPTCHA from "react-google-recaptcha";

const Register = () => {
  const isBackendEnabled = import.meta.env.VITE_BACKEND_ENABLED === "true";
  const CONTACT_NUMBER_LENGTH = 11;
  const navigate = useNavigate();
  const {
    step,
    setStep,
    formData,
    updateForm,
    setGuardianId,
    setOtpSent,
    deviceValidated,
    setDeviceValidated,
    clearDeviceValidated,
    clearRegisterStore,
    guardianId,
    showScanner,
    setShowScanner
  } = useRegisterStore();
  const { isAnimationDone } = useUIStore();

  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    onClose: () => {},
    message: "",
    modalType: null,
    onAction: null
  });

  const [showTermsModal, setShowTermsModal] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [captchaValue, setCaptchaValue] = useState(null);
  const [captchaLoading, setCaptchaLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpError, setOtpError] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [errors, setErrors] = useState({});
  const otpRefs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];
  const countdownRef = useRef(null);
  const firstNameRef = useRef(null);
  const streetAddressRef = useRef(null);

  const validateField = (name, value) => {
    switch (name) {
      case "firstName":
        if (!value.trim()) return "First Name is required";
        if (!/^[a-zA-Z\s]+$/.test(value))
          return "Should contain only letters and spaces";
        if (value.length < 2) return "Should be at least 2 characters long";
        if (value.length > 50) return "Should not exceed 50 characters";
        return "";

      case "lastName":
        if (!value.trim()) return "Last Name is required";
        if (!/^[a-zA-Z\s]+$/.test(value))
          return "Should contain only letters and spaces";
        if (value.length < 2) return "Should be at least 2 characters long";
        if (value.length > 50) return "Should not exceed 50 characters";
        return "";

      case "username": {
        if (!value.trim()) return "Username is required";
        if (value.length < 3)
          return "Username must be at least 3 characters long";
        if (value.length > 20) return "Username must not exceed 20 characters";
        if (!/^[a-zA-Z0-9_]+$/.test(value))
          return "Username can only contain letters, numbers, and underscores";

        const letterCount = (value.match(/[a-zA-Z]/g) || []).length;
        if (letterCount < 3) return "Username must contain at least 3 letters";

        return "";
      }

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

      case "streetAddress":
        if (!value.trim()) return "Street Address is required";
        if (value.length < 5) return "Address should be more specific";
        if (value.length > 100)
          return "Address should not exceed 100 characters";
        return "";

      case "email":
        if (!value.trim()) return "Email is required";
        if (value.length > 100) return "Email should not exceed 100 characters";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
          return "Please enter a valid email address";
        return "";

      case "contactNumber":
        if (!value) return "Contact Number is required";
        if (value.length !== CONTACT_NUMBER_LENGTH)
          return `Contact number must be ${CONTACT_NUMBER_LENGTH} digits`;
        if (!/^09\d{9}$/.test(value))
          return "Contact number must start with 09 and contain 11 digits";
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

    // Clear error for this field
    setErrors((prev) => ({ ...prev, [name]: "" }));

    // Your original validation logic (works without flickering)
    if (name === "password" || name === "confirmPassword") {
      if (formData.confirmPassword || formData.password) {
        const passwordError = validateField(
          "password",
          name === "password" ? newValue : formData.password
        );
        const confirmError = validateField(
          "confirmPassword",
          name === "confirmPassword" ? newValue : formData.confirmPassword
        );
        setErrors((prev) => ({
          ...prev,
          password: passwordError,
          confirmPassword: confirmError
        }));
      }
    }

    // Add validation for ALL other fields
    if (
      name === "firstName" ||
      name === "lastName" ||
      name === "username" ||
      name === "contactNumber" ||
      name === "email" ||
      name === "streetAddress"
    ) {
      const error = validateField(name, newValue);
      setErrors((prev) => ({ ...prev, [name]: error }));
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
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
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

  const handleNext = async (e) => {
    e.preventDefault();

    if (step === 2 && isBackendEnabled) {
      if (!captchaValue) {
        setErrors((prev) => ({
          ...prev,
          captcha: "Please complete the CAPTCHA to continue"
        }));
        return;
      }
    }

    setErrors((prev) => ({ ...prev, captcha: "" }));

    setOtp(["", "", "", "", "", ""]);

    const stepErrors = validateStep(step);
    if (isBackendEnabled && Object.keys(stepErrors).length > 0) {
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
          if (!isBackendEnabled) {
            setStep(2);
            break;
          }
          await checkCredentialsApi({ username: formData.username });
          setStep(2);
          break;
        }

        case 2: {
          // Address / Contact Info
          if (!termsAccepted) {
            setShowTermsModal(true);
            setIsSubmitting(false);
            return;
          }
          if (!isBackendEnabled) {
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
          if (!isBackendEnabled) {
            setModalConfig({
              isOpen: true,
              onClose: () =>
                setModalConfig((prev) => ({ ...prev, isOpen: false })),
              variant: "banner",
              title: "Account Created!",
              message:
                "Account successfully created. Please pair your device to proceed."
            });
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
            province: "Metro Manila",
            village: "Saint Francis",
            city: "Quezon City",
            barangay: "San Bartolome",
            street_address: formData.streetAddress
          };

          const { data } = await registerApi(accountPayload);
          setGuardianId(data.guardian_id);

          if (deviceValidated.status === "ok" && deviceValidated.serial) {
            try {
              const res = await pairDevice({
                device_serial_number: deviceValidated.serial,
                guardian_id: data.guardian_id
              });

              if (res.success) {
                setModalConfig({
                  isOpen: true,
                  onClose: () =>
                    setModalConfig((prev) => ({ ...prev, isOpen: false })),
                  variant: "banner",
                  title: "Setup Complete!",
                  message:
                    "Your account has been created and device paired successfully.",
                  actionText: "Go to Login",
                  onAction: () => navigate("/login")
                });
                clearDeviceValidated();
                clearRegisterStore();
              }
            } catch {
              setModalConfig({
                isOpen: true,
                onClose: () =>
                  setModalConfig((prev) => ({ ...prev, isOpen: false })),
                variant: "banner",
                title: "Account Created!",
                message:
                  "Account created successfully. Please manually pair your device."
              });
              setShowScanner(true);
            }
          } else {
            setModalConfig({
              isOpen: true,
              onClose: () =>
                setModalConfig((prev) => ({ ...prev, isOpen: false })),
              variant: "banner",
              title: "Account Created!",
              message:
                "Account successfully created. Please pair your device to proceed."
            });
            setShowScanner(true);
          }
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
      } else if (error.response.data.error === 429) {
        setModalConfig({
          isOpen: true,
          type: "error",
          onClose: () => setModalConfig((prev) => ({ ...prev, isOpen: false })),
          variant: "banner",
          title: "Too Many Requests",
          position: "center",
          message:
            "You have made too many requests in a short period. Please wait a while before trying again."
        });
      } else {
        console.log(error);
        setModalConfig({
          isOpen: true,
          type: "error",
          onClose: () => setModalConfig((prev) => ({ ...prev, isOpen: false })),
          variant: "banner",
          title: "Network Error",
          position: "center",
          message:
            "We're having trouble connecting to the server. Please check your internet connection and try again. If the problem persists, try refreshing the page or contacting support."
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOnScan = () => {
    setModalConfig({
      isOpen: true,
      onClose: () => {
        clearRegisterStore();
        setModalConfig((prev) => ({ ...prev, isOpen: false }));
      },
      variant: "banner",
      title: "Paired Successfully",
      message: "You can now continue to login and start using your account.",
      actionText: "Proceed to Login",
      onAction: () => {
        clearRegisterStore();
        navigate("/login");
      }
    });
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
      setOtpError(
        error.response?.data?.message || "Failed to send OTP. Please try again."
      );
    } finally {
      setIsSendingOtp(false);
    }
  };

  const resendOtp = async () => {
    if (countdown > 0 || isSendingOtp) return;
    await sendOtp();
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const deviceSerial = params.get("device_serial");

    if (!deviceSerial || deviceValidated.validated) return;

    const validate = async () => {
      try {
        const { data } = await validateDeviceSerial(deviceSerial);
        setDeviceValidated({
          validated: data.reason === "ok",
          serial: deviceSerial,
          status: data.reason
        });
        setModalConfig({
          isOpen: true,
          variant: "banner",
          position: "center",
          onClose: () => setModalConfig((prev) => ({ ...prev, isOpen: false })),
          title:
            data.reason === "ok"
              ? "Device Verified"
              : data.reason === "already_paired"
                ? "Device Already Paired"
                : "Device Not Found",
          message:
            data.reason === "ok"
              ? "Your device has been successfully verified and is ready to be paired. Register your account to continue."
              : data.reason === "already_paired"
                ? "This device is already linked to another account. If you believe this is a mistake, please contact support."
                : "We couldn't locate a device with this serial code. Please check and try again."
        });
        window.history.replaceState({}, "", window.location.pathname);
      } catch (error) {
        setModalConfig({
          isOpen: true,
          variant: "banner",
          position: "center",
          title: "Invalid Device",
          message: error.message || "Invalid device. Please try again."
        });
      }
    };

    validate();

    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [deviceValidated.validated, setDeviceValidated]);

  useEffect(() => {
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  useEffect(() => {
    if (showScanner) return;
    const focusMap = {
      1: firstNameRef,
      2: streetAddressRef,
      3: otpRefs[0]
    };
    const ref = focusMap[step];
    ref?.current?.focus();
  }, [step, showScanner]);

  return (
    <>
      <>
        <div className="relative flex flex-col min-h-[calc(100vh-140px)] w-full bg-[#FDFCFA] overflow-hidden">
          {!showScanner && (
            <motion.div
              initial={{ opacity: 0, x: 100 }}
              animate={
                isAnimationDone ? { opacity: 1, x: 0 } : { opacity: 0, x: 100 }
              }
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="flex-1 flex flex-col gap-7 justify-start sm:justify-center items-center pt-[30px] sm:pt-0 pb-8 sm:pb-0 px-6"
            >
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
                      <span className="font-bold">
                        6-digit verification code
                      </span>{" "}
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
                {/* Step 1: Basic Information */}
                {step === 1 && !showScanner && (
                  <div className="space-y-3 sm:space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                      <TextField
                        ref={firstNameRef}
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
                        maxLength={50}
                        required
                      />

                      <TextField
                        className="font-poppins"
                        label={"Last Name"}
                        placeholder="Last Name..."
                        name="lastName"
                        value={formData.lastName}
                        onChange={(e) =>
                          handleChange("lastName", e.target.value)
                        }
                        inputClassName="py-3"
                        error={errors.lastName}
                        maxLength={50}
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
                      maxLength={20}
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
                      maxLength={20}
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
                      maxLength={20}
                      required
                    />
                  </div>
                )}

                {/* Step 2: Address Information */}
                {step === 2 && !showScanner && (
                  <div className="space-y-4">
                    {/* Lot No./Bldg./Street and Province - Side by side */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <TextField
                        ref={streetAddressRef}
                        className="whitespace-nowrap "
                        label={"Lot No./Bldg./Street"}
                        placeholder="Enter your Lot No..."
                        name="streetAddress"
                        value={formData.streetAddress}
                        onChange={(e) =>
                          handleChange("streetAddress", e.target.value)
                        }
                        error={errors.streetAddress}
                        maxLength={50}
                        required
                      />

                      <SelectField
                        label={"Province"}
                        placeholder="Province..."
                        required
                        onChange={(e) => {
                          handleSelectChange("province", e.target.value);
                        }}
                        options={[
                          { value: "Metro Manila", label: "Metro Manila" }
                        ]}
                        value={"Metro Manila"}
                        disabled
                        error={errors.province}
                      />
                    </div>

                    {/* Barangay and City - Side by side */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <SelectField
                        className="font-poppins "
                        label={"City"}
                        placeholder="City..."
                        required
                        onChange={(e) => {
                          handleSelectChange("barangay", e.target.value);
                        }}
                        error={errors.city}
                        options={[
                          { value: "Quezon City", label: "Quezon City" }
                        ]}
                        value="Quezon City"
                        disabled
                      />
                      <SelectField
                        className="font-poppins"
                        label={"Barangay"}
                        placeholder="Barangay..."
                        required
                        disabled
                        onChange={(e) => {
                          handleSelectChange("barangay", e.target.value);
                        }}
                        options={[
                          { value: "San Bartolome", label: "San Bartolome" }
                        ]}
                        value={"San Bartolome"}
                        error={errors.barangay}
                      />
                    </div>

                    <SelectField
                      label={"Village"}
                      placeholder="Village..."
                      required
                      onChange={(e) => {
                        handleSelectChange("barangay", e.target.value);
                      }}
                      options={[
                        {
                          value: "Saint Francis Village",
                          label: "Saint Francis Village"
                        }
                      ]}
                      value={"Saint Francis Village"}
                      disabled
                      error={errors.barangay}
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
                      maxLength={50}
                      required
                    />
                  </div>
                )}

                {/* Step 3: OTP Verification */}
                {step === 3 && !showScanner && (
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
                          inputMode="numeric"
                          onChange={(e) =>
                            handleOtpChange(index, e.target.value)
                          }
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

                {step === 2 && !showScanner && (
                  <div className="captcha-container">
                    {captchaLoading && (
                      <p className="text-center text-gray-500 mb-2">
                        Loading CAPTCHA...
                      </p>
                    )}

                    <ReCAPTCHA
                      sitekey={import.meta.env.VITE_CAPTCHA_KEY}
                      onChange={(value) => {
                        setCaptchaValue(value);
                        if (errors.captcha)
                          setErrors((prev) => ({ ...prev, captcha: "" }));
                      }}
                      asyncScriptOnLoad={() => setCaptchaLoading(false)}
                    />
                    {errors.captcha && (
                      <p className="font-poppins text-[#CE4B34] text-sm mt-2">
                        {errors.captcha}
                      </p>
                    )}
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
                      // disabled={
                      //   isSubmitting ||
                      //   hasStepErrors() ||
                      //   (step === 2 && !captchaValue && !isBackendEnabled)
                      // }
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
                        disabled={isSubmitting || isSendingOtp}
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
              </motion.form>
            </motion.div>
          )}

          {showScanner && (
            <div className="flex flex-col gap-7 sm:justify-center items-center pt-[30px] sm:pt-5 pb-8 sm:pb-5 px-6">
              <div className="space-y-2">
                <h1 className="text-4xl sm:text-3xl lg:text-4xl font-bold text-[#1C253C] text-center">
                  Scan your iCane Device
                </h1>
                <p className="text-[#1C253C] text-paragraph text-1xl text-center">
                  Point your camera at the QR code on your iCane device to pair
                  it automatically.
                </p>
              </div>

              <ScannerCamera
                onSuccess={handleOnScan}
                showOnSuccessToast={false}
                guardianId={guardianId}
              />
            </div>
          )}
        </div>
      </>

      {isSubmitting && (
        <div className="absolute inset-0 sm:inset-y-0 sm:left-0 w-full sm:w-1/2 flex items-center justify-center z-30">
          <Loader size="large" color="#FDFCFA" />
        </div>
      )}

      <Modal
        isOpen={modalConfig.isOpen}
        onClose={modalConfig.onClose}
        modalType={modalConfig.modalType}
        position={modalConfig.position}
        actionText={modalConfig.actionText}
        title={modalConfig.title}
        message={modalConfig.message}
        variant={modalConfig.variant}
        onAction={modalConfig.onAction}
      />

      <TermsAndConditions
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
        onAccept={async () => {
          setTermsAccepted(true);
          setShowTermsModal(false);
          setIsSubmitting(true);
          try {
            if (!isBackendEnabled) {
              setStep(3);
              return;
            }
            await checkCredentialsApi({
              email: formData.email,
              contact_number: formData.contactNumber
            });
            await sendOtp();
            setStep(3);
          } catch (error) {
            const errorMessage =
              error.response?.data?.message ||
              error.message ||
              "Validation failed";
            if (errorMessage.includes("Email")) {
              setErrors((prev) => ({
                ...prev,
                email: "Email already registered"
              }));
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
            } else {
              setModalConfig({
                isOpen: true,
                onClose: () =>
                  setModalConfig((prev) => ({ ...prev, isOpen: false })),
                title: "Error",
                message: errorMessage,
                modalType: "error"
              });
            }
          } finally {
            setIsSubmitting(false);
          }
        }}
      />
    </>
  );
};

export default Register;
