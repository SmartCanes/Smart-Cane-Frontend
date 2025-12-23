import { useState } from "react";
import { Icon } from "@iconify/react";
import Modal from "./Modal";
import Toast from "./Toast";

const GuardianNetwork = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "",
  });

  const guardians = [
    {
      name: "Sarah Johnson",
      role: "Primary Guardian",
      status: "Active",
      imageUrl: "https://i.pravatar.cc/150?img=1", // Placeholder image
    },
    {
      name: "Dr. Emma Wilson",
      role: "Healthcare Provider",
      status: "Offline",
      imageUrl: "https://i.pravatar.cc/150?img=2", // Placeholder image
    },
  ];

  const handleSendInvitation = async () => {
    if (!email || !email.includes("@")) {
      setToast({
        show: true,
        message: "Please enter a valid email address.",
        type: "error",
      });
      return;
    }

    // Simulate API call
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      setIsModalOpen(false);
      setEmail("");
      setMessage("");
      setToast({
        show: true,
        message: "Invitation sent successfully",
        type: "success",
      });
    } catch (error) {
      setToast({
        show: true,
        message: "Something went wrong. Please try again.",
        type: "error",
      });
    }
  };

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm p-6 w-full font-poppins">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-800">
            Guardian Network
          </h3>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-primary-100 text-white font-medium text-sm px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-900 transition-colors"
          >
            <Icon icon="ph:plus-bold" className="text-base" />
            <span>Add Guardian</span>
          </button>
        </div>

        {/* Guardian List */}
        <div className="space-y-3">
          {guardians.map((guardian, index) => (
            <div
              key={index}
              className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-4"
            >
              <img
                src={guardian.imageUrl}
                alt={guardian.name}
                className="w-14 h-14 rounded-full object-cover"
              />
              <div>
                <p className="font-semibold text-gray-900">{guardian.name}</p>
                <p className="text-gray-500 text-sm">{guardian.role}</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <span
                    className={`w-2 h-2 rounded-full ${guardian.status === "Active" ? "bg-green-500" : "bg-gray-400"}`}
                  ></span>
                  <p
                    className={`text-xs font-medium ${guardian.status === "Active" ? "text-green-600" : "text-gray-500"}`}
                  >
                    {guardian.status}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Guardian Modal */}
      {isModalOpen && (
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
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2ECC71] mb-4 outline-none"
          />

          <label className="block text-sm font-medium text-gray-700 mb-2">
            Custom Message (optional)
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Write a message..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2ECC71] mb-4 outline-none resize-none h-24"
          />

          <div className="flex gap-3 mt-2">
            <button
              onClick={() => setIsModalOpen(false)}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
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

      {/* Toast Notification */}
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          position="top-right"
          onClose={() => setToast((prev) => ({ ...prev, show: false }))}
        />
      )}
    </>
  );
};

export default GuardianNetwork;
