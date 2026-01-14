import { Icon } from "@iconify/react";
import { AnimatePresence, motion } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { resolveProfileImageSrc } from "@/utils/ResolveImage";

const VipProfileModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  isLoading = false,
  isUploadingImage = false,
  title = "VIP Profile",
  submitText = "Save Profile",
  isSubmitting = false,
  mode = "edit" // 'view', 'create', or 'edit'
}) => {
  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    streetAddress: "",
    vipImageUrl: "",
    province: "Metro Manila",
    city: "Quezon City",
    barangay: "San Bartolome"
  });

  const [errors, setErrors] = useState({});
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [imageError, setImageError] = useState("");

  const fileInputRef = useRef(null);

  // Determine mode based on props
  const isViewMode = mode === "view";
  const isCreateMode = mode === "create";
  const isEditMode = mode === "edit";

  // Initialize form with initialData if provided (for editing/viewing)
  useEffect(() => {
    if (initialData) {
      setFormData({
        firstName: initialData.firstName || "",
        middleName: initialData.middleName || "",
        lastName: initialData.lastName || "",
        streetAddress: initialData.streetAddress || "",
        vipImageUrl: initialData.vipImageUrl || "",
        province: initialData.province || "Metro Manila",
        city: initialData.city || "Quezon City",
        barangay: initialData.barangay || "San Bartolome",
        createdAt: initialData.created_at || "",
        updatedAt: initialData.updated_at || ""
      });
      if (initialData.vipImageUrl) {
        setImagePreview(initialData.vipImageUrl);
      }
    }
  }, [initialData, mode]);

  // Handle form input changes
  const handleInputChange = (e) => {
    if (isViewMode) return;

    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleImageUpload = (e) => {
    if (isViewMode) return;

    const file = e.target.files[0];
    if (!file) return;

    const maxSize = 2 * 1024 * 1024; // 2MB
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];

    if (!validTypes.includes(file.type)) {
      setImageError("Please upload a valid image (JPG, PNG, GIF)");
      return;
    }

    if (file.size > maxSize) {
      setImageError("Image size must be less than 2MB");
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setImageError("");
    setFormData((prev) => ({ ...prev, vipImageUrl: "" })); // Clear URL if file is uploaded
  };

  const handleRemoveImage = () => {
    if (isViewMode) return;

    setImageFile(null);
    setImagePreview("");
    setImageError("");
  };

  const triggerFileInput = () => {
    if (isViewMode) return;
    fileInputRef.current?.click();
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim())
      newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!formData.streetAddress.trim())
      newErrors.streetAddress = "Street address is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isViewMode) {
      onClose();
      return;
    }

    if (!validateForm()) return;

    const submitData = {
      first_name: formData.firstName || "",
      middle_name: formData.middleName || "",
      last_name: formData.lastName || "",
      street_address: formData.streetAddress || "",
      province: formData.province || "Metro Manila",
      city: formData.city || "Quezon City",
      barangay: formData.barangay || "San Bartolome"
    };

    const success = await onSubmit({ vip: { ...submitData } }, imageFile);
    if (!success) return;
    setFormData({
      firstName: "",
      middleName: "",
      lastName: "",
      streetAddress: "",
      vipImageUrl: "",
      province: "Metro Manila",
      city: "Quezon City",
      barangay: "San Bartolome"
    });
  };

  const getFullName = () => {
    const parts = [
      formData.firstName,
      formData.middleName,
      formData.lastName
    ].filter(Boolean);
    return parts.join(" ");
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence mode="wait">
      <div className="fixed inset-0 z-50 overflow-y-auto ">
        {/* Backdrop with blur */}
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 flex justify-center items-center"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Modal container */}
          <div className="relative flex min-h-full min-w-full items-center justify-center p-2 sm:p-4 z-10">
            <div
              className="relative bg-white rounded-xl sm:rounded-2xl shadow-xl sm:shadow-2xl w-full max-w-4xl max-h-[90dvh] overflow-hidden    border border-gray-100 transform transition-all duration-300 scale-100 mx-2 sm:mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="max-h-[90dvh] overflow-y-auto scrollbar-custom">
                {/* Header */}
                <div
                  className={`sticky top-0 px-4 sm:px-6 py-4 border-b border-gray-200 rounded-t-xl sm:rounded-t-2xl z-10 ${
                    isViewMode
                      ? "bg-gradient-to-r from-gray-50 to-gray-100"
                      : "bg-gradient-to-r from-blue-50 to-indigo-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div
                        className={`p-1.5 sm:p-2 rounded-lg shadow-sm ${
                          isViewMode ? "bg-gray-200" : "bg-white"
                        }`}
                      >
                        <Icon
                          icon={
                            isViewMode
                              ? "ph:eye-bold"
                              : isCreateMode
                                ? "ph:user-plus-bold"
                                : "ph:user-focus"
                          }
                          className={`w-5 h-5 sm:w-6 sm:h-6 ${
                            isViewMode ? "text-gray-700" : "text-blue-600"
                          }`}
                        />
                      </div>
                      <div>
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900 font-poppins line-clamp-1">
                          {title}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-600 mt-0.5 line-clamp-1">
                          {isViewMode
                            ? "View VIP profile details"
                            : isCreateMode
                              ? "Fill in details to create new VIP profile"
                              : "Update VIP profile details"}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={onClose}
                      className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-default cursor-pointer flex-shrink-0"
                      disabled={isLoading || isSubmitting}
                      aria-label="Close modal"
                    >
                      <Icon
                        icon="ph:x-bold"
                        className="w-5 h-5 text-gray-500"
                      />
                    </button>
                  </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-4 sm:p-6">
                  <div className="space-y-4 sm:space-y-6">
                    {/* Profile Photo Section */}
                    <div
                      className={`p-4 rounded-xl border ${
                        isViewMode
                          ? "bg-gradient-to-br from-gray-50 to-gray-100 border-gray-300"
                          : "bg-gradient-to-br from-gray-50 to-white border-gray-200"
                      }`}
                    >
                      <div className="flex flex-col items-center sm:items-start sm:flex-row gap-4 sm:gap-6">
                        <div className="flex-shrink-0">
                          <div className="relative group">
                            <div
                              className={`w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-4 shadow-lg ${
                                isViewMode
                                  ? "border-gray-300 bg-gradient-to-br from-gray-200 to-gray-300"
                                  : "border-white bg-gradient-to-br from-blue-100 to-indigo-100"
                              }`}
                            >
                              {imagePreview ? (
                                <img
                                  loading="lazy"
                                  src={resolveProfileImageSrc(imagePreview)}
                                  alt="Profile Preview"
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Icon
                                    icon="ph:user-bold"
                                    className={`w-10 h-10 sm:w-12 sm:h-12 ${
                                      isViewMode
                                        ? "text-gray-400"
                                        : "text-blue-300"
                                    }`}
                                  />
                                </div>
                              )}
                            </div>
                            {!isViewMode && (
                              <button
                                type="button"
                                onClick={triggerFileInput}
                                className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-200 rounded-2xl"
                                disabled={isLoading || isUploadingImage}
                              >
                                <Icon
                                  icon="ph:camera-bold"
                                  className="w-5 h-5 sm:w-6 sm:h-6 text-white"
                                />
                              </button>
                            )}
                            <input
                              ref={fileInputRef}
                              type="file"
                              accept="image/jpeg,image/jpg,image/png,image/gif"
                              onChange={handleImageUpload}
                              className="hidden"
                              disabled={
                                isLoading || isUploadingImage || isViewMode
                              }
                            />
                          </div>
                        </div>

                        <div className="flex-1 w-full sm:w-auto">
                          <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 text-center sm:text-left">
                            Profile Photo
                          </h4>
                          {isViewMode ? (
                            <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4 text-center sm:text-left">
                              {imagePreview
                                ? "Profile image is set"
                                : "No profile image uploaded"}
                            </p>
                          ) : (
                            <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4 text-center sm:text-left">
                              Upload a profile image (optional). Max size: 2MB.
                              JPG, PNG, or GIF formats.
                            </p>
                          )}

                          {!isViewMode && (
                            <div className="flex flex-col xs:flex-row gap-2 justify-center sm:justify-start">
                              <button
                                type="button"
                                onClick={triggerFileInput}
                                disabled={
                                  isLoading || isUploadingImage || isSubmitting
                                }
                                className="px-4 py-2 bg-white border border-blue-500 text-blue-600 text-sm font-medium rounded-lg hover:bg-blue-50 transition-all hover:shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <Icon
                                  icon="ph:upload-simple-bold"
                                  className="w-4 h-4"
                                />
                                {isUploadingImage
                                  ? "Uploading..."
                                  : "Upload Photo"}
                              </button>

                              {imagePreview && (
                                <button
                                  type="button"
                                  onClick={handleRemoveImage}
                                  disabled={isLoading || isSubmitting}
                                  className="px-4 py-2 bg-white border border-red-200 text-red-600 text-sm font-medium rounded-lg hover:bg-red-50 transition-all hover:shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed "
                                >
                                  <Icon
                                    icon="ph:trash-bold"
                                    className="w-4 h-4"
                                  />
                                  Remove
                                </button>
                              )}
                            </div>
                          )}

                          {imageError && (
                            <p className="text-red-500 text-xs mt-2 text-center sm:text-left">
                              {imageError}
                            </p>
                          )}

                          {!isViewMode && imageFile && (
                            <p className="text-xs text-gray-500 mt-2 text-center sm:text-left truncate">
                              Selected: {imageFile.name} (
                              {(imageFile.size / 1024 / 1024).toFixed(2)} MB)
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Full Name Display (View Mode) */}
                    {isViewMode && (
                      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <Icon
                            icon="ph:identification-card-bold"
                            className="w-5 h-5 text-blue-600"
                          />
                          <h4 className="text-lg font-semibold text-gray-900">
                            VIP Profile
                          </h4>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                          <div className="p-3 bg-white rounded-lg border border-blue-200 self-center sm:self-auto">
                            <Icon
                              icon="ph:user-bold"
                              className="w-8 h-8 text-blue-500"
                            />
                          </div>
                          <div className="text-center sm:text-left">
                            <h3 className="text-xl font-bold text-gray-900 break-words">
                              {getFullName()}
                            </h3>
                            <p className="text-sm text-gray-600">
                              VIP ID: {initialData?.vipId || "N/A"}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Personal Information Section */}
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <Icon
                          icon="ph:user-circle-bold"
                          className="w-5 h-5 text-blue-600"
                        />
                        <h4 className="text-lg font-semibold text-gray-900">
                          Personal Information
                        </h4>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* First Name */}
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">
                            First Name{" "}
                            {!isViewMode && (
                              <span className="text-red-500">*</span>
                            )}
                          </label>
                          {isViewMode ? (
                            <div className="p-3 bg-gray-50 rounded-lg border border-gray-300">
                              <p className="text-gray-800">
                                {formData.firstName || "—"}
                              </p>
                            </div>
                          ) : (
                            <input
                              type="text"
                              name="firstName"
                              value={formData.firstName}
                              onChange={handleInputChange}
                              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${
                                errors.firstName
                                  ? "border-red-500"
                                  : "border-gray-300"
                              } ${isViewMode ? "bg-gray-100 cursor-not-allowed" : ""}`}
                              placeholder="Enter first name"
                              disabled={isLoading || isViewMode}
                              readOnly={isViewMode}
                            />
                          )}
                          {!isViewMode && errors.firstName && (
                            <p className="text-red-500 text-xs">
                              {errors.firstName}
                            </p>
                          )}
                        </div>

                        {/* Middle Name */}
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Middle Name
                          </label>
                          {isViewMode ? (
                            <div className="p-3 bg-gray-50 rounded-lg border border-gray-300">
                              <p className="text-gray-800">
                                {formData.middleName || "—"}
                              </p>
                            </div>
                          ) : (
                            <input
                              type="text"
                              name="middleName"
                              value={formData.middleName}
                              onChange={handleInputChange}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                              placeholder="Enter middle name"
                              disabled={isLoading || isViewMode}
                              readOnly={isViewMode}
                            />
                          )}
                        </div>

                        {/* Last Name */}
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Last Name{" "}
                            {!isViewMode && (
                              <span className="text-red-500">*</span>
                            )}
                          </label>
                          {isViewMode ? (
                            <div className="p-3 bg-gray-50 rounded-lg border border-gray-300">
                              <p className="text-gray-800">
                                {formData.lastName || "—"}
                              </p>
                            </div>
                          ) : (
                            <input
                              type="text"
                              name="lastName"
                              value={formData.lastName}
                              onChange={handleInputChange}
                              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${
                                errors.lastName
                                  ? "border-red-500"
                                  : "border-gray-300"
                              } ${isViewMode ? "bg-gray-100 cursor-not-allowed" : ""}`}
                              placeholder="Enter last name"
                              disabled={isLoading || isViewMode}
                              readOnly={isViewMode}
                            />
                          )}
                          {!isViewMode && errors.lastName && (
                            <p className="text-red-500 text-xs">
                              {errors.lastName}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Address Section */}
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <Icon
                          icon="ph:map-pin-bold"
                          className="w-5 h-5 text-blue-600"
                        />
                        <h4 className="text-lg font-semibold text-gray-900">
                          Address Information
                        </h4>
                      </div>

                      <div className="space-y-4">
                        {/* Street Address */}
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Street Address{" "}
                            {!isViewMode && (
                              <span className="text-red-500">*</span>
                            )}
                          </label>
                          {isViewMode ? (
                            <div className="p-3 bg-gray-50 rounded-lg border border-gray-300">
                              <p className="text-gray-800">
                                {formData.streetAddress || "—"}
                              </p>
                            </div>
                          ) : (
                            <input
                              type="text"
                              name="streetAddress"
                              value={formData.streetAddress}
                              onChange={handleInputChange}
                              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${
                                errors.streetAddress
                                  ? "border-red-500"
                                  : "border-gray-300"
                              } ${isViewMode ? "bg-gray-100 cursor-not-allowed" : ""}`}
                              placeholder="Enter complete street address"
                              disabled={isLoading || isViewMode}
                              readOnly={isViewMode}
                            />
                          )}
                          {!isViewMode && errors.streetAddress && (
                            <p className="text-red-500 text-xs">
                              {errors.streetAddress}
                            </p>
                          )}
                        </div>

                        {/* Fixed Location Fields */}
                        <div
                          className={`p-4 rounded-lg border ${
                            isViewMode
                              ? "bg-gray-100 border-gray-300"
                              : "bg-gray-50 border-gray-200"
                          }`}
                        >
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                                Province
                              </label>
                              <div
                                className={`flex items-center gap-2 p-3 rounded-lg border ${
                                  isViewMode
                                    ? "bg-gray-200 border-gray-400"
                                    : "bg-white border-gray-300"
                                }`}
                              >
                                <Icon
                                  icon="ph:building-bold"
                                  className="w-4 h-4 text-gray-400"
                                />
                                <span className="text-gray-800">
                                  {formData.province}
                                </span>
                              </div>
                            </div>

                            <div>
                              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                                City
                              </label>
                              <div
                                className={`flex items-center gap-2 p-3 rounded-lg border ${
                                  isViewMode
                                    ? "bg-gray-200 border-gray-400"
                                    : "bg-white border-gray-300"
                                }`}
                              >
                                <Icon
                                  icon="ph:city-bold"
                                  className="w-4 h-4 text-gray-400"
                                />
                                <span className="text-gray-800">
                                  {formData.city}
                                </span>
                              </div>
                            </div>

                            <div className="sm:col-span-2 lg:col-span-1">
                              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                                Barangay
                              </label>
                              <div
                                className={`flex items-center gap-2 p-3 rounded-lg border ${
                                  isViewMode
                                    ? "bg-gray-200 border-gray-400"
                                    : "bg-white border-gray-300"
                                }`}
                              >
                                <Icon
                                  icon="ph:house-bold"
                                  className="w-4 h-4 text-gray-400"
                                />
                                <span className="text-gray-800">
                                  {formData.barangay}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Additional Info (View Mode Only) */}
                    {isViewMode && initialData && (
                      <div className="border-t border-gray-200 pt-6">
                        <div className="flex items-center gap-2 mb-4">
                          <Icon
                            icon="ph:info-bold"
                            className="w-5 h-5 text-blue-600"
                          />
                          <h4 className="text-lg font-semibold text-gray-900">
                            Additional Information
                          </h4>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Created At
                            </label>
                            <div className="p-3 bg-gray-50 rounded-lg border border-gray-300">
                              <p className="text-gray-800 text-sm">
                                {initialData.createdAt
                                  ? new Date(
                                      initialData.createdAt
                                    ).toLocaleDateString("en-US", {
                                      year: "numeric",
                                      month: "short",
                                      day: "numeric",
                                      hour: "2-digit",
                                      minute: "2-digit"
                                    })
                                  : "—"}
                              </p>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Last Updated
                            </label>
                            <div className="p-3 bg-gray-50 rounded-lg border border-gray-300">
                              <p className="text-gray-800 text-sm">
                                {initialData.updatedAt
                                  ? new Date(
                                      initialData.updatedAt
                                    ).toLocaleDateString("en-US", {
                                      year: "numeric",
                                      month: "short",
                                      day: "numeric",
                                      hour: "2-digit",
                                      minute: "2-digit"
                                    })
                                  : "—"}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="sticky bottom-0 bg-white px-4 sm:px-6 py-4 border-t border-gray-200 mt-6 -mx-4 sm:-mx-6 -mb-4 sm:-mb-6 rounded-b-xl sm:rounded-b-2xl">
                    <div className="flex flex-col-reverse sm:flex-row justify-between items-center gap-3">
                      <div className="w-full sm:w-auto">
                        {!isViewMode && (
                          <p className="text-xs text-gray-500 text-center sm:text-left">
                            Fields marked with{" "}
                            <span className="text-red-500">*</span> are required
                          </p>
                        )}
                      </div>
                      {!isViewMode && (
                        <div className="flex gap-3">
                          <button
                            type="button"
                            onClick={onClose}
                            className={
                              "px-6 py-2.5 border font-medium rounded-lg transition-all hover:shadow-sm disabled:opacity-50 border-gray-300 text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed cursor-pointer"
                            }
                            disabled={isLoading || isSubmitting}
                          >
                            Cancel
                          </button>
                          {!isViewMode && (
                            <button
                              type="submit"
                              className="px-6 py-2.5 bg-[#11285A] hover:bg-[#0d1b3d] text-white font-semibold rounded-lg transition-all hover:shadow-lg flex items-center gap-2 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                              disabled={isLoading || isSubmitting}
                            >
                              {isSubmitting ? (
                                <>
                                  <Icon
                                    icon="ph:circle-notch-bold"
                                    className="w-5 h-5 animate-spin"
                                  />
                                  {submitText}
                                </>
                              ) : (
                                <>
                                  <Icon
                                    icon="ph:check-bold"
                                    className="w-5 h-5"
                                  />
                                  {submitText}
                                </>
                              )}
                            </button>
                          )}
                          {isViewMode && (
                            <button
                              type="button"
                              onClick={() => {
                                // This would typically switch to edit mode
                                // For now, just close and let parent handle
                                onClose();
                              }}
                              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all hover:shadow-lg flex items-center gap-2 cursor-pointer"
                            >
                              <Icon
                                icon="ph:pencil-simple-bold"
                                className="w-5 h-5"
                              />
                              Edit Profile
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default VipProfileModal;
