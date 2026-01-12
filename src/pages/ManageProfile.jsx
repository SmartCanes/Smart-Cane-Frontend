import { useState, useRef, useEffect } from "react";
import { Icon } from "@iconify/react";
import avatar from "@/assets/images/team-photo.png";
import Toast from "../ui/components/Toast";
import Modal from "../ui/components/Modal";
// import {
//   createVIP,
//   getMyVIP,
//   updateMyVIP,
//   deleteVIP,
//   uploadVIPImage
// } from "@/api/backendService.js";

const createVIP = () => {};
const getMyVIP = () => {};
const updateMyVIP = () => {};
const deleteVIP = () => {};
const uploadVIPImage = () => {};

// ========== REUSABLE UI COMPONENTS ==========
const TextField = ({
  type = "text",
  name,
  value,
  onChange,
  disabled,
  inputClassName = "",
  placeholder,
  maxLength
}) => (
  <input
    type={type}
    name={name}
    value={value}
    onChange={onChange}
    disabled={disabled}
    maxLength={maxLength}
    placeholder={placeholder}
    className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${inputClassName}`}
  />
);

const SelectField = ({
  placeholder,
  disabled,
  options,
  onChange,
  value,
  name
}) => (
  <select
    name={name}
    value={value}
    onChange={onChange}
    disabled={disabled}
    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white"
  >
    <option value="">{placeholder}</option>
    {options.map((option) => (
      <option key={option.value} value={option.value}>
        {option.label}
      </option>
    ))}
  </select>
);

// =============================================
// ========== GUARDIAN SECTION START ===========
// =============================================

// ========== GUARDIAN COMPONENTS ==========
const GuardianInfo = ({ label, value }) => (
  <div>
    <label className="text-xs text-gray-500 font-poppins">{label}</label>
    <div className="mt-1 p-2 bg-gray-100 rounded-md text-sm text-gray-800 font-poppins">
      {value}
    </div>
  </div>
);

const GuardianCard = ({ guardian, onDelete }) => (
  <div className="bg-white p-4 md:p-6 rounded-2xl shadow-md border border-gray-100">
    <div className="flex justify-between items-start gap-3">
      <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
        <img
          src={guardian.avatar}
          alt={guardian.name}
          className="w-14 h-14 md:w-16 md:h-16 rounded-full object-cover flex-shrink-0"
        />
        <div className="min-w-0 flex-1">
          <h3 className="font-bold text-base md:text-lg text-gray-800 font-poppins truncate">
            {guardian.name}
          </h3>
          <p className="text-xs md:text-sm text-gray-500 font-poppins truncate">
            {guardian.email}
          </p>
        </div>
      </div>
      <button
        onClick={() => onDelete(guardian.id)}
        className="text-gray-400 hover:text-red-500 flex-shrink-0 p-1"
      >
        <Icon icon="ph:trash-bold" className="w-5 h-5 md:w-6 md:h-6" />
      </button>
    </div>

    <div className="mt-4 md:mt-6 grid grid-cols-1 md:grid-cols-2 gap-x-4 md:gap-x-6 gap-y-3 md:gap-y-4">
      <GuardianInfo label="Full Name" value={guardian.fullName} />
      <GuardianInfo label="Cellphone Number" value={guardian.cellphone} />
      <GuardianInfo label="Gender" value={guardian.gender} />
      <GuardianInfo label="Email Address" value={guardian.email} />
      <div className="md:col-span-2">
        <GuardianInfo label="Address" value={guardian.address} />
      </div>
    </div>
  </div>
);

const ManageProfile = () => {
  const [activeTab, setActiveTab] = useState("guardian");
  const [toast, setToast] = useState({ show: false, type: "", message: "" });

  // ========== GUARDIAN STATES ==========
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState({
    show: false,
    guardianId: null
  });

  // ========== GUARDIAN DATA ==========
  const guardians = [
    {
      id: 1,
      name: "Juan Dela Cruz",
      email: "sample@gmail.com",
      avatar: avatar,
      fullName: "Juan Dela Cruz",
      cellphone: "0912345678",
      gender: "Male",
      address: "683 Quirino Highway, Brgy San Bartolome, Novaliches"
    },
    {
      id: 2,
      name: "Juan Dela Cruz",
      email: "sample@gmail.com",
      avatar: avatar,
      fullName: "Juan Dela Cruz",
      cellphone: "0912345678",
      gender: "Male",
      address: "683 Quirino Highway, Brgy San Bartolome, Novaliches"
    }
  ];

  // ========== GUARDIAN EVENT HANDLERS ==========
  const handleDeleteClick = (guardianId) => {
    setDeleteConfirm({ show: true, guardianId });
  };

  const handleConfirmDelete = () => {
    setToast({
      show: true,
      type: "success",
      message: "Guardian removed successfully"
    });
    setDeleteConfirm({ show: false, guardianId: null });
    setTimeout(() => setToast({ show: false, type: "", message: "" }), 3000);
  };

  const handleCancelDelete = () => {
    setDeleteConfirm({ show: false, guardianId: null });
  };

  const handleSendInvitation = async () => {
    if (!email || !email.includes("@")) {
      setToast({
        show: true,
        type: "error",
        message: "Please enter a valid email address"
      });
      setTimeout(() => setToast({ show: false, type: "", message: "" }), 3000);
      return;
    }

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      setToast({
        show: true,
        type: "success",
        message: "Invitation sent successfully"
      });
      setIsModalOpen(false);
      setEmail("");
      setTimeout(() => setToast({ show: false, type: "", message: "" }), 3000);
    } catch (error) {
      setToast({
        show: true,
        type: "error",
        message: "Something went wrong. Please try again."
      });
      setTimeout(() => setToast({ show: false, type: "", message: "" }), 3000);
    }
  };

  // ========== GUARDIAN UI RENDERING ==========
  const renderGuardianSection = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8 ">
      {guardians.length > 0 ? (
        guardians.map((guardian) => (
          <GuardianCard
            key={guardian.id}
            guardian={guardian}
            onDelete={handleDeleteClick}
          />
        ))
      ) : (
        <p className="">No Guardians Available</p>
      )}
    </div>
  );

  const renderGuardianInviteModal = () => (
    <Modal
      isOpen={isModalOpen}
      onClose={() => setIsModalOpen(false)}
      title="Invite Guardian"
      modalType="info"
      footer={null}
    >
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Guardian Email
      </label>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter email"
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2ECC71] mb-4"
      />

      <label className="block text-sm font-medium text-gray-700 mb-2">
        Custom Message (optional)
      </label>
      <textarea
        placeholder="Write a message..."
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2ECC71] mb-4"
      />

      <div className="flex gap-3 mt-2">
        <button
          onClick={() => setIsModalOpen(false)}
          className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-200 transition"
        >
          Cancel
        </button>

        <button
          onClick={handleSendInvitation}
          className="flex-1 px-4 py-2 bg-[#2ECC71] text-white rounded-lg hover:bg-green-600 transition font-bold"
        >
          Send Invite
        </button>
      </div>
    </Modal>
  );

  // ===========================================
  // ========== GUARDIAN SECTION END ===========
  // ===========================================

  // ===========================================
  // ============ VIP SECTION START ============
  // ===========================================

  // ========== VIP COMPONENTS ==========
  const ProfileInfo = ({
    label,
    value,
    isEditing,
    onChange,
    name,
    disabled = false
  }) => {
    return (
      <div>
        <label className="text-sm text-gray-500 font-poppins">{label}</label>
        {isEditing ? (
          <input
            type="text"
            name={name}
            value={value}
            onChange={onChange}
            disabled={disabled}
            className={`mt-1 p-3 bg-white border border-gray-300 rounded-lg text-base text-gray-800 font-poppins w-full focus:outline-none focus:ring-2 focus:ring-card-100 focus:border-transparent ${disabled ? "bg-gray-100 cursor-not-allowed" : ""}`}
          />
        ) : (
          <div className="mt-1 p-3 bg-gray-100 rounded-lg text-base text-gray-800 font-poppins">
            {value}
          </div>
        )}
      </div>
    );
  };

  // ========== VIP STATES ==========
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingVIP, setIsLoadingVIP] = useState(true);
  const [hasVIPProfile, setHasVIPProfile] = useState(false);
  const [showVIPModal, setShowVIPModal] = useState(false);
  const [vipDeleteConfirm, setVipDeleteConfirm] = useState({
    show: false,
    vipId: null
  });
  const fileInputRef = useRef(null);
  const editFileInputRef = useRef(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageError, setImageError] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [editImageFile, setEditImageFile] = useState(null);

  const [vipFormData, setVipFormData] = useState({
    name: "",
    street_address: "",
    province: "Metro Manila",
    barangay: "San Bartolome",
    city: "Quezon City"
  });

  const [errors, setErrors] = useState({
    name: "",
    street_address: ""
  });

  const [userProfile, setUserProfile] = useState({
    name: "",
    avatar: avatar,
    fullName: "",
    address: "",
    street_address: "",
    province: "Metro Manila",
    city: "Quezon City",
    barangay: "San Bartolome"
  });

  const [vipId, setVipId] = useState(null);

  useEffect(() => {
    if (activeTab === "vip") {
      fetchVIPProfile();
    }
  }, [activeTab]);

  // ========== VIP VALIDATION FUNCTIONS ==========
  const validateName = (name) => {
    if (!name.trim()) {
      return "Full name is required";
    }

    if (name.trim().length < 2) {
      return "Name must be at least 2 characters long";
    }

    if (name.trim().length > 100) {
      return "Name must be less than 100 characters";
    }

    const nameRegex =
      /^[A-Za-z\s\-\'\.]+(?:\s+(?:Jr\.?|Sr\.?|I{1,3}|IV|V|VI|VII|VIII|IX|X))?$/i;

    if (!nameRegex.test(name.trim())) {
      return "Name can only contain letters, spaces, hyphens (-), apostrophes ('), and extensions (Jr, Sr, I, II, III, etc.)";
    }

    if (/(\s{2,}|-\s|\s-|'\s|\s'|\.\s|\s\.)/.test(name)) {
      return "Invalid spacing or consecutive special characters";
    }

    if (/^[\s\-']|[\s\-']$/.test(name.trim())) {
      return "Name cannot start or end with spaces, hyphens, or apostrophes";
    }

    const words = name.trim().split(/\s+/);
    for (let word of words) {
      if (
        word.length === 2 &&
        word.endsWith(".") &&
        /^[A-Za-z]\.$/.test(word)
      ) {
        continue;
      }
      if (word.length === 1 && /^[A-Za-z]$/.test(word)) {
        return "Single letters must be followed by a period (e.g., 'J.' not 'J')";
      }
    }

    return "";
  };

  const validateStreetAddress = (address) => {
    if (!address.trim()) {
      return "Street address is required";
    }

    if (address.trim().length < 5) {
      return "Street address must be at least 5 characters long";
    }

    if (address.trim().length > 200) {
      return "Street address must be less than 200 characters";
    }

    return "";
  };

  const validateVIPForm = () => {
    const newErrors = {};

    const nameError = validateName(vipFormData.name);
    if (nameError) {
      newErrors.name = nameError;
    }

    const addressError = validateStreetAddress(vipFormData.street_address);
    if (addressError) {
      newErrors.street_address = addressError;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ========== VIP IMAGE UPLOAD FUNCTIONS ==========
  const uploadVIPImageToBackend = async (vipId, file) => {
    try {
      if (!file || !vipId) {
        throw new Error("No image file or VIP ID provided");
      }

      setIsUploadingImage(true);

      const response = await uploadVIPImage(vipId, file);

      if (response && response.data && response.data.avatar) {
        return response.data.avatar;
      }
      return "";
    } catch (error) {
      console.error("Error uploading VIP image:", error);
      setToast({
        show: true,
        type: "error",
        message:
          error.response?.data?.message ||
          "Failed to upload image. Please try again."
      });
      return "";
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleImageUploadForCreation = async (file) => {
    try {
      if (!file) return "";
      return "";
    } catch (error) {
      console.error("Error preparing image:", error);
      return "";
    }
  };

  // ========== VIP API FUNCTIONS ==========
  const fetchVIPProfile = async () => {
    setIsLoadingVIP(true);
    try {
      const response = await getMyVIP();
      if (response && response.data) {
        const vipData = response.data;
        setHasVIPProfile(true);
        setVipId(vipData.id);

        let avatarUrl = vipData.avatar || avatar;

        setUserProfile({
          name: vipData.name || vipData.fullName || "",
          avatar: avatarUrl,
          fullName: vipData.name || vipData.fullName || "",
          street_address: vipData.street_address || "",
          province: "Metro Manila",
          city: "Quezon City",
          barangay: "San Bartolome",
          address: vipData.address || ""
        });

        setVipFormData({
          name: vipData.name || vipData.fullName || "",
          street_address: vipData.street_address || "",
          province: "Metro Manila",
          barangay: "San Bartolome",
          city: "Quezon City"
        });
      } else {
        setHasVIPProfile(false);
        resetVIPForm();
      }
    } catch (error) {
      if (error.response?.status === 404) {
        setHasVIPProfile(false);
        resetVIPForm();
      } else {
        console.error("Error fetching VIP profile:", error);
        setToast({
          show: true,
          type: "error",
          message: "Failed to load VIP profile"
        });
      }
      setHasVIPProfile(false);
    } finally {
      setIsLoadingVIP(false);
    }
  };

  const handleEditClick = () => {
    setIsEditing(true);
    setToast({
      show: true,
      type: "info",
      message: "Edit mode enabled"
    });
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditImageFile(null);
    fetchVIPProfile();
  };

  const handleSaveChanges = async () => {
    const nameError = validateName(userProfile.fullName);
    const addressError = validateStreetAddress(userProfile.street_address);

    if (nameError || addressError) {
      setToast({
        show: true,
        type: "error",
        message: nameError || addressError
      });
      return;
    }

    setIsLoading(true);
    try {
      let avatarUrl = userProfile.avatar;

      if (editImageFile && vipId) {
        const uploadedUrl = await uploadVIPImageToBackend(vipId, editImageFile);
        if (uploadedUrl) {
          avatarUrl = uploadedUrl;
        }
      }

      const updatedData = {
        name: userProfile.fullName,
        street_address: userProfile.street_address,
        province: "Metro Manila",
        city: "Quezon City",
        barangay: "San Bartolome",
        avatar: avatarUrl
      };

      const response = await updateMyVIP(updatedData);

      if (response && response.data) {
        setIsEditing(false);
        setEditImageFile(null);
        setToast({
          show: true,
          type: "success",
          message: "VIP profile updated successfully"
        });
        fetchVIPProfile();
      }
    } catch (error) {
      console.error("Error updating VIP profile:", error);
      setToast({
        show: true,
        type: "error",
        message: error.response?.data?.message || "Failed to update VIP profile"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserProfile((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleVipFormChange = (e) => {
    const { name, value } = e.target;
    setVipFormData((prev) => ({
      ...prev,
      [name]: value
    }));

    if (name === "name") {
      const error = validateName(value);
      setErrors((prev) => ({
        ...prev,
        [name]: error
      }));
    } else if (name === "street_address") {
      const error = validateStreetAddress(value);
      setErrors((prev) => ({
        ...prev,
        [name]: error
      }));
    } else {
      if (errors[name]) {
        setErrors((prev) => ({
          ...prev,
          [name]: ""
        }));
      }
    }
  };

  const handleAddVIPProfile = () => {
    if (hasVIPProfile) {
      setToast({
        show: true,
        type: "info",
        message:
          "You already have a VIP profile. Edit your existing profile instead."
      });
      return;
    }
    setShowVIPModal(true);
  };

  const handleCreateVIPProfile = async () => {
    if (!validateVIPForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        name: vipFormData.name,
        street_address: vipFormData.street_address,
        province: "Metro Manila",
        city: "Quezon City",
        barangay: "San Bartolome",
        avatar: ""
      };

      const response = await createVIP(payload);

      if (response && response.data) {
        const newVipId = response.data.id;
        setVipId(newVipId);
        setHasVIPProfile(true);

        if (imageFile && newVipId) {
          const uploadedUrl = await uploadVIPImageToBackend(
            newVipId,
            imageFile
          );
          if (uploadedUrl) {
            await updateMyVIP({
              avatar: uploadedUrl
            });
          }
        }

        setShowVIPModal(false);
        setToast({
          show: true,
          type: "success",
          message: "VIP profile created successfully"
        });

        setUserProfile({
          name: vipFormData.name,
          avatar: response.data.avatar || avatar,
          fullName: vipFormData.name,
          street_address: vipFormData.street_address,
          province: "Metro Manila",
          city: "Quezon City",
          barangay: "San Bartolome",
          address: `${vipFormData.street_address}, San Bartolome, Quezon City, Metro Manila`
        });

        resetVIPForm();
        setImageFile(null);
        setImageError("");

        fetchVIPProfile();
      }
    } catch (error) {
      console.error("Error creating VIP profile:", error);
      setToast({
        show: true,
        type: "error",
        message:
          error.response?.data?.message ||
          "Failed to create VIP profile. Please check all required fields."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteVIPProfile = async () => {
    if (!vipId) return;

    setIsLoading(true);
    try {
      const response = await deleteVIP(vipId);

      if (response && response.success) {
        setHasVIPProfile(false);
        setVipId(null);
        resetVIPForm();
        setVipDeleteConfirm({ show: false, vipId: null });

        setToast({
          show: true,
          type: "success",
          message: response.message || "VIP profile deleted successfully"
        });

        setUserProfile({
          name: "",
          avatar: avatar,
          fullName: "",
          address: "",
          street_address: "",
          province: "Metro Manila",
          city: "Quezon City",
          barangay: "San Bartolome"
        });
      } else {
        setToast({
          show: true,
          type: "error",
          message: response?.message || "Failed to delete VIP profile"
        });
      }
    } catch (error) {
      console.error("Error deleting VIP profile:", error);
      setToast({
        show: true,
        type: "error",
        message: error.response?.data?.message || "Failed to delete VIP profile"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetVIPForm = () => {
    setVipFormData({
      name: "",
      street_address: "",
      province: "Metro Manila",
      barangay: "San Bartolome",
      city: "Quezon City"
    });
    setErrors({
      name: "",
      street_address: ""
    });
  };

  // ========== VIP IMAGE HANDLERS ==========
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const triggerEditFileInput = () => {
    editFileInputRef.current?.click();
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setImageError("File size must be less than 2MB");
      return;
    }

    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
    if (!validTypes.includes(file.type)) {
      setImageError("Only JPG, PNG, and GIF files are allowed");
      return;
    }

    setImageFile(file);
    setImageError("");
  };

  const handleEditImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setToast({
        show: true,
        type: "error",
        message: "File size must be less than 2MB"
      });
      return;
    }

    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
    if (!validTypes.includes(file.type)) {
      setToast({
        show: true,
        type: "error",
        message: "Only JPG, PNG, and GIF files are allowed"
      });
      return;
    }

    setEditImageFile(file);

    const imageUrl = URL.createObjectURL(file);
    setUserProfile((prev) => ({
      ...prev,
      avatar: imageUrl
    }));
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveEditImage = () => {
    setEditImageFile(null);
    fetchVIPProfile();
    if (editFileInputRef.current) {
      editFileInputRef.current.value = "";
    }
  };

  // ========== VIP UI RENDERING ==========
  const renderVIPSection = () => {
    if (isLoadingVIP) {
      return (
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-center">
            <Icon
              icon="eos-icons:loading"
              className="w-12 h-12 text-blue-500 mx-auto mb-4"
            />
            <p className="text-gray-500">Loading VIP profile...</p>
          </div>
        </div>
      );
    }

    if (hasVIPProfile) {
      return (
        <div className="bg-white p-4 md:p-8 rounded-2xl shadow-md border border-gray-100">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-start gap-4 mb-6 md:mb-8">
            <div className="flex items-center gap-3 md:gap-5">
              <div className="relative">
                <img
                  src={userProfile.avatar}
                  alt={userProfile.name}
                  className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover flex-shrink-0"
                />
                {isEditing && (
                  <button
                    onClick={triggerEditFileInput}
                    className="absolute bottom-0 right-0 bg-[#11285A] text-white p-1.5 rounded-full hover:bg-[#0d1b3d] transition-colors"
                    title="Change photo"
                    disabled={isLoading}
                  >
                    <Icon icon="solar:camera-bold" className="w-4 h-4" />
                  </button>
                )}
                <input
                  ref={editFileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/gif"
                  onChange={handleEditImageUpload}
                  className="hidden"
                  disabled={isLoading}
                />
              </div>
              <div>
                <h3 className="font-bold text-xl md:text-2xl text-gray-800 break-words max-w-md">
                  {userProfile.name || userProfile.fullName}
                </h3>
              </div>
            </div>
            <div className="flex gap-3 w-full md:w-auto">
              {!isEditing ? (
                <>
                  <button
                    onClick={handleEditClick}
                    className="flex-1 md:flex-initial px-4 md:px-6 py-2 bg-card-100 text-white font-bold rounded-lg hover:bg-blue-800 transition-colors"
                    disabled={isLoading}
                  >
                    {isLoading ? "Loading..." : "Edit"}
                  </button>
                  <button
                    onClick={() => setVipDeleteConfirm({ show: true, vipId })}
                    className="flex-1 md:flex-initial px-4 md:px-6 py-2 border border-red-500 text-red-500 rounded-lg hover:bg-red-50 transition-colors font-poppins font-medium"
                    disabled={isLoading}
                  >
                    Delete
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleCancelEdit}
                    className="flex-1 md:flex-initial px-4 md:px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-[#FF0033] hover:text-white transition-colors font-poppins font-medium"
                    disabled={isLoading}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveChanges}
                    className="flex-1 md:flex-initial px-4 md:px-6 py-2 bg-[#2ECC71] text-white rounded-lg hover:bg-green-600 transition-colors font-poppins font-bold"
                    disabled={isLoading}
                  >
                    {isLoading ? "Saving..." : "Save"}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* VIP PROFILE DETAILS SECTION */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 md:gap-x-8 gap-y-4 md:gap-y-6">
            <ProfileInfo
              label="Full Name"
              value={userProfile.fullName}
              isEditing={isEditing}
              onChange={handleInputChange}
              name="fullName"
            />
            <ProfileInfo
              label="Street Address"
              value={userProfile.street_address}
              isEditing={isEditing}
              onChange={handleInputChange}
              name="street_address"
            />
            <ProfileInfo
              label="Barangay"
              value={userProfile.barangay}
              isEditing={isEditing}
              onChange={handleInputChange}
              name="barangay"
              disabled={true}
            />
            <ProfileInfo
              label="City"
              value={userProfile.city}
              isEditing={isEditing}
              onChange={handleInputChange}
              name="city"
              disabled={true}
            />
            <ProfileInfo
              label="Province"
              value={userProfile.province}
              isEditing={isEditing}
              onChange={handleInputChange}
              name="province"
              disabled={true}
            />
          </div>

          {/* VIP PROFILE PHOTO SECTION (EDIT MODE ONLY) */}
          {isEditing && (
            <div className="mt-8 p-4 border border-gray-200 rounded-lg bg-gray-50">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                <div className="flex-shrink-0">
                  <div className="relative">
                    <img
                      src={userProfile.avatar}
                      alt="Profile Preview"
                      className="w-24 h-24 rounded-full object-cover border-2 border-white shadow-sm"
                    />
                  </div>
                </div>

                <div className="flex-1">
                  <div className="flex flex-col gap-2">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700">
                        Profile Photo
                      </h4>
                      <p className="text-xs text-gray-500 mt-1">
                        Upload a new profile image. Maximum file size: 2MB.
                        Supported formats: JPG, PNG, GIF.
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2 mt-2">
                      <div>
                        <button
                          type="button"
                          onClick={triggerEditFileInput}
                          disabled={isLoading}
                          className="px-4 py-2 bg-white border border-[#11285A] text-[#11285A] text-sm font-medium rounded-lg hover:bg-blue-50 transition-colors flex items-center gap-2 disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-300 disabled:cursor-not-allowed"
                        >
                          <Icon icon="solar:upload-bold" className="w-4 h-4" />
                          Upload New Photo
                        </button>
                      </div>

                      {userProfile.avatar !== avatar && (
                        <button
                          type="button"
                          onClick={handleRemoveEditImage}
                          disabled={isLoading}
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

                    {editImageFile && (
                      <p className="text-xs text-gray-500 mt-1">
                        New photo selected: {editImageFile.name} (
                        {(editImageFile.size / 1024 / 1024).toFixed(2)} MB)
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="bg-white p-8 md:p-12 rounded-2xl shadow-md border border-gray-100 flex flex-col items-center justify-center min-h-[400px]">
        <div className="text-center max-w-md mx-auto w-full">
          <div className="mb-6">
            <Icon
              icon="ph:user-circle-duotone"
              className="w-20 h-20 text-gray-300 mx-auto"
            />
          </div>

          <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-3 font-poppins">
            No VIP Profile Yet
          </h3>

          <p className="text-gray-500 mb-8 font-poppins">
            Please add your VIP profile information.
          </p>

          <div className="flex justify-center">
            <button
              onClick={handleAddVIPProfile}
              className="bg-card-100 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-800 transition-colors flex items-center justify-center gap-2 font-poppins"
              disabled={isLoading}
            >
              <Icon icon="ph:plus-bold" className="w-5 h-5" />
              {isLoading ? "Creating..." : "Add VIP Profile"}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderVIPCreationModal = () => (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 backdrop-blur-sm" />

      <div className="relative flex min-h-full items-center justify-center p-4 z-10">
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-gray-100">
          <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-200 rounded-t-2xl z-10">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">
                Create VIP Profile
              </h3>
              <button
                onClick={() => setShowVIPModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
                disabled={isLoading}
              >
                <Icon icon="ph:x-bold" className="w-6 h-6" />
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Fill in the details to create your VIP profile
            </p>
          </div>

          <div className="p-6">
            <div className="grid md:grid-cols-2 gap-5">
              {/* VIP NAME FIELD */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Full Name *
                </label>
                <TextField
                  type="text"
                  name="name"
                  value={vipFormData.name}
                  onChange={handleVipFormChange}
                  inputClassName={`bg-white ${errors.name ? "border-red-500" : ""}`}
                  placeholder="e.g., John Smith Jr or Maria Santos-Garcia II"
                  disabled={isLoading}
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                )}
              </div>

              {/* VIP STREET ADDRESS FIELD */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Street Address *
                </label>
                <TextField
                  name="street_address"
                  value={vipFormData.street_address}
                  placeholder="Enter street address..."
                  onChange={handleVipFormChange}
                  inputClassName={`bg-white ${errors.street_address ? "border-red-500" : ""}`}
                  disabled={isLoading}
                />
                {errors.street_address && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.street_address}
                  </p>
                )}
              </div>

              {/* VIP FIXED LOCATION FIELDS */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Province
                </label>
                <div className="mt-1 p-3 bg-gray-100 rounded-lg text-base text-gray-800 font-poppins">
                  Metro Manila
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Province is fixed to Metro Manila
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  City
                </label>
                <div className="mt-1 p-3 bg-gray-100 rounded-lg text-base text-gray-800 font-poppins">
                  Quezon City
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  City is fixed to Quezon City
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Barangay
                </label>
                <div className="mt-1 p-3 bg-gray-100 rounded-lg text-base text-gray-800 font-poppins">
                  San Bartolome
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Barangay is fixed to San Bartolome
                </p>
              </div>
            </div>

            {/* VIP PROFILE PHOTO SECTION */}
            <div className="mt-6 md:col-span-2">
              <div className="flex flex-col gap-2">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <div className="flex-shrink-0">
                    <div className="relative">
                      <img
                        src={
                          imageFile ? URL.createObjectURL(imageFile) : avatar
                        }
                        alt="Profile Preview"
                        className="w-24 h-24 rounded-full object-cover border-2 border-white shadow-sm"
                      />
                      <button
                        onClick={triggerFileInput}
                        className="absolute bottom-0 right-0 bg-[#11285A] text-white p-1.5 rounded-full hover:bg-[#0d1b3d] transition-colors"
                        title="Change photo"
                        disabled={isLoading || isUploadingImage}
                      >
                        <Icon icon="solar:camera-bold" className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="flex flex-col gap-2">
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700">
                          Profile Photo (Optional)
                        </h4>
                        <p className="text-xs text-gray-500 mt-1">
                          Upload a profile image. Maximum file size: 2MB.
                          Supported formats: JPG, PNG, GIF.
                        </p>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2 mt-2">
                        <div>
                          <button
                            type="button"
                            onClick={triggerFileInput}
                            disabled={isLoading || isUploadingImage}
                            className="px-4 py-2 bg-white border border-[#11285A] text-[#11285A] text-sm font-medium rounded-lg hover:bg-blue-50 transition-colors flex items-center gap-2 disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-300 disabled:cursor-not-allowed"
                          >
                            <Icon
                              icon="solar:upload-bold"
                              className="w-4 h-4"
                            />
                            {isUploadingImage ? "Uploading..." : "Choose Photo"}
                          </button>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/jpg,image/png,image/gif"
                            onChange={handleImageUpload}
                            className="hidden"
                            disabled={isLoading || isUploadingImage}
                          />
                        </div>

                        {imageFile && (
                          <button
                            type="button"
                            onClick={handleRemoveImage}
                            disabled={isLoading || isUploadingImage}
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
          </div>

          <div className="sticky bottom-0 bg-white px-6 py-4 border-t border-gray-200 rounded-b-2xl">
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowVIPModal(false)}
                className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateVIPProfile}
                className="px-6 py-2.5 bg-[#11285A] text-white font-bold rounded-lg hover:bg-[#0d1b3d] transition-colors flex items-center gap-2"
                disabled={isLoading}
              >
                <Icon icon="ph:check-bold" className="w-5 h-5" />
                {isLoading ? "Creating..." : "Create Profile"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // =========================================
  // ============ VIP SECTION END ============
  // =========================================

  // ========== SHARED EVENT HANDLERS ==========
  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  return (
    <main className="bg-white md:bg-[#f9fafb] rounded-t-[32px] md:rounded-none min-h-[calc(100vh-var(--header-height)-var(--mobile-nav-height))] md:min-h-[calc(100vh-var(--header-height))] md:max-h-[calc(100vh-var(--header-height))] overflow-y-visible md:overflow-y-auto p-6 pb-[calc(var(--mobile-nav-height)+1.5rem)] md:pb-6">
      <div className="mx-auto w-full space-y-6 sm:space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 md:mb-8">
          <div className="flex items-center gap-6 md:gap-10 overflow-x-auto w-full md:w-auto">
            <button
              onClick={() => handleTabClick("guardian")}
              className={`relative pb-2 text-base md:text-lg whitespace-nowrap transition-colors duration-200 ${
                activeTab === "guardian"
                  ? "text-slate-800 font-medium"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Guardian Profile
              {activeTab === "guardian" && (
                <span className="absolute bottom-0 left-0 w-full h-[2px] bg-slate-900"></span>
              )}
            </button>

            <button
              onClick={() => handleTabClick("vip")}
              className={`relative pb-2 text-base md:text-lg whitespace-nowrap transition-colors duration-200 ${
                activeTab === "vip"
                  ? "text-slate-800 font-medium"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              VIP Profile
              {activeTab === "vip" && (
                <span className="absolute bottom-0 left-0 w-full h-[2px] bg-slate-900"></span>
              )}
            </button>
          </div>

          {/* GUARDIAN INVITE BUTTON */}
          {activeTab === "guardian" && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="w-1/2 max-w-56 bg-[#2ECC71] flex justify-center items-center text-white font-bold py-2.5 md:px-6 rounded-lg hover:bg-green-600 transition-colors self-end font-poppins text-sm md:text-md gap-2"
            >
              <Icon icon="ph:user-plus-bold" className="w-5 h-5 mr-2" />
              Invite
            </button>
          )}
        </div>

        {/* TOAST NOTIFICATIONS (SHARED) */}
        {toast.show && (
          <Toast
            type={toast.type}
            message={toast.message}
            position="top-right"
            onClose={() => setToast({ show: false, type: "", message: "" })}
          />
        )}

        {/* GUARDIAN DELETE CONFIRMATION MODAL */}
        {deleteConfirm.show && (
          <Modal
            isOpen={deleteConfirm.show}
            onClose={handleCancelDelete}
            title="Remove Guardian?"
            modalType="error"
            message="Are you sure you want to remove this guardian?"
            handleCancel={handleCancelDelete}
            handleConfirm={handleConfirmDelete}
          ></Modal>
        )}

        {/* VIP DELETE CONFIRMATION MODAL */}
        {vipDeleteConfirm.show && (
          <Modal
            isOpen={vipDeleteConfirm.show}
            onClose={() => setVipDeleteConfirm({ show: false, vipId: null })}
            title="Delete VIP Profile?"
            modalType="error"
            message="Are you sure you want to delete your VIP profile? This action cannot be undone."
            handleCancel={() =>
              setVipDeleteConfirm({ show: false, vipId: null })
            }
            handleConfirm={handleDeleteVIPProfile}
          />
        )}

        {/* GUARDIAN INVITE MODAL */}
        {isModalOpen && renderGuardianInviteModal()}

        {/* GUARDIAN SECTION */}
        {activeTab === "guardian" && renderGuardianSection()}

        {/* VIP SECTION */}
        {activeTab === "vip" && renderVIPSection()}

        {/* VIP CREATION MODAL */}
        {showVIPModal && renderVIPCreationModal()}
      </div>
    </main>
  );
};

export default ManageProfile;
