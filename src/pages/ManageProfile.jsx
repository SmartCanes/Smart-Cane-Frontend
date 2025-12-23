import { useState } from "react";
import { Icon } from "@iconify/react";
import avatar from "@/assets/images/team-photo.png";
import Toast from "../ui/components/Toast";
import Modal from "../ui/components/Modal";

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

const ProfileInfo = ({ label, value, isEditing, onChange, name }) => {
  const handlePhoneInput = (e) => {
    if (name === "cellphone") {
      const input = e.target.value.replace(/\D/g, ""); // Remove non-digits
      if (input.length <= 11) {
        onChange({ target: { name, value: input } });
      }
    } else {
      onChange(e);
    }
  };

  return (
    <div>
      <label className="text-sm text-gray-500 font-poppins">{label}</label>
      {isEditing ? (
        <input
          type={name === "cellphone" ? "tel" : "text"}
          name={name}
          value={value}
          onChange={handlePhoneInput}
          maxLength={name === "cellphone" ? 11 : undefined}
          placeholder={name === "cellphone" ? "09123456789" : ""}
          className="mt-1 p-3 bg-white border border-gray-300 rounded-lg text-base text-gray-800 font-poppins w-full focus:outline-none focus:ring-2 focus:ring-card-100 focus:border-transparent"
        />
      ) : (
        <div className="mt-1 p-3 bg-gray-100 rounded-lg text-base text-gray-800 font-poppins">
          {value}
        </div>
      )}
    </div>
  );
};

const ManageProfile = () => {
  const [activeTab, setActiveTab] = useState("guardian");
  const [isEditing, setIsEditing] = useState(false);
  const [toast, setToast] = useState({ show: false, type: "", message: "" });

  // Guardian State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState({
    show: false,
    guardianId: null
  });

  const [userProfile, setUserProfile] = useState({
    name: "Alexa Rawles",
    email: "alexarawles@gmail.com",
    avatar: avatar,
    fullName: "Alexa Rawles",
    cellphone: "0912345678",
    gender: "Female",
    address: "683 Quirino Highway, Brgy San Bartolome, Novaliches",
    condition: "Visually Impaired"
  });

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
    // {
    //   id: 1,
    //   name: "Juan Dela Cruz",
    //   email: "sample@gmail.com",
    //   avatar: avatar,
    //   fullName: "Juan Dela Cruz",
    //   cellphone: "0912345678",
    //   gender: "Male",
    //   address: "683 Quirino Highway, Brgy San Bartolome, Novaliches"
    // },
    // {
    //   id: 2,
    //   name: "Juan Dela Cruz",
    //   email: "sample@gmail.com",
    //   avatar: avatar,
    //   fullName: "Juan Dela Cruz",
    //   cellphone: "0912345678",
    //   gender: "Male",
    //   address: "683 Quirino Highway, Brgy San Bartolome, Novaliches"
    // }
  ];

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  // VIP Profile Handlers
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
    // Reset to original values if needed
    setUserProfile({
      name: "Alexa Rawles",
      email: "alexarawles@gmail.com",
      avatar: avatar,
      fullName: "Alexa Rawles",
      cellphone: "0912345678",
      gender: "Female",
      address: "683 Quirino Highway, Brgy San Bartolome, Novaliches",
      condition: "Visually Impaired"
    });
  };

  const handleSaveChanges = () => {
    setIsEditing(false);
    setToast({
      show: true,
      type: "success",
      message: "Profile updated successfully"
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserProfile((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // Guardian Handlers
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

    if (!navigator.onLine) {
      setToast({
        show: true,
        type: "error",
        message: "Something went wrong. Please try again."
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

  return (
    <main className="bg-white md:bg-[#f9fafb] rounded-t-[32px] md:rounded-none min-h-[calc(100vh-var(--header-height)-var(--mobile-nav-height))] md:min-h-[calc(100vh-var(--header-height))] md:max-h-[calc(100vh-var(--header-height))] overflow-y-visible md:overflow-y-auto p-6 pb-[calc(var(--mobile-nav-height)+1.5rem)] md:pb-6">
      <div className="mx-auto w-full space-y-6 sm:space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 md:mb-8">
          {/* TABS SECTION */}
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

          {/* Add Guardian Button - Only show on Guardian Tab */}
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

        {/* Toast Notification */}
        {toast.show && (
          <Toast
            type={toast.type}
            message={toast.message}
            position="top-right"
            onClose={() => setToast({ show: false, type: "", message: "" })}
          />
        )}

        {/* Delete Confirmation Toast */}
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

        {/* Add Guardian Modal */}
        {isModalOpen && (
          <Modal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title="Invite Guardian"
            modalType="info"
            footer={null} // optional
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
              // value={message}
              // onChange={(e) => setMessage(e.target.value)}
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
        )}

        {/* Guardian Profile Content */}
        {activeTab === "guardian" && (
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
        )}

        {/* VIP Profile Content */}
        {activeTab === "vip" && (
          <div className="bg-white p-4 md:p-8 rounded-2xl shadow-md border border-gray-100">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-start gap-4 mb-6 md:mb-8">
              <div className="flex items-center gap-3 md:gap-5">
                <img
                  src={userProfile.avatar}
                  alt={userProfile.name}
                  className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover flex-shrink-0"
                />
                <div>
                  <h3 className="font-bold text-xl md:text-2xl text-gray-800">
                    {userProfile.name}
                  </h3>
                  <p className="text-sm md:text-base text-gray-500 break-all">
                    {userProfile.email}
                  </p>
                </div>
              </div>
              {!isEditing ? (
                <button
                  onClick={handleEditClick}
                  className="w-full md:w-auto bg-card-100 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-800 transition-colors"
                >
                  Edit
                </button>
              ) : (
                <div className="flex gap-3 w-full md:w-auto">
                  <button
                    onClick={handleCancelEdit}
                    className="flex-1 md:flex-initial px-4 md:px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-[#FF0033] hover:text-white transition-colors font-poppins font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveChanges}
                    className="flex-1 md:flex-initial px-4 md:px-6 py-2 bg-[#2ECC71] text-white rounded-lg hover:bg-green-600 transition-colors font-poppins font-bold"
                  >
                    Save
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 md:gap-x-8 gap-y-4 md:gap-y-6">
              <ProfileInfo
                label="Full Name"
                value={userProfile.fullName}
                isEditing={isEditing}
                onChange={handleInputChange}
                name="fullName"
              />
              <ProfileInfo
                label="Cellphone Number"
                value={userProfile.cellphone}
                isEditing={isEditing}
                onChange={handleInputChange}
                name="cellphone"
              />
              <ProfileInfo
                label="Gender"
                value={userProfile.gender}
                isEditing={isEditing}
                onChange={handleInputChange}
                name="gender"
              />
              <ProfileInfo
                label="Email Address"
                value={userProfile.email}
                isEditing={isEditing}
                onChange={handleInputChange}
                name="email"
              />
              <div className="md:col-span-2">
                <ProfileInfo
                  label="Address"
                  value={userProfile.address}
                  isEditing={isEditing}
                  onChange={handleInputChange}
                  name="address"
                />
              </div>
              <ProfileInfo
                label="Condition"
                value={userProfile.condition}
                isEditing={isEditing}
                onChange={handleInputChange}
                name="condition"
              />
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default ManageProfile;
