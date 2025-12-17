import { useUserStore } from "@/stores/useStore";
import { useState, useEffect, useRef } from "react";
import avatarPlaceholder from "@/assets/images/team-photo.png";
import { Icon } from "@iconify/react";
import TextField from "@/ui/components/TextField";
import SelectField from "@/ui/components/SelectField";
import Toast from "@/ui/components/Toast";
import { updateGuardian } from "@/api/backendService.js";

const relationshipOptions = [
  { value: "Husband", label: "Husband" },
  { value: "Wife", label: "Wife" },
  { value: "Sibling", label: "Sibling" },
  { value: "Legal Guardian", label: "Legal Guardian" },
  { value: "Other", label: "Other" }
];

// Validation functions
const validateName = (name) => {
  // Allows letters, spaces, periods, commas, and suffixes like Jr, II, III, IV
  const nameRegex = /^[A-Za-z\s.,]+(?: (?:Jr\.?|Sr\.?|I{1,3}|IV))?$/i;
  return nameRegex.test(name.trim());
};

const validatePhone = (phone) => {
  // Exactly 11 digits, only numbers
  const phoneRegex = /^\d{11}$/;
  return phoneRegex.test(phone.trim());
};

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

export const GuardianProfile = () => {
  const { user, setUser } = useUserStore();
  const [profile, setProfile] = useState({
    fullName: user.guardian_name,
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
  
  // OTP State (Design only)
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpTimer, setOtpTimer] = useState(300); // 5 minutes in seconds
  const [canResendOTP, setCanResendOTP] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [originalEmail, setOriginalEmail] = useState(user.email);
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);
  
  // Profile Image State
  const [profileImage, setProfileImage] = useState(avatarPlaceholder);
  const [imageFile, setImageFile] = useState(null);
  const [imageError, setImageError] = useState("");
  const fileInputRef = useRef(null);

  // Validation Errors
  const [errors, setErrors] = useState({
    fullName: "",
    email: "",
    phone: ""
  });

  const otpInputRefs = useRef([]);

  // OTP Timer (Design only)
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

  // Initialize profile image from user data if available
  useEffect(() => {
    if (user.profile_image) {
      setProfileImage(user.profile_image);
    }
  }, [user.profile_image]);

  const handleProfileChange = ({ target }) => {
    const { name, value } = target;
    
    // Auto-format phone number to only allow digits
    if (name === "phone") {
      const digitsOnly = value.replace(/\D/g, '');
      setProfile((prev) => ({ ...prev, [name]: digitsOnly }));
    } else {
      setProfile((prev) => ({ ...prev, [name]: value }));
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file size (2MB = 2 * 1024 * 1024 bytes)
    const maxSize = 2 * 1024 * 1024; // 2MB in bytes
    if (file.size > maxSize) {
      setImageError("Image must not exceed 2MB");
      return;
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      setImageError("Please upload a valid image file (JPEG, PNG, GIF)");
      return;
    }

    setImageError("");

    // Create a preview URL
    const imageUrl = URL.createObjectURL(file);
    setProfileImage(imageUrl);
    setImageFile(file);

    // Show success message
    setToastConfig({
      message: "Profile image uploaded successfully",
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
      fullName: "",
      email: "",
      phone: ""
    };

    let isValid = true;

    if (!profile.fullName.trim()) {
      newErrors.fullName = "Full name is required";
      isValid = false;
    } else if (!validateName(profile.fullName)) {
      newErrors.fullName = "Name can only contain letters, spaces, and suffixes like Jr, II, III, IV";
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
    // Validate form
    if (!validateForm()) {
      setToastConfig({ 
        message: "Please fix validation errors before saving", 
        type: "error" 
      });
      setShowToast(true);
      return;
    }

    // Check if email changed - show OTP modal (design only)
    if (profile.email !== originalEmail) {
      setIsVerifyingEmail(true);
      setShowOTPModal(true);
      simulateOTPSend();
      return;
    }

    // If no email change, save directly
    await saveProfileData();
  };

  // Simulate OTP send for design purposes
  const simulateOTPSend = () => {
    setToastConfig({ 
      message: "OTP sent to your email (design demo)", 
      type: "success" 
    });
    setShowToast(true);
    // Reset timer
    setOtpTimer(300);
    setCanResendOTP(false);
    setOtpError("");
    // Focus first OTP input
    setTimeout(() => {
      otpInputRefs.current[0]?.focus();
    }, 100);
  };

  const handleOTPChange = (index, value) => {
    if (!/^\d?$/.test(value)) return; // Only allow single digit

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setOtpError("");

    // Auto-focus next input
    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all fields are filled
    if (newOtp.every(digit => digit !== "") && index === 5) {
      handleVerifyOTP();
    }
  };

  const handleOTPKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      // Move to previous input on backspace
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  // Simulate OTP verification for design
  const handleVerifyOTP = async () => {
    const otpCode = otp.join("");
    
    if (otpCode.length !== 6) {
      setOtpError("Please enter the 6-digit code");
      return;
    }

    // For demo purposes, accept any 6-digit code
    if (otpCode === "123456") {
      // Demo success
      setToastConfig({ 
        message: "Email verified successfully (demo)", 
        type: "success" 
      });
    } else if (otpCode === "000000") {
      // Demo failure
      setOtpError("Invalid OTP code. Please try again.");
      return;
    } else {
      // For any other code, simulate success in demo
      setToastConfig({ 
        message: "Email verified successfully (demo)", 
        type: "success" 
      });
    }
    
    setShowToast(true);
    setShowOTPModal(false);
    setOriginalEmail(profile.email);
    setIsVerifyingEmail(false);
    
    // Save profile after successful verification
    await saveProfileData();
  };

  const saveProfileData = async () => {
    try {
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
      
      // If there's an image file, you would upload it here
      // For now, we'll just save the other profile data
      // In a real implementation, you would upload the image first
      // and then include the image URL in the payload
      
      await updateGuardian(user.guardian_id, payload);
      
      // Update the user store with the new data
      setUser({
        ...user,
        guardian_name: profile.fullName,
        email: profile.email,
        contact_number: profile.phone,
        province: profile.province,
        city: profile.city,
        barangay: profile.barangay,
        village: profile.village,
        street_address: profile.streetAddress,
        // In a real implementation, add: profile_image: uploadedImageUrl
      });
      
      setIsEditMode(false);
      setToastConfig({ 
        message: "Profile saved successfully", 
        type: "success" 
      });
      setShowToast(true);
    } catch (error) {
      console.error("Error saving profile:", error);
      setToastConfig({ 
        message: "Failed to save profile. Please try again.", 
        type: "error" 
      });
      setShowToast(true);
    }
  };

  const handleResendOTP = async () => {
    if (!canResendOTP) return;

    // Simulate resending OTP
    simulateOTPSend();
  };

  const handleCancelOTP = () => {
    // Reset email to original if OTP verification is cancelled
    if (isVerifyingEmail) {
      setProfile((prev) => ({ ...prev, email: originalEmail }));
      setIsVerifyingEmail(false);
    }
    setShowOTPModal(false);
    setOtp(["", "", "", "", "", ""]);
    setOtpTimer(300);
    setOtpError("");
    
    setToastConfig({ 
      message: "Email verification cancelled", 
      type: "warning" 
    });
    setShowToast(true);
  };

  const handleCancelEdit = () => {
    // Reset profile to original user data
    setProfile({
      fullName: user.guardian_name,
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
    
    // Reset profile image
    if (user.profile_image) {
      setProfileImage(user.profile_image);
    } else {
      setProfileImage(avatarPlaceholder);
    }
    setImageFile(null);
    setImageError("");
    
    // Reset errors
    setErrors({
      fullName: "",
      email: "",
      phone: ""
    });
    
    setIsEditMode(false);
    setToastConfig({ message: "Changes cancelled", type: "warning" });
    setShowToast(true);
  };

  // Format timer display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#11285A] text-white text-sm font-semibold hover:bg-[#0d1b3d] transition-colors"
                >
                  <Icon icon="solar:check-circle-bold" className="text-lg" />
                  Save
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
                value={profile.fullName}
                onChange={handleProfileChange}
                disabled={!isEditMode}
                inputClassName={`${!isEditMode ? "bg-gray-100" : "bg-white"} ${errors.fullName ? "border-red-500" : ""}`}
                placeholder="e.g., John Smith Jr"
              />
              {errors.fullName && (
                <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>
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
              <p className="text-xs text-gray-500 mt-1">
                Must be exactly 11 digits
              </p>
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
            
            {/* Profile Image Upload Section */}
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
                      <h4 className="text-sm font-semibold text-gray-700">Profile Photo</h4>
                      <p className="text-xs text-gray-500 mt-1">
                        Upload a profile image. Maximum file size: 2MB. Supported formats: JPG, PNG, GIF.
                      </p>
                    </div>
                    
                    {isEditMode ? (
                      <div className="flex flex-col sm:flex-row gap-2 mt-2">
                        <div>
                          <button
                            type="button"
                            onClick={triggerFileInput}
                            className="px-4 py-2 bg-white border border-[#11285A] text-[#11285A] text-sm font-medium rounded-lg hover:bg-blue-50 transition-colors flex items-center gap-2"
                          >
                            <Icon icon="solar:upload-bold" className="w-4 h-4" />
                            Upload New Photo
                          </button>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/jpg,image/png,image/gif"
                            onChange={handleImageUpload}
                            className="hidden"
                            disabled={!isEditMode}
                          />
                        </div>
                        
                        {profileImage !== avatarPlaceholder && (
                          <button
                            type="button"
                            onClick={handleRemoveImage}
                            className="px-4 py-2 bg-white border border-red-500 text-red-500 text-sm font-medium rounded-lg hover:bg-red-50 transition-colors flex items-center gap-2"
                          >
                            <Icon icon="solar:trash-bin-trash-bold" className="w-4 h-4" />
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
                        Selected: {imageFile.name} ({(imageFile.size / 1024 / 1024).toFixed(2)} MB)
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

      {/* OTP Verification Modal (Design Only) */}
      {showOTPModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 md:p-8 w-full max-w-md">
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Verify Your Email
                </h3>
                <p className="text-gray-600">
                  Please enter the 6-digit code sent to your email
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Demo: Use 123456 for success, 000000 for error
                </p>
              </div>

              {/* OTP Input Container */}
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
                      className="w-12 h-12 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-[#11285A] focus:outline-none transition-colors"
                    />
                  ))}
                </div>

                {otpError && (
                  <p className="text-red-500 text-sm text-center mb-2">
                    {otpError}
                  </p>
                )}
              </div>

              {/* Email Display */}
              <div className="text-center text-sm text-gray-600">
                <p>We've sent a verification code to:</p>
                <p className="font-semibold text-gray-800 mt-1">
                  {profile.email}
                </p>
              </div>

              {/* Timer Display */}
              <div className="text-center">
                <div className="inline-flex items-center gap-2 text-sm text-gray-600">
                  <Icon icon="solar:clock-circle-bold" className="w-4 h-4" />
                  <span className="font-medium">
                    Expires in: <span className="text-[#11285A]">{formatTime(otpTimer)}</span>
                  </span>
                </div>
              </div>

              {/* Resend OTP Link */}
              <div className="text-center text-sm text-gray-600">
                <p>
                  Didn't receive code?{" "}
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={!canResendOTP}
                    className="text-[#11285A] hover:underline font-medium disabled:text-gray-400 disabled:cursor-not-allowed"
                  >
                    Resend OTP
                  </button>
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleVerifyOTP}
                  className="w-full py-3 text-base font-medium text-white bg-[#11285A] hover:bg-[#0d1b3d] rounded-lg transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                  disabled={otp.some(digit => digit === "")}
                >
                  Verify Code
                </button>

                <button
                  onClick={handleCancelOTP}
                  className="w-full py-3 text-base font-medium text-[#11285A] border-2 border-[#11285A] hover:bg-blue-50 rounded-lg transition-colors"
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