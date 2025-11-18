import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import avatar from "@/assets/images/team-photo.png";
import DashboardSide from "./DashboardSide";
import Header from "./Header";

// ... (Keep ProfileInfo exactly as it was) ...
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
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("vip"); // Default is VIP here
  const [isEditing, setIsEditing] = useState(false);
  const [toast, setToast] = useState({ show: false, type: "", message: "" });

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

  const handleTabClick = (tab) => {
    if (tab === "guardian") {
      navigate("/guardian-access");
    } else {
      setActiveTab(tab);
    }
  };

  const handleEditClick = () => {
    setIsEditing(true);
    setToast({
      show: true,
      type: "info",
      message: "Edit mode enabled"
    });
    setTimeout(() => setToast({ show: false, type: "", message: "" }), 3000);
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
    setTimeout(() => setToast({ show: false, type: "", message: "" }), 3000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserProfile((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="flex min-h-screen bg-gray-50 font-poppins">
      <DashboardSide />
      <div className="flex-1 flex flex-col pb-16 md:pb-0">
        <Header />
        <main className="p-4 md:p-8 flex-1">
          {/* UPDATED TABS SECTION - Exact match to GuardianAccess */}
          <div className="flex items-center gap-6 md:gap-10 mb-6 md:mb-8 overflow-x-auto">
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

          {/* Toast Notification */}
          {toast.show && (
            <div className="fixed top-6 right-6 z-50 animate-slide-in">
              <div
                className={`${
                  toast.type === "success"
                    ? "bg-[#2ECC71]"
                    : toast.type === "info"
                      ? "bg-[#2196F3]"
                      : "bg-[#FF0033]"
                } text-white rounded-lg shadow-lg p-4 flex items-center gap-4 min-w-[400px]`}
              >
                <div className="flex items-center gap-3 flex-1">
                  <Icon
                    icon={
                      toast.type === "success"
                        ? "ph:check-circle-fill"
                        : toast.type === "info"
                          ? "ph:info-fill"
                          : "ph:warning-fill"
                    }
                    className="w-8 h-8"
                  />
                  <span className="text-lg font-poppins">{toast.message}</span>
                </div>
                <button
                  onClick={() =>
                    setToast({ show: false, type: "", message: "" })
                  }
                  className="hover:opacity-80"
                >
                  <Icon icon="ph:x-bold" className="w-6 h-6" />
                </button>
              </div>
            </div>
          )}

          {/* VIP Profile Content */}
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
        </main>
      </div>
    </div>
  );
};

export default ManageProfile;
