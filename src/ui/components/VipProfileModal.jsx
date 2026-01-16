import { Icon } from "@iconify/react";
import { AnimatePresence, motion } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { resolveProfileImageSrc } from "@/utils/ResolveImage";
import { validateField } from "@/utils/ValidationHelper";
import TextField from "@/ui/components/TextField";
import Toast from "./Toast";
import SelectField from "./SelectField";

const VIP_FIELDS = [
  "firstName",
  "middleName",
  "lastName",
  "relationship",
  "streetAddress"
];

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
  const initialDataRef = useRef(null);
  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    streetAddress: "",
    relationship: "",
    vipImageUrl: "",
    province: "Metro Manila",
    city: "Quezon City",
    barangay: "San Bartolome"
  });

  const [errors, setErrors] = useState(
    VIP_FIELDS.reduce((acc, field) => {
      acc[field] = "";
      return acc;
    }, {})
  );
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [imageError, setImageError] = useState("");
  const [toastConfig, setToastConfig] = useState({
    show: false,
    message: "",
    type: "info"
  });

  const fileInputRef = useRef(null);
  const formRef = useRef(null);

  const isViewMode = mode === "view";
  const isCreateMode = mode === "create";
  // const isEditMode = mode === "edit";

  useEffect(() => {
    if (!isOpen) return;

    if (initialData) {
      setFormData({
        firstName: initialData.firstName || "",
        middleName: initialData.middleName || "",
        lastName: initialData.lastName || "",
        relationship: initialData.relationship || "",
        streetAddress: initialData.streetAddress || "",
        vipImageUrl: initialData.vipImageUrl || "",
        province: initialData.province || "Metro Manila",
        city: initialData.city || "Quezon City",
        barangay: initialData.barangay || "San Bartolome",
        createdAt: initialData.created_at || "",
        updatedAt: initialData.updated_at || ""
      });

      setImagePreview(initialData.vipImageUrl || "");
      setImageFile(null);
      setImageError("");
      setErrors(
        VIP_FIELDS.reduce((acc, field) => {
          acc[field] = "";
          return acc;
        }, {})
      );
    } else {
      setFormData({
        firstName: "",
        middleName: "",
        lastName: "",
        relationship: "",
        streetAddress: "",
        vipImageUrl: "",
        province: "Metro Manila",
        city: "Quezon City",
        barangay: "San Bartolome"
      });
      setImagePreview("");
      setImageFile(null);
      setImageError("");
      setErrors(
        VIP_FIELDS.reduce((acc, field) => {
          acc[field] = "";
          return acc;
        }, {})
      );
    }

    initialDataRef.current = initialData
      ? {
          firstName: initialData.firstName || "",
          middleName: initialData.middleName || "",
          lastName: initialData.lastName || "",
          relationship: initialData.relationship || "",
          streetAddress: initialData.streetAddress || "",
          province: initialData.province || "",
          city: initialData.city || "",
          barangay: initialData.barangay || "",
          vipImageUrl: initialData.vipImageUrl || ""
        }
      : null;
  }, [isOpen, initialData]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const hasErrors = () => {
    return Object.values(errors).some((error) => error);
  };

  const hasChanges = (() => {
    if (isCreateMode) return true;

    if (!initialDataRef.current) return true;

    const original = initialDataRef.current;

    const fieldsChanged = Object.keys(original).some(
      (key) => formData[key] !== original[key]
    );

    const imageChanged = Boolean(imageFile);

    return fieldsChanged || imageChanged;
  })();

  const handleInputChange = (e) => {
    if (isViewMode) return;

    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleBlur = (name) => {
    const error = validateField(name, formData[name]);
    setErrors((prev) => ({ ...prev, [name]: error }));
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
    setFormData((prev) => ({ ...prev, vipImageUrl: "" }));
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

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    Object.keys(formData).forEach((key) => {
      const error = validateField(key, formData[key]);
      if (error) {
        newErrors[key] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isViewMode) {
      onClose();
      return;
    }

    if (!hasChanges) {
      setToastConfig({
        show: true,
        message: "No changes detected",
        type: "info"
      });
      return;
    }
    if (!validateForm()) return;

    const submitData = {
      first_name: formData.firstName || "",
      middle_name: formData.middleName || "",
      last_name: formData.lastName || "",
      relationship: formData.relationship || "",
      street_address: formData.streetAddress || "",
      province: formData.province || "Metro Manila",
      city: formData.city || "Quezon City",
      barangay: formData.barangay || "San Bartolome"
    };

    const success = await onSubmit(
      { relationship: formData.relationship, vip: { ...submitData } },
      imageFile
    );
    if (!success) return;
    setFormData({
      firstName: "",
      middleName: "",
      lastName: "",
      relationship: "",
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
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 flex justify-center items-center"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="relative z-10 w-full max-w-4xl mx-4">
            <motion.div
              className="relative bg-white rounded-2xl shadow-2xl w-full max-h-[90vh] flex flex-col border border-gray-100 overflow-y-hidden"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-200 rounded-t-2xl z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                      {title}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {isViewMode
                        ? "View VIP profile details"
                        : isCreateMode
                          ? "Fill in details to create new VIP profile"
                          : "Update VIP profile details"}
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
                    disabled={isLoading || isSubmitting}
                  >
                    <Icon icon="ph:x-bold" className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Form */}
              <div className="flex-1 overflow-y-auto">
                {isViewMode && (
                  <div className="flex flex-col gap-2">
                    <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4 p-4 border border-gray-200 bg-gray-50">
                      <div className="flex-shrink-0">
                        <div className="relative">
                          <img
                            loading="lazy"
                            src={resolveProfileImageSrc(imagePreview)}
                            alt="Profile Preview"
                            className="w-48 h-48 rounded-4xl object-cover border-2 border-white shadow-sm"
                          />
                        </div>
                      </div>

                      <div className="flex-1 sm:mt-7">
                        <div className="flex flex-col">
                          <h3 className="text-md sm:text-xl font-semibold text-gray-700">
                            {getFullName()}
                          </h3>
                          <p className="text-sm sm:text-sm text-gray-500 mt-1">
                            VIP ID: {initialData.vipId}
                          </p>
                          <p className="text-sm sm:text-sm text-gray-500 mt-1">
                            Relationship to Guardian:{" "}
                            {initialData.relationship.charAt(0).toUpperCase() +
                              initialData.relationship.slice(1) || "—"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <form onSubmit={handleSubmit} className="p-6" ref={formRef}>
                  <div className="space-y-6">
                    {/* Personal Information Section */}
                    <div className="grid md:grid-cols-2 gap-5">
                      {/* First Name */}
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                          First Name{" "}
                          {!isViewMode && (
                            <span className="text-red-500">*</span>
                          )}
                        </label>
                        {isViewMode ? (
                          <div className="mt-1 p-3 bg-gray-100 rounded-lg text-base text-gray-800 font-poppins">
                            {formData.firstName || "—"}
                          </div>
                        ) : (
                          <TextField
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            onBlur={() => handleBlur("firstName")}
                            placeholder="Enter first name"
                            error={errors.firstName}
                            disabled={isLoading}
                          />
                        )}
                      </div>

                      {/* Middle Name */}
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                          Middle Name
                        </label>
                        {isViewMode ? (
                          <div className="mt-1 p-3 bg-gray-100 rounded-lg text-base text-gray-800">
                            {formData.middleName || "—"}
                          </div>
                        ) : (
                          <TextField
                            type="text"
                            name="middleName"
                            value={formData.middleName}
                            onChange={handleInputChange}
                            handleBlur={() => handleBlur("middleName")}
                            placeholder="Enter middle name"
                            error={errors.middleName}
                            disabled={isLoading}
                          />
                        )}
                      </div>

                      {/* Last Name */}
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                          Last Name{" "}
                          {!isViewMode && (
                            <span className="text-red-500">*</span>
                          )}
                        </label>
                        {isViewMode ? (
                          <div className="mt-1 p-3 bg-gray-100 rounded-lg text-base text-gray-800 font-poppins">
                            {formData.lastName || "—"}
                          </div>
                        ) : (
                          <TextField
                            type="text"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleInputChange}
                            onBlur={() => handleBlur("lastName")}
                            placeholder="Enter last name"
                            error={errors.lastName}
                            disabled={isLoading}
                          />
                        )}
                      </div>
                      {!isViewMode && (
                        <div className="flex flex-col gap-2">
                          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            Relationship{" "}
                            {!isViewMode && (
                              <span className="text-red-500">*</span>
                            )}
                          </label>
                          <SelectField
                            name="relationship"
                            value={formData.relationship}
                            placeholder="Select Relationship..."
                            required
                            onChange={handleInputChange}
                            onCustomInputChange={handleInputChange}
                            options={[
                              { value: "parent", label: "Parent" },
                              { value: "spouse", label: "Spouse" },
                              { value: "child", label: "Child" },
                              { value: "sibling", label: "Sibling" },
                              { value: "relative", label: "Relative" },
                              { value: "guardian", label: "Guardian" },
                              { value: "others", label: "Others" }
                            ]}
                            hasCustomOption={true}
                            customOptionValue={formData.relationship}
                            error={errors.relationship}
                          />
                        </div>
                      )}

                      {/* Street Address */}
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                          Street Address{" "}
                          {!isViewMode && (
                            <span className="text-red-500">*</span>
                          )}
                        </label>
                        {isViewMode ? (
                          <div className="mt-1 p-3 bg-gray-100 rounded-lg text-base text-gray-800 font-poppins">
                            {formData.streetAddress || "—"}
                          </div>
                        ) : (
                          <TextField
                            type="text"
                            name="streetAddress"
                            value={formData.streetAddress}
                            onChange={handleInputChange}
                            onBlur={() => handleBlur("streetAddress")}
                            placeholder="Enter street address..."
                            error={errors.streetAddress}
                            disabled={isLoading}
                          />
                        )}
                      </div>

                      {/* Province */}
                      <div className="flex flex-col gap-2 mb-2">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                          Province
                        </label>
                        <div className="mt-1 p-3 bg-gray-100 rounded-lg text-sm sm:text-base text-gray-800">
                          {formData.province}
                        </div>
                      </div>

                      {/* City */}
                      <div className="flex flex-col gap-2 mb-2">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                          City
                        </label>
                        <div className="mt-1 p-3 bg-gray-100 rounded-lg text-sm sm:text-base text-gray-800">
                          {formData.city}
                        </div>
                      </div>

                      {/* Barangay */}
                      <div className="flex flex-col gap-2 mb-2">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                          Barangay
                        </label>
                        <div className="mt-1 p-3 bg-gray-100 rounded-lg text-base text-gray-800 font-poppins">
                          {formData.barangay}
                        </div>
                      </div>
                    </div>

                    {/* VIP PROFILE PHOTO SECTION */}
                    {!isViewMode && (
                      <div className="mt-6">
                        <div className="flex flex-col gap-2">
                          <div className="flex flex-col md:flex-row items-start md:items-center gap-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                            <div className="flex-shrink-0">
                              <div className="relative">
                                <img
                                  loading="lazy"
                                  src={resolveProfileImageSrc(imagePreview)}
                                  alt="Profile Preview"
                                  className="w-24 h-24 rounded-full object-cover border-2 border-white shadow-sm"
                                />
                                {!isViewMode && (
                                  <button
                                    type="button"
                                    onClick={triggerFileInput}
                                    className="absolute bottom-0 right-0 bg-[#11285A] text-white p-1.5 rounded-full hover:bg-[#0d1b3d] transition-colors"
                                    title="Change photo"
                                    disabled={
                                      isLoading ||
                                      isUploadingImage ||
                                      isSubmitting
                                    }
                                  >
                                    <Icon
                                      icon="solar:camera-bold"
                                      className="w-4 h-4"
                                    />
                                  </button>
                                )}
                              </div>
                            </div>

                            <div className="flex-1">
                              <div className="flex flex-col gap-2">
                                <div>
                                  <h4 className="text-sm font-semibold text-gray-700">
                                    Profile Photo (Optional)
                                  </h4>
                                  <p className="text-xs text-gray-500 mt-1">
                                    Upload a profile image. Maximum file size:
                                    2MB. Supported formats: JPG, PNG, GIF.
                                  </p>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-2 mt-2 w-fit">
                                  <div>
                                    <button
                                      type="button"
                                      onClick={triggerFileInput}
                                      disabled={
                                        isLoading ||
                                        isUploadingImage ||
                                        isSubmitting
                                      }
                                      className="px-4 py-2 bg-white border border-[#11285A] text-[#11285A] text-sm font-medium rounded-lg hover:bg-blue-50 transition-colors flex items-center gap-2 disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-300 disabled:cursor-not-allowed "
                                    >
                                      <Icon
                                        icon="solar:upload-bold"
                                        className="w-4 h-4"
                                      />
                                      {isUploadingImage
                                        ? "Uploading..."
                                        : "Choose Photo"}
                                    </button>
                                    <input
                                      ref={fileInputRef}
                                      type="file"
                                      accept="image/jpeg,image/jpg,image/png,image/gif"
                                      onChange={handleImageUpload}
                                      className="hidden"
                                      disabled={
                                        isLoading ||
                                        isUploadingImage ||
                                        isSubmitting
                                      }
                                    />
                                  </div>

                                  {imageFile && (
                                    <button
                                      type="button"
                                      onClick={handleRemoveImage}
                                      disabled={
                                        isLoading ||
                                        isUploadingImage ||
                                        isSubmitting
                                      }
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
                                {imageError && (
                                  <p className="text-red-500 text-xs mt-1">
                                    {imageError}
                                  </p>
                                )}
                                {!isViewMode && imageFile && (
                                  <p className="text-xs text-gray-500 mt-1">
                                    Selected: {imageFile.name} (
                                    {(imageFile.size / 1024 / 1024).toFixed(2)}{" "}
                                    MB)
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Additional Info (View Mode Only) */}
                    {isViewMode && initialData && (
                      <div className="mt-6 border-t border-gray-200 pt-6">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">
                          Additional Information
                        </h4>
                        <div className="grid md:grid-cols-2 gap-5">
                          <div className="flex flex-col gap-2">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                              Created At
                            </label>
                            <div className="mt-1 p-3 bg-gray-100 rounded-lg text-sm sm:text-base text-gray-800">
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
                            </div>
                          </div>
                          <div className="flex flex-col gap-2">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                              Last Updated
                            </label>
                            <div className="mt-1 p-3 bg-gray-100 rounded-lg text-sm sm:text-base text-gray-800">
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
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <button type="submit" className="hidden" />
                </form>
              </div>
              {/* Footer */}
              <div className="px-6 py-4 border-t border-gray-200 rounded-b-2xl">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
                  <div className="w-full sm:w-auto">
                    {!isViewMode && (
                      <p className="text-xs text-gray-500 text-center sm:text-left">
                        Fields marked with{" "}
                        <span className="text-red-500">*</span> are required
                      </p>
                    )}
                  </div>
                  <div className="flex gap-3 text-sm sm:text-base">
                    {!isViewMode && (
                      <>
                        <button
                          type="button"
                          onClick={onClose}
                          className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-300 disabled:cursor-not-allowed cursor-pointer"
                          disabled={isLoading || isSubmitting}
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => formRef.current?.requestSubmit()}
                          className="px-6 py-2.5 bg-[#11285A] text-white font-bold rounded-lg hover:bg-[#0d1b3d] transition-colors flex items-center gap-2 disabled:text-gray-400 disabled:cursor-not-allowed disabled:opacity-70 cursor-pointer"
                          disabled={
                            isLoading ||
                            isSubmitting ||
                            !hasChanges ||
                            hasErrors()
                          }
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
                              <Icon icon="ph:check-bold" className="w-5 h-5" />
                              {submitText}
                            </>
                          )}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
      {toastConfig.show && (
        <Toast
          message={toastConfig.message}
          type={toastConfig.type}
          duration={3000}
          position="bottom-right"
          onClose={() => setToastConfig((prev) => ({ ...prev, show: false }))}
        />
      )}
    </AnimatePresence>
  );
};

export default VipProfileModal;
