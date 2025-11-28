import { useState } from "react";
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";
import avatar from "@/assets/images/team-photo.png";
import Header from "@/ui/components/Header";

// ... (Keep GuardianInfo and GuardianCard components exactly as they were) ...
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

const GuardianAccess = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("guardian");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [toast, setToast] = useState({ show: false, type: "", message: "" });
  const [deleteConfirm, setDeleteConfirm] = useState({
    show: false,
    guardianId: null
  });

  const handleTabClick = (tab) => {
    if (tab === "vip") {
      navigate("/manage-profile");
    } else {
      setActiveTab(tab);
    }
  };

  const handleDeleteClick = (guardianId) => {
    setDeleteConfirm({ show: true, guardianId });
  };

  const handleConfirmDelete = () => {
    // Simulate deletion (replace with actual API call)
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

    // Check if online
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
      // Simulate sending invitation (replace with actual API call)
      // Example actual API call:
      // const response = await fetch('/api/invite-guardian', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email })
      // });
      // if (!response.ok) throw new Error('Failed to send invitation');

      // Simulate network request - REMOVE THIS when you have a real API
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

  return (
    <main className="flex-1 p-6 max-h-[calc(100vh-var(--header-height)-var(--mobile-nav-height))] sm:max-h-[calc(100vh-var(--header-height))] overflow-y-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 md:mb-8">
        {/* UPDATED TABS SECTION */}
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

        {/* Add Guardian Button */}
        {activeTab === "guardian" && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-1/2 max-w-56 bg-[#2ECC71] flex justify-center items-center text-white font-bold py-2.5 md:px-6 rounded-lg hover:bg-green-600 transition-colors self-end font-poppins text-sm md:text-md"
          >
            <Icon icon="ph:user-plus-bold" className="w-5 h-5 mr-2" />
            Invite
          </button>
        )}
      </div>

      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed top-4 right-4 md:top-6 md:right-6 z-50 animate-slide-in max-w-[calc(100vw-2rem)] md:max-w-none">
          <div
            className={`${
              toast.type === "success" ? "bg-[#2ECC71]" : "bg-[#FF0033]"
            } text-white rounded-lg shadow-lg p-3 md:p-4 flex items-center gap-3 md:gap-4 min-w-[280px] md:min-w-[400px]`}
          >
            <div className="flex items-center gap-3 flex-1">
              <Icon
                icon={
                  toast.type === "success"
                    ? "ph:check-circle-fill"
                    : "ph:warning-fill"
                }
                className="w-8 h-8"
              />
              <span className="text-lg font-poppins">{toast.message}</span>
            </div>
            <button
              onClick={() => setToast({ show: false, type: "", message: "" })}
              className="hover:opacity-80"
            >
              <Icon icon="ph:x-bold" className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Toast */}
      {deleteConfirm.show && (
        <div className="fixed top-4 right-4 md:top-6 md:right-6 z-50 animate-slide-in max-w-[calc(100vw-2rem)] md:max-w-none">
          <div className="bg-gray-800 text-white rounded-lg shadow-lg p-3 md:p-4 min-w-[280px] md:min-w-[400px]">
            <div className="flex items-start gap-3 mb-4">
              <Icon
                icon="ph:warning-circle-fill"
                className="w-8 h-8 text-yellow-400 flex-shrink-0"
              />
              <div>
                <p className="text-lg font-poppins font-medium">
                  Remove Guardian?
                </p>
                <p className="text-sm text-gray-300 mt-1">
                  Are you sure you want to remove this guardian?
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleCancelDelete}
                className="flex-1 px-4 py-2 border border-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-poppins"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 px-4 py-2 bg-[#FF0033] text-white rounded-lg hover:bg-red-700 transition-colors font-poppins font-bold"
              >
                Yes, Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Guardian Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40 p-4">
          <div className="bg-white rounded-2xl p-6 md:p-8 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 font-poppins">
                Invite Guardian
              </h2>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setEmail("");
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <Icon icon="ph:x-bold" className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2 font-poppins">
                Guardian Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email address"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2ECC71] focus:border-transparent font-poppins"
              />
              <p className="mt-2 text-sm text-gray-500 font-poppins">
                An invitation will be sent to this email address
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setEmail("");
                }}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-[#FF0033] hover:text-white transition-colors font-poppins font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSendInvitation}
                className="flex-1 px-4 py-3 bg-[#2ECC71] text-white rounded-lg hover:bg-green-600 transition-colors font-poppins font-bold"
              >
                Send Invitation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      {activeTab === "guardian" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
          {guardians.map((guardian) => (
            <GuardianCard
              key={guardian.id}
              guardian={guardian}
              onDelete={handleDeleteClick}
            />
          ))}
        </div>
      )}

      {activeTab === "vip" && (
        <div className="text-center text-gray-500">
          <p>VIP Profile content goes here.</p>
        </div>
      )}
    </main>
  );
};

export default GuardianAccess;
