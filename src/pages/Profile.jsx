import { useState, useEffect, useRef } from "react";
import { Icon } from "@iconify/react";
import TextField from "../ui/components/TextField";
import Toast from "../ui/components/Toast"; // adjust path if needed

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({});
  const [isEditMode, setIsEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [saveError, setSaveError] = useState("");
  const [originalProfile, setOriginalProfile] = useState(null);

  const [toast, setToast] = useState({ message: "", type: "", visible: false });

  const showToast = (message, type = "info") => {
    setToast({ message, type, visible: true });
    setTimeout(() => setToast({ message: "", type: "", visible: false }), 3000);
  };

  const [profileImageUrl, setProfileImageUrl] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imageError, setImageError] = useState("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef(null);

  const [showOTPModal, setShowOTPModal] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpTimer, setOtpTimer] = useState(300);
  const [canResendOTP, setCanResendOTP] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [originalEmail, setOriginalEmail] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);
  const [isSendingOTP, setIsSendingOTP] = useState(false);
  const [isVerifyingOTP, setIsVerifyingOTP] = useState(false);
  const [emailConflict, setEmailConflict] = useState(""); // inline error for email
  const otpInputRefs = useRef([]);

  const [errors, setErrors] = useState({
    first_name: "",
    middle_name: "",
    last_name: "",
    username: "",
    email: "",
    contact_number: "",
    province: "",
    city: "",
    barangay: "",
    street_address: "",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(`${API_URL}/api/admin/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch profile");
      const data = await res.json();
      setProfile(data);
      setForm(data);
      setProfileImageUrl(data.profile_image_url);
      setOriginalEmail(data.email);
      setOriginalProfile(data);
    } catch (err) {
      console.error("Fetch profile error:", err);
      setSaveError("Could not load profile.");
    }
  };

  const sanitizeContactNumber = (value = "") =>
    String(value).replace(/\D/g, "").slice(0, 11);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "contact_number" ? sanitizeContactNumber(value) : value,
    }));

    // Clear field error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    // Clear email conflict if email field changes
    if (name === "email") {
      setEmailConflict("");
    }
  };

  const handleBlur = (name) => {
    const value = form[name];
    let error = "";
    if (!value && (name === "first_name" || name === "last_name" || name === "username" || name === "email")) {
      error = "This field is required";
    } else if (name === "email" && value && !/\S+@\S+\.\S+/.test(value)) {
      error = "Invalid email format";
    } else if (name === "contact_number" && value && !/^\d{11}$/.test(value.replace(/\D/g, ""))) {
      error = "Must be exactly 11 digits";
    }
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const hasChanges = () => {
    if (!originalProfile) return false;
    const fields = Object.keys(form);
    for (let field of fields) {
      if (form[field] !== originalProfile[field]) return true;
    }
    if (imageFile !== null) return true;
    if (profileImageUrl !== originalProfile.profile_image_url) return true;
    return false;
  };

  const hasValidationErrors = () => Object.values(errors).some((e) => e) || emailConflict;

  const handleEditProfile = () => {
    setOriginalProfile({ ...form, profile_image_url: profileImageUrl });
    setIsEditMode(true);
  };

  const handleCancelEdit = () => {
    setForm({ ...originalProfile });
    setProfileImageUrl(originalProfile.profile_image_url);
    setImageFile(null);
    setImageError("");
    setIsEditMode(false);
    setErrors({});
    setEmailConflict("");
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();

    // If email changed and not yet verified, start OTP flow
    if (form.email !== originalEmail) {
      // Validate email format first
      if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) {
        setErrors((prev) => ({ ...prev, email: "Invalid email format" }));
        return;
      }
      setNewEmail(form.email);
      await requestEmailOTP();
      return;
    }

    // Otherwise save directly
    await saveProfileData();
  };

  const requestEmailOTP = async () => {
    try {
      setIsSendingOTP(true);
      setOtpError("");
      setEmailConflict(""); // clear previous conflict

      const token = localStorage.getItem("access_token");
      const res = await fetch(`${API_URL}/api/admin/profile/request-email-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ new_email: form.email }),
      });
      const data = await res.json();

      if (res.ok) {
        setShowOTPModal(true);
        setOtpTimer(300);
        setCanResendOTP(false);
        setOtp(["", "", "", "", "", ""]);
        setTimeout(() => otpInputRefs.current[0]?.focus(), 100);
        showToast("OTP sent to your new email address", "success");
      } else {
        // Handle 409 conflict (email already used)
        if (res.status === 409) {
          setEmailConflict(data.message || "Email is already in use by another account.");
          setForm((prev) => ({ ...prev, email: originalEmail })); // revert email field
        } else {
          setOtpError(data.message || "Failed to send OTP");
          showToast(data.message || "Failed to send OTP", "error");
        }
      }
    } catch (err) {
      console.error("Request OTP error:", err);
      setOtpError("Network error. Please try again.");
      showToast("Network error. Please try again.", "error");
    } finally {
      setIsSendingOTP(false);
    }
  };

  const handleResendOTP = async () => {
    if (!canResendOTP || isSendingOTP) return;
    await requestEmailOTP();
  };

  const handleVerifyOTP = async () => {
    const otpCode = otp.join("");
    if (otpCode.length !== 6) {
      setOtpError("Please enter the 6-digit code");
      return;
    }

    try {
      setIsVerifyingOTP(true);
      const token = localStorage.getItem("access_token");
      const res = await fetch(`${API_URL}/api/admin/profile/verify-email-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ new_email: newEmail, otp_code: otpCode }),
      });
      const data = await res.json();

      if (res.ok) {
        setShowOTPModal(false);
        setOriginalEmail(newEmail);
        setForm((prev) => ({ ...prev, email: newEmail }));
        await saveProfileData(); // save after email verification
      } else {
        setOtpError(data.message || "Invalid OTP");
        showToast(data.message || "Invalid OTP", "error");
      }
    } catch (err) {
      console.error("Verify OTP error:", err);
      setOtpError("Network error. Please try again.");
      showToast("Network error. Please try again.", "error");
    } finally {
      setIsVerifyingOTP(false);
    }
  };

  const handleCancelOTP = () => {
    setShowOTPModal(false);
    setOtp(["", "", "", "", "", ""]);
    setOtpError("");
    setForm((prev) => ({ ...prev, email: originalEmail }));
    setIsVerifyingEmail(false);
  };

  const saveProfileData = async () => {
    try {
      setSaving(true);
      setSaveMsg("");
      setSaveError("");

      // 1. Upload image if any
      let uploadedImageUrl = null;
      if (imageFile) {
        setIsUploadingImage(true);
        const formData = new FormData();
        formData.append("image", imageFile);
        const token = localStorage.getItem("access_token");
        const uploadRes = await fetch(`${API_URL}/api/admin/profile/upload-image`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
        if (uploadRes.ok) {
          const data = await uploadRes.json();
          uploadedImageUrl = data.profile_image_url;
        } else {
          setSaveError("Image upload failed, but other changes may still save.");
          showToast("Image upload failed", "error");
        }
        setIsUploadingImage(false);
      }

      // 2. Remove image if requested (only if no new image)
      if (profileImageUrl === null && originalProfile.profile_image_url && !imageFile) {
        const token = localStorage.getItem("access_token");
        await fetch(`${API_URL}/api/admin/profile/remove-image`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      // 3. Update profile fields
      const token = localStorage.getItem("access_token");
      const updateRes = await fetch(`${API_URL}/api/admin/profile/update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      const updateData = await updateRes.json();

      if (updateRes.ok) {
        // Refresh local state
        const updatedProfile = { ...form, profile_image_url: uploadedImageUrl || profileImageUrl };
        setProfile(updatedProfile);
        setOriginalProfile(updatedProfile);
        setProfileImageUrl(updatedProfile.profile_image_url);
        setImageFile(null);
        setSaveMsg("Profile updated successfully!");

        // Update localStorage for header
        localStorage.setItem("first_name", form.first_name);
        localStorage.setItem("last_name", form.last_name);

        // Dispatch event to update header
        window.dispatchEvent(new Event("profile-updated"));

        showToast("Profile updated successfully!", "success");
        setTimeout(() => setSaveMsg(""), 3000);
        setIsEditMode(false);
      } else {
        setSaveError(updateData.message || "Failed to update profile");
        showToast(updateData.message || "Failed to update profile", "error");
      }
    } catch (err) {
      console.error("Save error:", err);
      setSaveError("An unexpected error occurred");
      showToast("An unexpected error occurred", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      setImageError("Image must not exceed 2MB");
      return;
    }

    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setImageError("Please upload a valid image file (JPEG, PNG, WEBP)");
      return;
    }

    setImageError("");
    const previewUrl = URL.createObjectURL(file);
    setProfileImageUrl(previewUrl);
    setImageFile(file);
  };

  const handleRemoveImage = () => {
    setProfileImageUrl(null);
    setImageFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

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

  const handleOTPChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setOtpError("");

    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOTPKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Icon icon="eos-icons:loading" className="w-12 h-12 text-primary-100 mx-auto mb-4" />
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  const initials = [profile.first_name, profile.last_name]
    .filter(Boolean)
    .map((n) => n[0].toUpperCase())
    .join("");

  return (
    <>
      {toast.visible && (
        <Toast
          message={toast.message}
          type={toast.type}
          duration={3000}
          position="top-right"
          onClose={() => setToast({ ...toast, visible: false })}
        />
      )}

      <main className="bg-white md:bg-[#f9fafb] rounded-t-[32px] md:rounded-none min-h-[calc(100vh-var(--header-height))] md:max-h-[calc(100vh-var(--header-height))] overflow-y-auto p-3 sm:p-4 md:p-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6 md:p-8 flex flex-col gap-5 w-full max-w-5xl mx-auto">
          {/* Header: avatar, name, role, edit/save buttons */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 sm:gap-6">
            <div className="flex items-start sm:items-center gap-4 min-w-0">
              <div className="relative flex-shrink-0">
                {profileImageUrl ? (
                  <img
                    src={profileImageUrl}
                    alt={`${profile.first_name} ${profile.last_name}`}
                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-primary-100 flex items-center justify-center text-white text-xl sm:text-2xl font-bold">
                    {initials}
                  </div>
                )}
                {isEditMode && (
                  <button
                    type="button"
                    onClick={triggerFileInput}
                    className="absolute bottom-0 right-0 bg-primary-100 text-white p-1.5 rounded-full hover:bg-primary-200 transition-colors cursor-pointer"
                    title="Change photo"
                  >
                    <Icon icon="solar:camera-bold" className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="min-w-0">
                <h3 className="text-base sm:text-lg font-semibold text-primary-100 break-words">
                  {`${profile.first_name} ${profile.middle_name || ""} ${profile.last_name}`}
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 break-all">{profile.email}</p>
                <span className="inline-block mt-1 text-xs font-medium text-primary-100 bg-blue-50 px-2 py-0.5 rounded-full">
                  {profile.role === "super_admin" ? "Super Admin" : "Admin"}
                </span>
              </div>
            </div>

            {!isEditMode ? (
              <button
                onClick={handleEditProfile}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-primary-100 text-primary-100 text-sm font-semibold hover:bg-blue-50 transition-colors cursor-pointer"
              >
                <Icon icon="solar:pen-bold" className="text-lg" />
                Edit Profile
              </button>
            ) : (
              <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={handleSaveProfile}
                  disabled={saving || isUploadingImage || !hasChanges() || hasValidationErrors()}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-primary-100 text-white text-sm font-semibold hover:bg-primary-200 transition-colors cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {(saving || isUploadingImage || isSendingOTP || isVerifyingOTP) ? (
                    <>
                      <Icon icon="ph:circle-notch-bold" className="w-5 h-5 animate-spin" />
                      {isSendingOTP ? "Sending OTP..." : isVerifyingOTP ? "Verifying..." : isUploadingImage ? "Uploading..." : "Saving..."}
                    </>
                  ) : (
                    <>
                      <Icon icon="solar:check-circle-bold" className="text-lg" />
                      Save
                    </>
                  )}
                </button>
                <button
                  onClick={handleCancelEdit}
                  disabled={saving || isUploadingImage || isSendingOTP || isVerifyingOTP}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-gray-300 text-sm font-semibold hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-70"
                >
                  <Icon icon="solar:close-circle-bold" className="text-lg" />
                  Cancel
                </button>
              </div>
            )}
          </div>

          {/* Form fields */}
          <form onSubmit={(e) => e.preventDefault()} className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">First Name *</label>
              <TextField
                name="first_name"
                value={form.first_name || ""}
                onChange={handleChange}
                onBlur={() => handleBlur("first_name")}
                disabled={!isEditMode}
                error={errors.first_name}
                placeholder="Enter first name"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Middle Name</label>
              <TextField
                name="middle_name"
                value={form.middle_name || ""}
                onChange={handleChange}
                disabled={!isEditMode}
                error={errors.middle_name}
                placeholder="Enter middle name"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Last Name *</label>
              <TextField
                name="last_name"
                value={form.last_name || ""}
                onChange={handleChange}
                onBlur={() => handleBlur("last_name")}
                disabled={!isEditMode}
                error={errors.last_name}
                placeholder="Enter last name"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Username *</label>
              <TextField
                name="username"
                value={form.username || ""}
                onChange={handleChange}
                onBlur={() => handleBlur("username")}
                disabled={!isEditMode}
                error={errors.username}
                placeholder="Enter username"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Email Address *</label>
              <TextField
                name="email"
                type="email"
                value={form.email || ""}
                onChange={handleChange}
                onBlur={() => handleBlur("email")}
                disabled={!isEditMode}
                error={errors.email || emailConflict}
                placeholder="admin@example.com"
              />
              {emailConflict && (
                <p className="text-red-500 text-xs mt-1">{emailConflict}</p>
              )}
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Contact Number</label>
              <TextField
                name="contact_number"
                value={form.contact_number || ""}
                onChange={handleChange}
                onBlur={() => handleBlur("contact_number")}
                disabled={!isEditMode}
                error={errors.contact_number}
                placeholder="09123456789"
                maxLength={11}
                inputMode="numeric"
                pattern="[0-9]*"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Province</label>
              <TextField
                name="province"
                value={form.province || ""}
                onChange={handleChange}
                disabled={!isEditMode}
                error={errors.province}
                placeholder="Province"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">City</label>
              <TextField
                name="city"
                value={form.city || ""}
                onChange={handleChange}
                disabled={!isEditMode}
                error={errors.city}
                placeholder="City"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Barangay</label>
              <TextField
                name="barangay"
                value={form.barangay || ""}
                onChange={handleChange}
                disabled={!isEditMode}
                error={errors.barangay}
                placeholder="Barangay"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Street Address</label>
              <TextField
                name="street_address"
                value={form.street_address || ""}
                onChange={handleChange}
                disabled={!isEditMode}
                error={errors.street_address}
                placeholder="Lot/Blk/Street"
              />
            </div>
          </form>

          {/* Success/Error messages (fallback, but Toast handles main ones) */}
          {saveMsg && <p className="text-green-600 text-sm mt-2">{saveMsg}</p>}
          {saveError && <p className="text-red-500 text-sm mt-2">{saveError}</p>}
          {imageError && <p className="text-red-500 text-sm mt-2">{imageError}</p>}
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={handleImageUpload}
          className="hidden"
        />
      </main>

      {/* OTP Modal */}
      {showOTPModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>
          <div className="bg-white rounded-2xl p-4 sm:p-6 md:p-8 w-full max-w-md relative z-10">
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">Verify Your New Email</h3>
                <p className="text-sm sm:text-base text-gray-600">Please enter the 6-digit code sent to your new email address</p>
              </div>

              <div className="flex flex-col items-center">
                <div className="flex justify-center gap-1.5 sm:gap-2 mb-4">
                  {[0, 1, 2, 3, 4, 5].map((index) => (
                    <input
                      key={index}
                      ref={(el) => (otpInputRefs.current[index] = el)}
                      type="text"
                      maxLength="1"
                      value={otp[index]}
                      onChange={(e) => handleOTPChange(index, e.target.value)}
                      onKeyDown={(e) => {
                        handleOTPKeyDown(index, e);
                        if (e.key === "Enter") handleVerifyOTP();
                      }}
                      disabled={isVerifyingOTP}
                      className="w-10 h-10 sm:w-12 sm:h-12 text-center text-xl sm:text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-primary-100 focus:outline-none transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                  ))}
                </div>
                {otpError && <p className="text-red-500 text-sm text-center mb-2">{otpError}</p>}
              </div>

              <div className="text-center text-sm text-gray-600">
                <p>We've sent a verification code to:</p>
                <p className="font-semibold text-gray-800 mt-1">{newEmail}</p>
              </div>

              {!canResendOTP && (
                <div className="text-center">
                  <div className="inline-flex items-center gap-2 text-sm text-gray-600">
                    <Icon icon="solar:clock-circle-bold" className="w-4 h-4" />
                    <span className="font-medium">
                      Expires in: <span className="text-primary-100">{formatTime(otpTimer)}</span>
                    </span>
                  </div>
                </div>
              )}

              <div className="text-center text-sm text-gray-600">
                <p>
                  Didn't receive code?{" "}
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={!canResendOTP || isSendingOTP}
                    className="text-primary-100 hover:underline font-medium disabled:text-gray-400 disabled:cursor-not-allowed"
                  >
                    {isSendingOTP ? "Sending..." : "Resend OTP"}
                  </button>
                </p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleVerifyOTP}
                  disabled={otp.some((d) => d === "") || isVerifyingOTP || isSendingOTP}
                  className="w-full py-2.5 sm:py-3 text-sm sm:text-base font-medium text-white bg-primary-100 hover:bg-primary-200 rounded-lg transition-colors cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                  disabled={isVerifyingOTP || isSendingOTP}
                  className="w-full py-2.5 sm:py-3 text-sm sm:text-base font-medium text-primary-100 border-2 border-primary-100 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
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
}