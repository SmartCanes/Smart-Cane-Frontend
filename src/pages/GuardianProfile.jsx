import { useUserStore } from "@/stores/useStore";
import { useState, useEffect, useRef } from "react";
import avatarPlaceholder from "@/assets/images/default-profile.jpg";
import { Icon } from "@iconify/react";
import TextField from "@/ui/components/TextField";
import SelectField from "@/ui/components/SelectField";
import Toast from "@/ui/components/Toast";
import {
  updateGuardian,
  uploadProfileImage,
  requestEmailChangeOTP,
  verifyEmailChangeOTP
} from "@/api/backendService.js";

const relationshipOptions = [
  { value: "Husband", label: "Husband" },
  { value: "Wife", label: "Wife" },
  { value: "Sibling", label: "Sibling" },
  { value: "Legal Guardian", label: "Legal Guardian" },
  { value: "Other", label: "Other" }
];

const validateName = (name) => {
  const nameRegex = /^[A-Za-z\s.,]+(?: (?:Jr\.?|Sr\.?|I{1,3}|IV))?$/i;
  return nameRegex.test(name.trim());
};

const validatePhone = (phone) => {
  const phoneRegex = /^\d{11}$/;
  return phoneRegex.test(phone.trim());
};

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

export const GuardianProfile = () => {
  const isBackendEnabled = import.meta.env.VITE_BACKEND_ENABLED === "true";
  const { user, setUser } = useUserStore();

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Icon
            icon="eos-icons:loading"
            className="w-12 h-12 text-[#11285A] mx-auto mb-4"
          />
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  const [profile, setProfile] = useState({
    guardianName: user.guardian_name,
    email: user.email,
    phone: user.contact_number,
    relationship: user.relationship,
    region: user.region || "",
    province: user.province || "",
    city: user.city || "",
    barangay: user.barangay || "",
    village: user.village || "",
    streetAddress: user.street_address || ""
  });

  const [isEditMode, setIsEditMode] = useState(false);
  const [toastConfig, setToastConfig] = useState({
    message: "",
    type: "info"
  });
  const [showToast, setShowToast] = useState(false);

  const [showOTPModal, setShowOTPModal] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpTimer, setOtpTimer] = useState(300);
  const [canResendOTP, setCanResendOTP] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [originalEmail, setOriginalEmail] = useState(user?.email || "");
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);
  const [isSendingOTP, setIsSendingOTP] = useState(false);
  const [isVerifyingOTP, setIsVerifyingOTP] = useState(false);

  const [profileImage, setProfileImage] = useState(avatarPlaceholder);
  const [imageFile, setImageFile] = useState(null);
  const [imageError, setImageError] = useState("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef(null);

  const [errors, setErrors] = useState({
    guardianName: "",
    email: "",
    phone: ""
  });

  const otpInputRefs = useRef([]);

  useEffect(() => {
    let timer;
    if (showOTPModal && otpTimer > 0) {
      timer = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    } else if (otpTimer === 0) {
      setCanResendOTP(true);
    }
    return () => clearInterval(timer);
  }, [showOTPModal, otpTimer]);

  useEffect(() => {
    if (user?.guardian_image_url) {
      let fullUrl = user.guardian_image_url;

      if (
        !user.guardian_image_url.startsWith("http") &&
        !user.guardian_image_url.startsWith("blob:")
      ) {
        fullUrl = `http://localhost:5000/uploads/${user.guardian_image_url}`;
      }

      setProfileImage(fullUrl);
    } else {
      setProfileImage(avatarPlaceholder);
    }
  }, [user?.guardian_image_url]);

  const handleProfileChange = ({ target }) => {
    const { name, value } = target;

    if (name === "phone") {
      const digitsOnly = value.replace(/\D/g, "");
      setProfile((prev) => ({ ...prev, [name]: digitsOnly }));
    } else {
      setProfile((prev) => ({ ...prev, [name]: value }));
    }

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      setImageError("Image must not exceed 2MB");
      return;
    }

    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
    if (!validTypes.includes(file.type)) {
      setImageError("Please upload a valid image file (JPEG, PNG, GIF)");
      return;
    }

    setImageError("");
    const imageUrl = URL.createObjectURL(file);
    setProfileImage(imageUrl);
    setImageFile(file);

    setToastConfig({
      message: "Profile image selected. Click Save to upload.",
      type: "success"
    });
    setShowToast(true);
  };

  const handleRemoveImage = () => {
    setProfileImage(avatarPlaceholder);
    setImageFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    setToastConfig({
      message: "Profile image removed",
      type: "info"
    });
    setShowToast(true);
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const validateForm = () => {
    const newErrors = {
      guardianName: "",
      email: "",
      phone: ""
    };

    let isValid = true;

    if (!profile.guardianName.trim()) {
      newErrors.guardianName = "Full name is required";
      isValid = false;
    } else if (!validateName(profile.guardianName)) {
      newErrors.guardianName =
        "Name can only contain letters, spaces, and suffixes like Jr, II, III, IV";
      isValid = false;
    }

    if (!profile.phone.trim()) {
      newErrors.phone = "Phone number is required";
      isValid = false;
    } else if (!validatePhone(profile.phone)) {
      newErrors.phone = "Phone number must be exactly 11 digits";
      isValid = false;
    }

    if (!profile.email.trim()) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!validateEmail(profile.email)) {
      newErrors.email = "Please enter a valid email address";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleEditProfile = () => {
    setIsEditMode(true);
    setToastConfig({ message: "Edit mode activated", type: "info" });
    setShowToast(true);
  };

  const handleSaveProfile = async () => {
    if (!validateForm()) {
      setToastConfig({
        message: "Please fix validation errors before saving",
        type: "error"
      });
      setShowToast(true);
      return;
    }

    if (!isBackendEnabled) {
      setUser((prev) => ({
        ...prev,
        guardianName: profile.guardianName,
        email: profile.email,
        contact_number: profile.phone,
        province: profile.province,
        city: profile.city,
        barangay: profile.barangay,
        village: profile.village,
        street_address: profile.streetAddress,
        profile_image: profileImage !== avatarPlaceholder ? profileImage : null
      }));

      setIsEditMode(false);
      setToastConfig({
        message: "Profile saved locally (backend disabled)",
        type: "success"
      });
      setShowToast(true);
      return;
    }

    // Check if email changed - show OTP modal (design only)
    if (profile.email !== originalEmail) {
      setIsVerifyingEmail(true);
      await sendRealOTP();
      return;
    }

    await saveProfileData();
  };

  const sendRealOTP = async () => {
    try {
      setIsSendingOTP(true);
      setOtpError("");

      const response = await requestEmailChangeOTP(profile.email);

      if (response.success) {
        setShowOTPModal(true);
        setOtpTimer(300);
        setCanResendOTP(false);
        setOtp(["", "", "", "", "", ""]);

        setTimeout(() => {
          otpInputRefs.current[0]?.focus();
        }, 100);

        setToastConfig({
          message: "OTP sent to your new email address",
          type: "success"
        });
        setShowToast(true);
      }
    } catch (error) {
      console.error("Failed to send OTP:", error);
      setOtpError(error.message || "Failed to send OTP");
      setToastConfig({
        message: "Failed to send OTP. Please try again.",
        type: "error"
      });
      setShowToast(true);
    } finally {
      setIsSendingOTP(false);
    }
  };

  const handleOTPChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setOtpError("");

    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }

    if (newOtp.every((digit) => digit !== "") && index === 5) {
      handleVerifyOTP();
    }
  };

  const handleOTPKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOTP = async () => {
    const otpCode = otp.join("");

    if (otpCode.length !== 6) {
      setOtpError("Please enter the 6-digit code");
      return;
    }

    try {
      setIsVerifyingOTP(true);

      const response = await verifyEmailChangeOTP(profile.email, otpCode);

      if (response.success) {
        setToastConfig({
          message: "Email verified successfully",
          type: "success"
        });
        setShowToast(true);

        setShowOTPModal(false);
        setOriginalEmail(profile.email);
        setIsVerifyingEmail(false);

        await saveProfileData();
      }
    } catch (error) {
      console.error("OTP verification failed:", error);
      setOtpError(error.message || "Invalid OTP code");

      setToastConfig({
        message: "OTP verification failed",
        type: "error"
      });
      setShowToast(true);
    } finally {
      setIsVerifyingOTP(false);
    }
  };

  const saveProfileData = async () => {
    try {
      let uploadedImageUrl = null;

      if (imageFile) {
        try {
          setIsUploadingImage(true);
          const imageResponse = await uploadProfileImage(imageFile);

          if (imageResponse.success) {
            uploadedImageUrl = imageResponse.data.image_url;
            setProfileImage(uploadedImageUrl);

            setToastConfig({
              message: "Profile image uploaded successfully",
              type: "success"
            });
            setShowToast(true);
          }
        } catch (imageError) {
          console.error("Failed to upload image:", imageError);
          setToastConfig({
            message:
              "Profile saved, but image upload failed. Please try uploading the image again.",
            type: "warning"
          });
          setShowToast(true);
        } finally {
          setIsUploadingImage(false);
        }
      }

      const payload = {
        guardian_name: profile.fullName,
        email: profile.email,
        contact_number: profile.phone,
        province: profile.province,
        city: profile.city,
        barangay: profile.barangay,
        village: profile.village,
        street_address: profile.streetAddress
      };

      const response = await updateGuardian(payload);

      if (response.success) {
        const finalImageUrl = uploadedImageUrl || profileImage;

        setUser({
          ...user,
          guardian_name: profile.fullName,
          email: profile.email,
          contact_number: profile.phone,
          guardian_image_url: finalImageUrl,
          avatar: finalImageUrl,
          province: profile.province,
          city: profile.city,
          barangay: profile.barangay,
          village: profile.village,
          street_address: profile.streetAddress
        });

        setIsEditMode(false);
        setImageFile(null);

        setToastConfig({
          message: "Profile saved successfully",
          type: "success"
        });
        setShowToast(true);
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      setToastConfig({
        message: error.message || "Failed to save profile",
        type: "error"
      });
      setShowToast(true);
    }
  };

  const handleResendOTP = async () => {
    if (!canResendOTP || isSendingOTP) return;
    await sendRealOTP();
  };

  const handleCancelOTP = () => {
    if (isVerifyingEmail) {
      setProfile((prev) => ({ ...prev, email: originalEmail }));
      setIsVerifyingEmail(false);
    }
    setShowOTPModal(false);
    setOtp(["", "", "", "", "", ""]);
    setOtpTimer(300);
    setOtpError("");
    setIsSendingOTP(false);
    setIsVerifyingOTP(false);

    setToastConfig({
      message: "Email verification cancelled",
      type: "warning"
    });
    setShowToast(true);
  };

  const handleCancelEdit = () => {
    setProfile({
      fullName: user?.guardian_name || "",
      email: user?.email || "",
      phone: user?.contact_number || "",
      relationship: user?.relationship || "",
      region: user?.region || "",
      province: user?.province || "",
      city: user?.city || "",
      barangay: user?.barangay || "",
      village: user?.village || "",
      streetAddress: user?.street_address || ""
    });

    if (user?.guardian_image_url) {
      let fullUrl = user.guardian_image_url;
      if (
        !user.guardian_image_url.startsWith("http") &&
        !user.guardian_image_url.startsWith("blob:")
      ) {
        fullUrl = `http://localhost:5000/uploads/${user.guardian_image_url}`;
      }
      setProfileImage(fullUrl);
    } else {
      setProfileImage(avatarPlaceholder);
    }
    setImageFile(null);
    setImageError("");
    setIsUploadingImage(false);

    setErrors({
      fullName: "",
      email: "",
      phone: ""
    });

    setIsEditMode(false);
    setToastConfig({ message: "Changes cancelled", type: "warning" });
    setShowToast(true);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <>
      <main className="bg-white md:bg-[#f9fafb] rounded-t-[32px] md:rounded-none min-h-[calc(100vh-var(--header-height)-var(--mobile-nav-height))] md:min-h-[calc(100vh-var(--header-height))] md:max-h-[calc(100vh-var(--header-height))] overflow-y-visible md:overflow-y-auto p-6 pb-[calc(var(--mobile-nav-height)+1.5rem)] md:pb-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8 flex flex-col gap-5">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-center gap-4">
              <img
                src={profileImage}
                alt={profile.fullName}
                className="w-16 h-16 rounded-full object-cover"
              />
              <div>
                <h3 className="text-lg font-semibold text-[#11285A]">
                  {profile.fullName}
                </h3>
                <p className="text-sm text-gray-500">{profile.email}</p>
              </div>
            </div>

            {!isEditMode ? (
              <button
                onClick={handleEditProfile}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[#11285A] text-[#11285A] text-sm font-semibold hover:bg-blue-50 transition-colors"
              >
                <Icon icon="solar:pen-bold" className="text-lg" />
                Edit Profile
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleSaveProfile}
                  disabled={isSendingOTP || isVerifyingOTP || isUploadingImage}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#11285A] text-white text-sm font-semibold hover:bg-[#0d1b3d] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {isSendingOTP || isVerifyingOTP || isUploadingImage ? (
                    <>
                      <Icon icon="eos-icons:loading" className="text-lg" />
                      {isUploadingImage
                        ? "Uploading Image..."
                        : "Processing..."}
                    </>
                  ) : (
                    <>
                      <Icon
                        icon="solar:check-circle-bold"
                        className="text-lg"
                      />
                      Save
                    </>
                  )}
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-300 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-colors"
                >
                  <Icon icon="solar:close-circle-bold" className="text-lg" />
                  Cancel
                </button>
              </div>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Full Name
              </label>
              <TextField
                type="text"
                name="fullName"
                value={profile.guardianName}
                onChange={handleProfileChange}
                disabled={!isEditMode}
                inputClassName={`${!isEditMode ? "bg-gray-100" : "bg-white"} ${errors.guardianName ? "border-red-500" : ""}`}
                placeholder="e.g., John Smith Jr"
              />
              {errors.guardianName && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.guardianName}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Email Address
              </label>
              <TextField
                type="email"
                name="email"
                value={profile.email}
                onChange={handleProfileChange}
                disabled={!isEditMode}
                inputClassName={`${!isEditMode ? "bg-gray-100" : "bg-white"} ${errors.email ? "border-red-500" : ""}`}
                placeholder="example@email.com"
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Phone Number
              </label>
              <TextField
                type="tel"
                name="phone"
                value={profile.phone}
                onChange={handleProfileChange}
                disabled={!isEditMode}
                maxLength="11"
                inputClassName={`${!isEditMode ? "bg-gray-100" : "bg-white"} ${errors.phone ? "border-red-500" : ""}`}
                placeholder="11 digits only"
              />
              {errors.phone && (
                <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Lot No./Bldg./Street
              </label>
              <TextField
                name="streetAddress"
                value={profile.streetAddress}
                placeholder="Enter your Lot No..."
                onChange={handleProfileChange}
                disabled={!isEditMode}
                inputClassName={`${!isEditMode ? "bg-gray-100" : "bg-white"}`}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Province
              </label>
              <SelectField
                placeholder="Province"
                disabled={true}
                options={[{ value: "Metro Manila", label: "Metro Manila" }]}
                onChange={handleProfileChange}
                value={profile.province}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Barangay
              </label>
              <SelectField
                placeholder="Barangay"
                disabled
                options={[{ value: "San Bartolome", label: "San Bartolome" }]}
                onChange={handleProfileChange}
                value={profile.barangay}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                City
              </label>
              <SelectField
                placeholder="City"
                options={[{ value: "Quezon City", label: "Quezon City" }]}
                disabled
                onChange={handleProfileChange}
                value={profile.city}
              />
            </div>

            <div className="flex flex-col gap-2 md:col-span-2">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                <div className="flex-shrink-0">
                  <div className="relative">
                    <img
                      src={profileImage}
                      alt="Profile Preview"
                      className="w-24 h-24 rounded-full object-cover border-2 border-white shadow-sm"
                    />
                    {isEditMode && (
                      <button
                        onClick={triggerFileInput}
                        className="absolute bottom-0 right-0 bg-[#11285A] text-white p-1.5 rounded-full hover:bg-[#0d1b3d] transition-colors"
                        title="Change photo"
                      >
                        <Icon icon="solar:camera-bold" className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex-1">
                  <div className="flex flex-col gap-2">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700">
                        Profile Photo
                      </h4>
                      <p className="text-xs text-gray-500 mt-1">
                        Upload a profile image. Maximum file size: 2MB.
                        Supported formats: JPG, PNG, GIF.
                      </p>
                    </div>

                    {isEditMode ? (
                      <div className="flex flex-col sm:flex-row gap-2 mt-2">
                        <div>
                          <button
                            type="button"
                            onClick={triggerFileInput}
                            disabled={isUploadingImage}
                            className="px-4 py-2 bg-white border border-[#11285A] text-[#11285A] text-sm font-medium rounded-lg hover:bg-blue-50 transition-colors flex items-center gap-2 disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-300 disabled:cursor-not-allowed"
                          >
                            <Icon
                              icon="solar:upload-bold"
                              className="w-4 h-4"
                            />
                            {isUploadingImage
                              ? "Uploading..."
                              : "Upload New Photo"}
                          </button>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/jpg,image/png,image/gif"
                            onChange={handleImageUpload}
                            className="hidden"
                            disabled={!isEditMode || isUploadingImage}
                          />
                        </div>

                        {profileImage !== avatarPlaceholder && (
                          <button
                            type="button"
                            onClick={handleRemoveImage}
                            disabled={isUploadingImage}
                            className="px-4 py-2 bg-white border border-red-500 text-red-500 text-sm font-medium rounded-lg hover:bg-red-50 transition-colors flex items-center gap-2 disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-300 disabled:cursor-not-allowed"
                          >
                            <Icon
                              icon="solar:trash-bin-trash-bold"
                              className="w-4 h-4"
                            />
                            Remove Photo
                          </button>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 italic">
                        Edit mode required to change profile photo
                      </p>
                    )}

                    {imageError && (
                      <p className="text-red-500 text-xs mt-1">{imageError}</p>
                    )}

                    {imageFile && (
                      <p className="text-xs text-gray-500 mt-1">
                        Selected: {imageFile.name} (
                        {(imageFile.size / 1024 / 1024).toFixed(2)} MB)
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {showToast && (
            <Toast
              message={toastConfig.message}
              type={toastConfig.type}
              duration={3000}
              position="top-right"
              onClose={() => setShowToast(false)}
            />
          )}
        </div>
      </main>

      {showOTPModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          {/* Blurred background */}
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>

          {/* Modal content */}
          <div className="bg-white rounded-2xl p-6 md:p-8 w-full max-w-md relative z-10">
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Verify Your New Email
                </h3>
                <p className="text-gray-600">
                  Please enter the 6-digit code sent to your new email address
                </p>
              </div>

              <div className="flex flex-col items-center">
                <div className="flex justify-center gap-2 mb-4">
                  {[0, 1, 2, 3, 4, 5].map((index) => (
                    <input
                      key={index}
                      ref={(el) => (otpInputRefs.current[index] = el)}
                      type="text"
                      maxLength="1"
                      value={otp[index]}
                      onChange={(e) => handleOTPChange(index, e.target.value)}
                      onKeyDown={(e) => handleOTPKeyDown(index, e)}
                      disabled={isVerifyingOTP}
                      className="w-12 h-12 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-[#11285A] focus:outline-none transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                  ))}
                </div>

                {otpError && (
                  <p className="text-red-500 text-sm text-center mb-2">
                    {otpError}
                  </p>
                )}
              </div>

              <div className="text-center text-sm text-gray-600">
                <p>We've sent a verification code to:</p>
                <p className="font-semibold text-gray-800 mt-1">
                  {profile.email}
                </p>
              </div>

              <div className="text-center">
                <div className="inline-flex items-center gap-2 text-sm text-gray-600">
                  <Icon icon="solar:clock-circle-bold" className="w-4 h-4" />
                  <span className="font-medium">
                    Expires in:{" "}
                    <span className="text-[#11285A]">
                      {formatTime(otpTimer)}
                    </span>
                  </span>
                </div>
              </div>

              <div className="text-center text-sm text-gray-600">
                <p>
                  Didn't receive code?{" "}
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={!canResendOTP || isSendingOTP}
                    className="text-[#11285A] hover:underline font-medium disabled:text-gray-400 disabled:cursor-not-allowed flex items-center gap-1"
                  >
                    {isSendingOTP ? (
                      <>
                        <Icon icon="eos-icons:loading" className="w-4 h-4" />
                        Sending...
                      </>
                    ) : (
                      "Resend OTP"
                    )}
                  </button>
                </p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleVerifyOTP}
                  disabled={otp.some((digit) => digit === "") || isVerifyingOTP}
                  className="w-full py-3 text-base font-medium text-white bg-[#11285A] hover:bg-[#0d1b3d] rounded-lg transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isVerifyingOTP ? (
                    <>
                      <Icon icon="eos-icons:loading" className="w-5 h-5" />
                      Verifying...
                    </>
                  ) : (
                    "Verify Code"
                  )}
                </button>

                <button
                  onClick={handleCancelOTP}
                  disabled={isVerifyingOTP}
                  className="w-full py-3 text-base font-medium text-[#11285A] border-2 border-[#11285A] hover:bg-blue-50 rounded-lg transition-colors disabled:border-gray-300 disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
