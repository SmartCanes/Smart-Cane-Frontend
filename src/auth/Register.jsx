import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import TextField from "../ui/components/TextField";
import SelectField from "../ui/components/SelectField";
import PasswordField from "../ui/components/PasswordField";
import PrimaryButton from "../ui/components/PrimaryButton";
import {
  checkCredentialsApi,
  logoutApi,
  registerApi,
  sendOTPApi,
  verifyOTPApi
} from "@/api/authService";
import Loader from "@/ui/components/Loader";
import { useRegisterStore } from "@/stores/useRegisterStore";
import ScannerCamera from "@/ui/components/Scanner";
import Modal from "@/ui/components/Modal";
import TermsAndConditions from "@/ui/components/TermsAndPrivacyModal";
import {
  decodeInviteToken,
  pairDevice,
  validateDeviceSerial
} from "@/api/backendService";
import { motion } from "framer-motion";
import { useUIStore } from "@/stores/useStore";
import { useTranslation } from "react-i18next";

const Register = () => {
  const { t } = useTranslation("pages");
  const isBackendEnabled = import.meta.env.VITE_BACKEND_ENABLED === "true";
  const CONTACT_NUMBER_LENGTH = 11;
  const navigate = useNavigate();
  const {
    step,
    setStep,
    formData,
    updateForm,
    setOtpSent,
    deviceValidated,
    setDeviceValidated,
    clearDeviceValidated,
    clearRegisterStore,
    showScanner,
    setShowScanner,
    setInvite,
    invite
  } = useRegisterStore();
  const { isAnimationDone } = useUIStore();

  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    onClose: () => {},
    message: "",
    modalType: null,
    onAction: null,
    autoRedirect: false
  });

  const [showTermsModal, setShowTermsModal] = useState(false);
  const [scrollTarget, setScrollTarget] = useState("terms");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpError, setOtpError] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [errors, setErrors] = useState({});

  const [redirectSeconds, setRedirectSeconds] = useState(null);
  const otpRefs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];
  const countdownRef = useRef(null);
  const firstNameRef = useRef(null);
  const streetAddressRef = useRef(null);
  const inviteMode = invite.valid;
  const registerSelectLabelClassName =
    "text-[15px] sm:text-[17px] mb-1.5 sm:mb-2";
  const registerSelectInputClassName =
    "px-4 sm:px-5 py-3 sm:py-3.5 text-sm sm:text-base rounded-customradius";

  const validateField = (name, value) => {
    switch (name) {
      case "firstName":
        if (!value.trim())
          return t("auth.register.validation.firstNameRequired", {
            defaultValue: "First Name is required"
          });
        if (!/^[a-zA-Z\s]+$/.test(value))
          return t("auth.register.validation.lettersAndSpacesOnly", {
            defaultValue: "Should contain only letters and spaces"
          });
        if (value.length < 2)
          return t("auth.register.validation.minTwoChars", {
            defaultValue: "Should be at least 2 characters long"
          });
        if (value.length > 50)
          return t("auth.register.validation.maxFiftyChars", {
            defaultValue: "Should not exceed 50 characters"
          });
        return "";

      case "middleName":
        if (!value) return "";
        if (!/^[a-zA-Z\s]+$/.test(value))
          return t("auth.register.validation.lettersAndSpacesOnly", {
            defaultValue: "Should contain only letters and spaces"
          });
        if (value.length < 2)
          return t("auth.register.validation.minTwoChars", {
            defaultValue: "Should be at least 2 characters long"
          });
        if (value.length > 50)
          return t("auth.register.validation.maxFiftyChars", {
            defaultValue: "Should not exceed 50 characters"
          });
        return "";

      case "lastName":
        if (!value.trim())
          return t("auth.register.validation.lastNameRequired", {
            defaultValue: "Last Name is required"
          });
        if (!/^[a-zA-Z\s]+$/.test(value))
          return t("auth.register.validation.lettersAndSpacesOnly", {
            defaultValue: "Should contain only letters and spaces"
          });
        if (value.length < 2)
          return t("auth.register.validation.minTwoChars", {
            defaultValue: "Should be at least 2 characters long"
          });
        if (value.length > 50)
          return t("auth.register.validation.maxFiftyChars", {
            defaultValue: "Should not exceed 50 characters"
          });
        return "";

      case "username": {
        if (!value.trim())
          return t("auth.register.validation.usernameRequired", {
            defaultValue: "Username is required"
          });
        if (value.length < 3)
          return t("auth.register.validation.usernameMinThree", {
            defaultValue: "Username must be at least 3 characters long"
          });
        if (value.length > 20)
          return t("auth.register.validation.usernameMaxTwenty", {
            defaultValue: "Username must not exceed 20 characters"
          });
        if (!/^[a-zA-Z0-9_]+$/.test(value))
          return t("auth.register.validation.usernameAllowedChars", {
            defaultValue:
              "Username can only contain letters, numbers, and underscores"
          });

        const letterCount = (value.match(/[a-zA-Z]/g) || []).length;
        if (letterCount < 3)
          return t("auth.register.validation.usernameMinLetters", {
            defaultValue: "Username must contain at least 3 letters"
          });

        return "";
      }

      case "password":
        if (!value)
          return t("auth.register.validation.passwordRequired", {
            defaultValue: "Password is required"
          });
        if (value.length < 8)
          return t("auth.register.validation.passwordMinEight", {
            defaultValue: "Password must be at least 8 characters long"
          });
        if (value.length > 64)
          return t("auth.register.validation.passwordMaxSixtyFour", {
            defaultValue: "Password must not exceed 64 characters"
          });
        if (!/(?=.*[a-z])/.test(value))
          return t("auth.register.validation.passwordNeedsLowercase", {
            defaultValue: "Password must contain at least one lowercase letter"
          });
        if (!/(?=.*[A-Z])/.test(value))
          return t("auth.register.validation.passwordNeedsUppercase", {
            defaultValue: "Password must contain at least one uppercase letter"
          });
        if (!/(?=.*\d)/.test(value))
          return t("auth.register.validation.passwordNeedsNumber", {
            defaultValue: "Password must contain at least one number"
          });
        if (!/(?=.*[@$!%*?&])/.test(value))
          return t("auth.register.validation.passwordNeedsSpecial", {
            defaultValue:
              "Password must contain at least one special character (@$!%*?&)"
          });
        return "";

      case "confirmPassword":
        if (!value)
          return t("auth.register.validation.confirmPasswordRequired", {
            defaultValue: "Confirm Password is required"
          });
        if (value !== formData.password)
          return t("auth.register.validation.passwordsDontMatch", {
            defaultValue: "Passwords don't match!"
          });
        return "";

      case "streetAddress":
        if (!value.trim())
          return t("auth.register.validation.streetAddressRequired", {
            defaultValue: "Street Address is required"
          });
        if (value.length < 5)
          return t("auth.register.validation.addressMoreSpecific", {
            defaultValue: "Address should be more specific"
          });
        if (value.length > 100)
          return t("auth.register.validation.addressMaxHundred", {
            defaultValue: "Address should not exceed 100 characters"
          });
        return "";

      case "email":
        if (!value.trim())
          return t("auth.register.validation.emailRequired", {
            defaultValue: "Email is required"
          });
        if (value.length > 100)
          return t("auth.register.validation.emailMaxHundred", {
            defaultValue: "Email should not exceed 100 characters"
          });
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
          return t("auth.register.validation.validEmail", {
            defaultValue: "Please enter a valid email address"
          });
        return "";

      case "contactNumber":
        if (!value)
          return t("auth.register.validation.contactNumberRequired", {
            defaultValue: "Contact Number is required"
          });
        if (value.length !== CONTACT_NUMBER_LENGTH)
          return t("auth.register.validation.contactDigits", {
            defaultValue: "Contact number must be {{count}} digits",
            count: CONTACT_NUMBER_LENGTH
          });
        if (!/^09\d{9}$/.test(value))
          return t("auth.register.validation.contactStarts09", {
            defaultValue:
              "Contact number must start with 09 and contain 11 digits"
          });
        return "";

      default:
        return "";
    }
  };

  const handleChange = (name, value) => {
    if (
      (name === "firstName" || name === "lastName" || name === "middleName") &&
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
  };

  const handleBlur = (name) => {
    const error = validateField(name, formData[name]);
    if (error) {
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  const preventClipboardAction = (event) => {
    event.preventDefault();
  };

  const handleSelectChange = (name, value) => handleChange(name, value);

  const validateStep = (stepNumber) => {
    const newErrors = {};

    if (stepNumber === 1) {
      const step1Fields = [
        "firstName",
        "middleName",
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
            setScrollTarget("terms");
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

          if (inviteMode) {
            const accountPayload = {
              username: formData.username,
              password: formData.password,
              first_name: formData.firstName,
              middle_name: formData.middleName,
              last_name: formData.lastName,
              email: formData.email,
              contact_number: formData.contactNumber,
              province: "Metro Manila",
              village: "Saint Francis",
              city: "Quezon City",
              barangay: "San Bartolome",
              street_address: formData.streetAddress,
              invite_token: invite.token
            };

            await registerApi(accountPayload);

            setModalConfig({
              isOpen: true,
              onClose: () =>
                setModalConfig((prev) => ({ ...prev, isOpen: false })),
              variant: "banner",
              title: t("auth.register.modal.inviteCreatedTitle", {
                defaultValue: "Account Created via Invite!"
              }),
              message: t("auth.register.modal.inviteCreatedMessage", {
                defaultValue:
                  "Your account has been created successfully using the invite link."
              }),
              actionText: t("auth.register.modal.goToLogin", {
                defaultValue: "Go to Login"
              }),
              onAction: () => navigate("/login")
            });
            clearDeviceValidated();
            clearRegisterStore();
            break;
          }

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
              title: t("auth.register.modal.accountCreatedTitle", {
                defaultValue: "Account Created!"
              }),
              message: t("auth.register.modal.accountCreatedPairMessage", {
                defaultValue:
                  "Account successfully created. Please pair your device to proceed."
              })
            });
            setShowScanner(true);
            break;
          }

          const otpCode = otp.join("");
          if (otpCode.length !== 6) {
            setOtpError(
              t("auth.register.validation.otpSixDigits", {
                defaultValue: "Please enter the complete 6-digit OTP"
              })
            );
            break;
          }

          await verifyOTPApi(formData.email, otpCode);

          const accountPayload = {
            username: formData.username,
            password: formData.password,
            first_name: formData.firstName,
            middle_name: formData.middleName,
            last_name: formData.lastName,
            email: formData.email,
            contact_number: formData.contactNumber,
            province: "Metro Manila",
            village: "Saint Francis",
            city: "Quezon City",
            barangay: "San Bartolome",
            street_address: formData.streetAddress
          };

          await registerApi(accountPayload);

          if (deviceValidated.status === "ok" && deviceValidated.serial) {
            try {
              const res = await pairDevice({
                device_serial_number: deviceValidated.serial
              });

              if (res.success) {
                setModalConfig({
                  isOpen: true,
                  onClose: () =>
                    setModalConfig((prev) => ({ ...prev, isOpen: false })),
                  variant: "banner",
                  title: t("auth.register.modal.setupCompleteTitle", {
                    defaultValue: "Setup Complete!"
                  }),
                  message: t("auth.register.modal.setupCompleteMessage", {
                    defaultValue:
                      "Your account has been created and device paired successfully."
                  }),
                  actionText: t("auth.register.modal.goToLogin", {
                    defaultValue: "Go to Login"
                  }),
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
                title: t("auth.register.modal.accountCreatedTitle", {
                  defaultValue: "Account Created!"
                }),
                message: t("auth.register.modal.manualPairMessage", {
                  defaultValue:
                    "Account created successfully. Please manually pair your device."
                })
              });
              setShowScanner(true);
            }
          } else {
            setModalConfig({
              isOpen: true,
              onClose: () =>
                setModalConfig((prev) => ({ ...prev, isOpen: false })),
              variant: "banner",
              title: t("auth.register.modal.accountCreatedTitle", {
                defaultValue: "Account Created!"
              }),
              message: t("auth.register.modal.accountCreatedPairMessage", {
                defaultValue:
                  "Account successfully created. Please pair your device to proceed."
              })
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
        error.response?.data?.message ||
        error.message ||
        t("auth.register.errors.generic", {
          defaultValue: "Registration failed"
        });
      if (errorMessage.includes("Username")) {
        setErrors((prev) => ({
          ...prev,
          username: t("auth.register.errors.usernameTaken", {
            defaultValue: "Username already taken"
          })
        }));
        document
          .querySelector('[name="username"]')
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
        document.querySelector('[name="username"]')?.focus();
      } else if (errorMessage.includes("Email")) {
        setErrors((prev) => ({
          ...prev,
          email: t("auth.register.errors.emailRegistered", {
            defaultValue: "Email already registered"
          })
        }));
        document
          .querySelector('[name="email"]')
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
        document.querySelector('[name="email"]')?.focus();
      } else if (errorMessage.includes("Contact number")) {
        setErrors((prev) => ({
          ...prev,
          contactNumber: t("auth.register.errors.contactRegistered", {
            defaultValue: "Contact number is already registered"
          })
        }));
        document
          .querySelector('[name="contactNumber"]')
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
        document.querySelector('[name="contactNumber"]')?.focus();
      } else if (errorMessage.includes("OTP")) {
        setOtpError(errorMessage);
      } else if (error?.response?.data?.error === 429) {
        setModalConfig({
          isOpen: true,
          type: "error",
          onClose: () => setModalConfig((prev) => ({ ...prev, isOpen: false })),
          variant: "banner",
          title: t("auth.register.modal.tooManyRequestsTitle", {
            defaultValue: "Too Many Requests"
          }),
          position: "center",
          message: t("auth.register.modal.tooManyRequestsMessage", {
            defaultValue:
              "You have made too many requests in a short period. Please wait a while before trying again."
          })
        });
      } else {
        console.log(error);
        setModalConfig({
          isOpen: true,
          type: "error",
          onClose: () => setModalConfig((prev) => ({ ...prev, isOpen: false })),
          variant: "banner",
          title: t("auth.register.modal.networkErrorTitle", {
            defaultValue: "Network Error"
          }),
          position: "center",
          message: t("auth.register.modal.networkErrorMessage", {
            defaultValue:
              "We're having trouble connecting to the server. Please check your internet connection and try again. If the problem persists, try refreshing the page or contacting support."
          })
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOnScan = async () => {
    try {
      await logoutApi();
    } catch (err) {
      console.warn("Logout failed, continuing anyway", err);
    }
    setRedirectSeconds(10);
    setModalConfig({
      isOpen: true,
      // onClose: () => {
      //   clearRegisterStore();
      //   setModalConfig((prev) => ({ ...prev, isOpen: false }));
      // },
      variant: "banner",
      title: t("auth.register.modal.pairedSuccessfullyTitle", {
        defaultValue: "Paired Successfully"
      }),
      actionText: t("auth.register.modal.proceedToLogin", {
        defaultValue: "Proceed to Login"
      }),
      onAction: () => {
        clearRegisterStore();
        navigate("/login");
      },
      autoRedirect: true
    });
  };

  useEffect(() => {
    if (!modalConfig.isOpen || !modalConfig.autoRedirect) return;
    if (redirectSeconds === null) return;

    if (redirectSeconds === 0) {
      clearRegisterStore();
      navigate("/login");
      return;
    }

    const timer = setTimeout(() => {
      setRedirectSeconds((s) => s - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [modalConfig.isOpen, modalConfig.autoRedirect, redirectSeconds]);

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
        error.response?.data?.message ||
          t("auth.register.errors.otpSendFailed", {
            defaultValue: "Failed to send OTP. Please try again."
          })
      );
    } finally {
      setIsSendingOtp(false);
    }
  };

  const resendOtp = async () => {
    if (countdown > 0 || isSendingOtp) return;
    await sendOtp();
  };

  const buildEmergencyState = (payload, fallbackSerial) => {
    const data = payload?.data || payload || {};
    const selectedDevice =
      data.selectedDevice || data.device || data.deviceData || null;
    const vip =
      selectedDevice?.vip ||
      data.vip ||
      data.vips?.[0] ||
      data.emergencyInfo?.vip ||
      null;
    const guardians =
      data.guardians ||
      (data.guardian ? [data.guardian] : null) ||
      data.emergencyContacts ||
      data.deviceGuardians ||
      data.emergencyInfo?.guardians ||
      [];

    return {
      vip: {
        firstName: vip?.firstName || vip?.first_name || "",
        lastName: vip?.lastName || vip?.last_name || "",
        bloodType: vip?.bloodType || vip?.blood_type || null,
        medicalNotes: vip?.medicalNotes || vip?.medical_notes || null,
        contactNumber: vip?.contactNumber || vip?.contact_number || null,
        email: vip?.email || null
      },
      device: {
        deviceId: selectedDevice?.deviceId || selectedDevice?.device_id || null,
        deviceSerialNumber:
          selectedDevice?.deviceSerialNumber ||
          selectedDevice?.device_serial_number ||
          fallbackSerial
      },
      guardians,
      source: "register_qr"
    };
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const deviceSerial = params.get("device_serial");

    if (!deviceSerial || deviceValidated.validated) return;

    const validate = async () => {
      try {
        const { data } = await validateDeviceSerial(deviceSerial);
        if (data.reason === "already_paired_with_vip") {
          window.history.replaceState({}, "", window.location.pathname);
          navigate("/emergency", {
            replace: true,
            state: {
              emergencyData: buildEmergencyState(data, deviceSerial)
            }
          });
          return;
        }

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
              ? t("auth.register.modal.deviceVerifiedTitle", {
                  defaultValue: "Device Verified"
                })
              : data.reason === "already_paired"
                ? t("auth.register.modal.deviceAlreadyPairedTitle", {
                    defaultValue: "Device Already Paired"
                  })
                : t("auth.register.modal.deviceNotFoundTitle", {
                    defaultValue: "Device Not Found"
                  }),
          message:
            data.reason === "ok"
              ? t("auth.register.modal.deviceVerifiedMessage", {
                  defaultValue:
                    "Your device has been successfully verified and is ready to be paired. Register your account to continue."
                })
              : data.reason === "already_paired"
                ? t("auth.register.modal.deviceAlreadyPairedMessage", {
                    defaultValue:
                      "This device is already linked to another account. If you believe this is a mistake, please contact support."
                  })
                : t("auth.register.modal.deviceNotFoundMessage", {
                    defaultValue:
                      "We couldn't locate a device with this serial code. Please check and try again."
                  })
        });
        window.history.replaceState({}, "", window.location.pathname);
      } catch (error) {
        setModalConfig({
          isOpen: true,
          variant: "banner",
          position: "center",
          title: t("auth.register.modal.invalidDeviceTitle", {
            defaultValue: "Invalid Device"
          }),
          message:
            error.message ||
            t("auth.register.modal.invalidDeviceMessage", {
              defaultValue: "Invalid device. Please try again."
            })
        });
      }
    };

    validate();

    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [deviceValidated.validated, setDeviceValidated]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const inviteToken = params.get("invite_token");

    if (!inviteToken) return;

    const decode = async () => {
      const res = await decodeInviteToken(inviteToken);

      if (res?.data?.email) {
        updateForm("email", res.data.email);
        setInvite({ token: inviteToken, email: res.data.email });
      }

      window.history.replaceState({}, "", window.location.pathname);
    };

    decode();
  }, []);

  useEffect(() => {
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  useEffect(() => {
    if (showScanner) return;
    const isDesktop = window.matchMedia
      ? window.matchMedia("(min-width: 640px)").matches
      : window.innerWidth >= 640;
    if (!isDesktop) return;
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
              initial={{ opacity: 0, y: 18 }}
              animate={
                isAnimationDone ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }
              }
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="flex-1 flex flex-col gap-6 sm:gap-7 justify-start sm:justify-center items-center pt-4 sm:pt-8 pb-6 sm:pb-8 px-4 sm:px-6 transform-gpu will-change-transform"
            >
              <div className="text-center space-y-2 ">
                <h1 className="hidden sm:block text-3xl md:text-4xl lg:text-5xl font-bold text-[#1C253C]">
                  {step === 3
                    ? t("auth.register.verifyHeading")
                    : t("auth.register.heading")}
                </h1>
                <p className="hidden sm:block font-poppins text-[#1C253C] text-paragraph text-1xl">
                  {step === 1 ? (
                    t("auth.register.step1Description")
                  ) : step === 2 ? (
                    t("auth.register.step2Description")
                  ) : (
                    <>
                      {t("auth.register.verifyPrefix")} {" "}
                      <span className="font-bold">
                        {t("auth.register.verifyCodeLabel")}
                      </span>{" "}
                      {t("auth.register.verifySuffix")}
                      <br />
                      <span className="text-sm text-gray-600">
                        {formData.email}
                      </span>
                    </>
                  )}
                </p>
                <p className="sm:hidden text-[#1C253C] text-base">
                  {t("auth.register.mobileHeading")}
                </p>
                {step === 3 && (
                  <p className="sm:hidden font-poppins text-[#1C253C] text-paragraph text-sm">
                    {t("auth.register.verifyPrefix")} {" "}
                    <span className="font-bold">
                      {t("auth.register.verifyCodeLabel")}
                    </span>{" "}
                    {t("auth.register.verifySuffix")}
                  </p>
                )}
              </div>
              <motion.form
                initial={{ opacity: 0, y: 16 }}
                animate={
                  isAnimationDone ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }
                }
                transition={{
                  duration: 0.4,
                  ease: [0.22, 1, 0.36, 1],
                  delay: 0.05
                }}
                className="w-full max-w-md sm:max-w-none lg:max-w-lg transform-gpu will-change-transform"
                onSubmit={handleNext}
                noValidate
              >
                {/* Step 1: Basic Information */}
                {step === 1 && !showScanner && (
                  <div className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 gap-5 sm:gap-3.5">
                      <TextField
                        ref={firstNameRef}
                        className="font-poppins"
                        label={t("auth.register.firstName")}
                        placeholder={t("auth.register.firstNamePlaceholder")}
                        name="firstName"
                        value={formData.firstName}
                        onChange={(e) =>
                          handleChange("firstName", e.target.value)
                        }
                        onBlur={() => handleBlur("firstName")}
                        inputClassName="py-3 sm:py-3.5"
                        error={errors.firstName}
                        reserveErrorSpace={false}
                        maxLength={50}
                        required
                      />

                      <TextField
                        ref={firstNameRef}
                        className="font-poppins"
                        label={t("auth.register.middleName")}
                        placeholder={t("auth.register.middleNamePlaceholder")}
                        name="middleName"
                        value={formData.middleName}
                        onChange={(e) =>
                          handleChange("middleName", e.target.value)
                        }
                        onBlur={() => handleBlur("middleName")}
                        inputClassName="py-3 sm:py-3.5"
                        error={errors.middleName}
                        reserveErrorSpace={false}
                        maxLength={50}
                      />
                    </div>

                    <TextField
                      className="font-poppins"
                      label={t("auth.register.lastName")}
                      placeholder={t("auth.register.lastNamePlaceholder")}
                      name="lastName"
                      value={formData.lastName}
                      onChange={(e) => handleChange("lastName", e.target.value)}
                      onBlur={() => handleBlur("lastName")}
                      inputClassName="py-3 sm:py-3.5"
                      error={errors.lastName}
                      reserveErrorSpace={false}
                      maxLength={50}
                      required
                    />

                    <TextField
                      className="font-poppins"
                      label={t("auth.register.username")}
                      placeholder={t("auth.register.usernamePlaceholder")}
                      name="username"
                      value={formData.username}
                      onChange={(e) => handleChange("username", e.target.value)}
                      onBlur={() => handleBlur("username")}
                      inputClassName="py-3 sm:py-3.5"
                      error={errors.username}
                      reserveErrorSpace={false}
                      maxLength={20}
                      required
                    />

                    <PasswordField
                      className="font-poppins"
                      label={t("auth.register.password")}
                      placeholder={t("auth.register.passwordPlaceholder")}
                      name="password"
                      value={formData.password}
                      onChange={(e) => handleChange("password", e.target.value)}
                      onBlur={() => handleBlur("password")}
                      error={errors.password}
                      showValidationRules
                      inputClassName="py-3 sm:py-3.5"
                      onPaste={preventClipboardAction}
                      onCopy={preventClipboardAction}
                      onCut={preventClipboardAction}
                      onDrop={preventClipboardAction}
                      maxLength={20}
                      reserveErrorSpace={false}
                      required
                    />

                    <PasswordField
                      className="font-poppins"
                      label={t("auth.register.confirmPassword")}
                      placeholder={t("auth.register.confirmPasswordPlaceholder")}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={(e) =>
                        handleChange("confirmPassword", e.target.value)
                      }
                      onBlur={() => handleBlur("confirmPassword")}
                      error={errors.confirmPassword}
                      inputClassName="py-3 sm:py-3.5"
                      onPaste={preventClipboardAction}
                      onCopy={preventClipboardAction}
                      onCut={preventClipboardAction}
                      onDrop={preventClipboardAction}
                      maxLength={20}
                      reserveErrorSpace={false}
                      required
                    />
                  </div>
                )}

                {/* Step 2: Address Information */}
                {step === 2 && !showScanner && (
                  <div className="space-y-5">
                    {/* Lot No./Bldg./Street and Province - Side by side */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                      <TextField
                        ref={streetAddressRef}
                        className="whitespace-nowrap "
                        label={t("auth.register.streetAddress")}
                        placeholder={t("auth.register.streetAddressPlaceholder")}
                        name="streetAddress"
                        value={formData.streetAddress}
                        onChange={(e) =>
                          handleChange("streetAddress", e.target.value)
                        }
                        onBlur={() => handleBlur("streetAddress")}
                        inputClassName="py-3 sm:py-3.5"
                        error={errors.streetAddress}
                        reserveErrorSpace={false}
                        maxLength={50}
                      />

                      <SelectField
                        label={t("auth.register.province")}
                        labelClassName={registerSelectLabelClassName}
                        inputClassName={registerSelectInputClassName}
                        placeholder={t("auth.register.placeholders.province", {
                          defaultValue: "Province..."
                        })}
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <SelectField
                        className="font-poppins "
                        label={t("auth.register.city")}
                        labelClassName={registerSelectLabelClassName}
                        inputClassName={registerSelectInputClassName}
                        placeholder={t("auth.register.placeholders.city", {
                          defaultValue: "City..."
                        })}
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
                        label={t("auth.register.barangay")}
                        labelClassName={registerSelectLabelClassName}
                        inputClassName={registerSelectInputClassName}
                        placeholder={t("auth.register.placeholders.barangay", {
                          defaultValue: "Barangay..."
                        })}
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
                      label={t("auth.register.village")}
                      labelClassName={registerSelectLabelClassName}
                      inputClassName={registerSelectInputClassName}
                      placeholder={t("auth.register.placeholders.village", {
                        defaultValue: "Village..."
                      })}
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
                      label={t("auth.register.contactNumber")}
                      placeholder={t("auth.register.placeholders.contactNumber", {
                        defaultValue: "09XX XXX XXXX"
                      })}
                      type="tel"
                      name="contactNumber"
                      value={formData.contactNumber}
                      onChange={(e) =>
                        handleChange("contactNumber", e.target.value)
                      }
                      onBlur={() => handleBlur("contactNumber")}
                      inputClassName="py-3 sm:py-3.5"
                      inputMode="numeric"
                      maxLength={11}
                      error={errors.contactNumber}
                      reserveErrorSpace={false}
                      required
                    />

                    {/* Email Address - Full width */}
                    <TextField
                      className="font-poppins"
                      label={t("auth.register.email")}
                      placeholder={t("auth.register.placeholders.email", {
                        defaultValue: "sample.email@gmail.com"
                      })}
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      onBlur={() => handleBlur("email")}
                      inputClassName="py-3 sm:py-3.5"
                      error={errors.email}
                      reserveErrorSpace={false}
                      maxLength={50}
                      disabled={inviteMode}
                      required
                    />
                  </div>
                )}

                {/* Step 3: OTP Verification */}
                {step === 3 && !showScanner && (
                  <div className="space-y-6">
                    {/* OTP Input Boxes */}
                    <div className="flex justify-center gap-2 lg:gap-3">
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
                          className="w-10 h-10 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 text-center text-xl lg:text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-primary-100 focus:outline-none"
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
                        {t("auth.register.noCode")}
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
                          ? t("auth.register.sending")
                          : countdown > 0
                            ? t("auth.register.resendIn", { seconds: countdown })
                            : t("auth.register.resend")}
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
                          ? step === 3 || (step === 2 && inviteMode)
                            ? t("auth.register.creating")
                            : t("auth.register.checking")
                          : `${
                              step === 3 || (step === 2 && inviteMode)
                                ? t("auth.register.createAccount")
                                : t("auth.register.next")
                            }`
                      }
                      type="submit"
                      disabled={isSubmitting || hasStepErrors()}
                    />
                    {step > 1 && (
                      <PrimaryButton
                        className="w-full py-3 sm:py-4 text-md sm:text-[18px]"
                        textColor="text-black"
                        text={t("auth.register.back")}
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
              </motion.form>

              <p className="text-center text-base sm:text-[18px]">
                {t("auth.register.haveAccount")} {" "}
                <Link
                  to="/login"
                  className="font-poppins text-blue-500 hover:underline text-base sm:text-[18px]"
                >
                  {t("auth.register.signIn")}
                </Link>
              </p>

              {step <= 2 && (
                <p className="text-center text-sm sm:text-md">
                  {t("auth.register.termsPrefix")} {" "}
                  <button
                    onClick={() => {
                      setShowTermsModal(true);
                      setScrollTarget("terms");
                    }}
                    className="text-blue-500 hover:underline"
                  >
                    {t("auth.register.terms")}
                  </button>{" "}
                  {t("auth.register.and")} {" "}
                  <button
                    onClick={() => {
                      setShowTermsModal(true);
                      setScrollTarget("privacy");
                    }}
                    className="text-blue-500 hover:underline"
                  >
                    {t("auth.register.privacy")}
                  </button>
                </p>
              )}
            </motion.div>
          )}

          {showScanner && (
            <div className="flex flex-col gap-6 sm:gap-7 sm:justify-center items-center pt-4 sm:pt-5 pb-6 sm:pb-5 px-4 sm:px-6">
              <div className="space-y-2">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#1C253C] text-center">
                  {t("auth.register.scanTitle")}
                </h1>
                <p className="text-[#1C253C] text-sm sm:text-base text-center">
                  {t("auth.register.scanDescription")}
                </p>
              </div>

              <ScannerCamera onSuccess={handleOnScan} />
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
        message={
          modalConfig.autoRedirect ? (
            <div className="space-y-2">
              <p className="text-sm text-gray-700 mt-1">
                {t("auth.register.modal.continueToLogin")}
              </p>
              <p className="text-sm opacity-70">
                {t("auth.register.modal.redirecting", { seconds: redirectSeconds })}
              </p>
            </div>
          ) : (
            modalConfig.message
          )
        }
        variant={modalConfig.variant}
        onAction={modalConfig.onAction}
      />

      {step <= 2 && (
        <TermsAndConditions
          isChecked={termsAccepted}
          setIsChecked={setTermsAccepted}
          scrollTo={scrollTarget}
          isOpen={showTermsModal}
          onClose={() => {
            setTermsAccepted(false);
            setShowTermsModal(false);
          }}
          onAccept={() => {
            setTermsAccepted(true);
            setShowTermsModal(false);
          }}
        />
      )}
    </>
  );
};

export default Register;
