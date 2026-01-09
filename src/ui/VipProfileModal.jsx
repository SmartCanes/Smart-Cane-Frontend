import { Icon } from "@iconify/react";
import { useState, useRef, useEffect } from "react";

const VipProfileModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  isLoading = false,
  isUploadingImage = false,
  title = "VIP Profile",
  submitText = "Save Profile",
  mode = "edit" // 'view', 'create', or 'edit'
}) => {
  const [formData, setFormData] = useState({
    first_name: "",
    middle_name: "",
    last_name: "",
    street_address: "",
    vip_image_url: "",
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
        first_name: initialData.first_name || "",
        middle_name: initialData.middle_name || "",
        last_name: initialData.last_name || "",
        street_address: initialData.street_address || "",
        vip_image_url: initialData.vip_image_url || "",
        province: initialData.province || "Metro Manila",
        city: initialData.city || "Quezon City",
        barangay: initialData.barangay || "San Bartolome"
      });
      if (initialData.vip_image_url) {
        setImagePreview(initialData.vip_image_url);
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

  // Handle image upload
  const handleImageUpload = (e) => {
    if (isViewMode) return;

    const file = e.target.files[0];
    if (!file) return;

    // Validate file
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
    setFormData((prev) => ({ ...prev, vip_image_url: "" })); // Clear URL if file is uploaded
  };

  // Remove image
  const handleRemoveImage = () => {
    if (isViewMode) return;

    setImageFile(null);
    setImagePreview("");
    setImageError("");
  };

  // Trigger file input
  const triggerFileInput = () => {
    if (isViewMode) return;
    fileInputRef.current?.click();
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.first_name.trim())
      newErrors.first_name = "First name is required";
    if (!formData.last_name.trim())
      newErrors.last_name = "Last name is required";
    if (!formData.street_address.trim())
      newErrors.street_address = "Street address is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle submit
  const handleSubmit = (e) => {
    e.preventDefault();

    if (isViewMode) {
      onClose();
      return;
    }

    if (!validateForm()) return;

    const submitData = {
      ...formData,
      // If editing and no new image uploaded, keep existing URL
      vip_image_url: imageFile ? null : formData.vip_image_url
    };

    onSubmit(submitData, imageFile);
  };

  // Format full name for display
  const getFullName = () => {
    const parts = [
      formData.first_name,
      formData.middle_name,
      formData.last_name
    ].filter(Boolean);
    return parts.join(" ");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop with blur */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal container */}
      <div className="relative flex min-h-full items-center justify-center p-4 z-10">
        <div
          className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-gray-100 transform transition-all duration-300 scale-100"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div
            className={`sticky top-0 px-6 py-5 border-b border-gray-200 rounded-t-2xl z-10 ${
              isViewMode
                ? "bg-gradient-to-r from-gray-50 to-gray-100"
                : "bg-gradient-to-r from-blue-50 to-indigo-50"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-lg shadow-sm ${
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
                    className={`w-6 h-6 ${
                      isViewMode ? "text-gray-700" : "text-blue-600"
                    }`}
                  />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 font-poppins">
                    {title}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {isViewMode
                      ? "View VIP profile details"
                      : isCreateMode
                        ? "Fill in the details to create a new VIP profile"
                        : "Update VIP profile details"}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                disabled={isLoading}
                aria-label="Close modal"
              >
                <Icon icon="ph:x-bold" className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6">
            <div className="space-y-6">
              {/* Profile Photo Section */}
              <div
                className={`p-5 rounded-xl border ${
                  isViewMode
                    ? "bg-gradient-to-br from-gray-50 to-gray-100 border-gray-300"
                    : "bg-gradient-to-br from-gray-50 to-white border-gray-200"
                }`}
              >
                <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                  <div className="flex-shrink-0">
                    <div className="relative group">
                      <div
                        className={`w-28 h-28 rounded-2xl overflow-hidden border-4 shadow-lg ${
                          isViewMode
                            ? "border-gray-300 bg-gradient-to-br from-gray-200 to-gray-300"
                            : "border-white bg-gradient-to-br from-blue-100 to-indigo-100"
                        }`}
                      >
                        {imagePreview ? (
                          <img
                            src={imagePreview}
                            alt="Profile Preview"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Icon
                              icon="ph:user-bold"
                              className={`w-12 h-12 ${
                                isViewMode ? "text-gray-400" : "text-blue-300"
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
                            className="w-6 h-6 text-white"
                          />
                        </button>
                      )}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/gif"
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={isLoading || isUploadingImage || isViewMode}
                      />
                    </div>
                  </div>

                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">
                      Profile Photo
                    </h4>
                    {isViewMode ? (
                      <p className="text-sm text-gray-600 mb-4">
                        {imagePreview
                          ? "Profile image is set"
                          : "No profile image uploaded"}
                      </p>
                    ) : (
                      <p className="text-sm text-gray-600 mb-4">
                        Upload a profile image (optional). Max size: 2MB. JPG,
                        PNG, or GIF formats.
                      </p>
                    )}

                    {!isViewMode && (
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={triggerFileInput}
                          disabled={isLoading || isUploadingImage}
                          className="px-4 py-2 bg-white border border-blue-500 text-blue-600 text-sm font-medium rounded-lg hover:bg-blue-50 transition-all hover:shadow-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Icon
                            icon="ph:upload-simple-bold"
                            className="w-4 h-4"
                          />
                          {isUploadingImage ? "Uploading..." : "Upload Photo"}
                        </button>

                        {imagePreview && (
                          <button
                            type="button"
                            onClick={handleRemoveImage}
                            disabled={isLoading}
                            className="px-4 py-2 bg-white border border-red-200 text-red-600 text-sm font-medium rounded-lg hover:bg-red-50 transition-all hover:shadow-sm flex items-center gap-2"
                          >
                            <Icon icon="ph:trash-bold" className="w-4 h-4" />
                            Remove
                          </button>
                        )}
                      </div>
                    )}

                    {imageError && (
                      <p className="text-red-500 text-xs mt-2">{imageError}</p>
                    )}

                    {!isViewMode && imageFile && (
                      <p className="text-xs text-gray-500 mt-2">
                        Selected: {imageFile.name} (
                        {(imageFile.size / 1024 / 1024).toFixed(2)} MB)
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Full Name Display (View Mode) */}
              {isViewMode && (
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Icon
                      icon="ph:identification-card-bold"
                      className="w-5 h-5 text-blue-600"
                    />
                    <h4 className="text-lg font-semibold text-gray-900">
                      VIP Profile
                    </h4>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-white rounded-lg border border-blue-200">
                      <Icon
                        icon="ph:user-bold"
                        className="w-8 h-8 text-blue-500"
                      />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        {getFullName()}
                      </h3>
                      <p className="text-sm text-gray-600">
                        VIP ID: {initialData?.vip_id || "N/A"}
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

                <div className="grid md:grid-cols-3 gap-4">
                  {/* First Name */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      First Name{" "}
                      {!isViewMode && <span className="text-red-500">*</span>}
                    </label>
                    {isViewMode ? (
                      <div className="p-3 bg-gray-50 rounded-lg border border-gray-300">
                        <p className="text-gray-800">
                          {formData.first_name || "—"}
                        </p>
                      </div>
                    ) : (
                      <input
                        type="text"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${
                          errors.first_name
                            ? "border-red-500"
                            : "border-gray-300"
                        } ${isViewMode ? "bg-gray-100 cursor-not-allowed" : ""}`}
                        placeholder="Enter first name"
                        disabled={isLoading || isViewMode}
                        readOnly={isViewMode}
                      />
                    )}
                    {!isViewMode && errors.first_name && (
                      <p className="text-red-500 text-xs">
                        {errors.first_name}
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
                          {formData.middle_name || "—"}
                        </p>
                      </div>
                    ) : (
                      <input
                        type="text"
                        name="middle_name"
                        value={formData.middle_name}
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
                      {!isViewMode && <span className="text-red-500">*</span>}
                    </label>
                    {isViewMode ? (
                      <div className="p-3 bg-gray-50 rounded-lg border border-gray-300">
                        <p className="text-gray-800">
                          {formData.last_name || "—"}
                        </p>
                      </div>
                    ) : (
                      <input
                        type="text"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${
                          errors.last_name
                            ? "border-red-500"
                            : "border-gray-300"
                        } ${isViewMode ? "bg-gray-100 cursor-not-allowed" : ""}`}
                        placeholder="Enter last name"
                        disabled={isLoading || isViewMode}
                        readOnly={isViewMode}
                      />
                    )}
                    {!isViewMode && errors.last_name && (
                      <p className="text-red-500 text-xs">{errors.last_name}</p>
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

                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  {/* Street Address */}
                  <div className="md:col-span-2 space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Street Address{" "}
                      {!isViewMode && <span className="text-red-500">*</span>}
                    </label>
                    {isViewMode ? (
                      <div className="p-3 bg-gray-50 rounded-lg border border-gray-300">
                        <p className="text-gray-800">
                          {formData.street_address || "—"}
                        </p>
                      </div>
                    ) : (
                      <input
                        type="text"
                        name="street_address"
                        value={formData.street_address}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${
                          errors.street_address
                            ? "border-red-500"
                            : "border-gray-300"
                        } ${isViewMode ? "bg-gray-100 cursor-not-allowed" : ""}`}
                        placeholder="Enter complete street address"
                        disabled={isLoading || isViewMode}
                        readOnly={isViewMode}
                      />
                    )}
                    {!isViewMode && errors.street_address && (
                      <p className="text-red-500 text-xs">
                        {errors.street_address}
                      </p>
                    )}
                  </div>
                </div>

                {/* Fixed Location Fields */}
                <div
                  className={`p-4 rounded-lg border ${
                    isViewMode
                      ? "bg-gray-100 border-gray-300"
                      : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <h5 className="text-sm font-semibold text-gray-700 mb-3">
                    Fixed Location
                  </h5>
                  <div className="grid md:grid-cols-3 gap-4">
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
                        <span className="text-gray-800">{formData.city}</span>
                      </div>
                    </div>

                    <div>
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
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created At
                      </label>
                      <div className="p-3 bg-gray-50 rounded-lg border border-gray-300">
                        <p className="text-gray-800">
                          {initialData.created_at
                            ? new Date(
                                initialData.created_at
                              ).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "long",
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
                        <p className="text-gray-800">
                          {initialData.updated_at
                            ? new Date(
                                initialData.updated_at
                              ).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "long",
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
            <div className="sticky bottom-0 bg-white px-6 py-5 border-t border-gray-200 mt-8 -mx-6 -mb-6 rounded-b-2xl">
              <div className="flex justify-between items-center">
                <div>
                  {!isViewMode && (
                    <p className="text-xs text-gray-500">
                      Fields marked with <span className="text-red-500">*</span>{" "}
                      are required
                    </p>
                  )}
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className={`px-6 py-2.5 border font-medium rounded-lg transition-all hover:shadow-sm disabled:opacity-50 ${
                      isViewMode
                        ? "border-gray-300 text-gray-700 hover:bg-gray-50"
                        : "border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                    disabled={isLoading}
                  >
                    {isViewMode ? "Close" : "Cancel"}
                  </button>
                  {!isViewMode && (
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all hover:shadow-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Icon
                            icon="ph:circle-notch-bold"
                            className="w-5 h-5 animate-spin"
                          />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Icon icon="ph:check-bold" className="w-5 h-5" />
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
                      className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all hover:shadow-lg flex items-center gap-2"
                    >
                      <Icon icon="ph:pencil-simple-bold" className="w-5 h-5" />
                      Edit Profile
                    </button>
                  )}
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VipProfileModal;
