import { useState } from "react";
import { Icon } from "@iconify/react";
import FeedbackModal from "../feedbackmodal";

const SendNote = () => {
  const [message, setMessage] = useState("");
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: "",
    message: "",
    variant: "default"
  });
  const maxLength = 500;

  const handleSend = () => {
    if (!message.trim()) {
      setModalConfig({
        isOpen: true,
        title: "Error!",
        message: "Please enter a message before sending.",
        variant: "error"
      });
      return;
    }

    // Simulate sending logic
    const isSuccess = true; // Toggle this to test error state

    if (isSuccess) {
      setModalConfig({
        isOpen: true,
        title: "Sent!",
        message: "Your message has been sent to Mr. Dela Cruz",
        variant: "default" // Using default (dark blue) as per screenshot/request for primary look
      });
      setMessage("");
    } else {
      setModalConfig({
        isOpen: true,
        title: "Failed!",
        message: "Something went wrong. Please try again.",
        variant: "error"
      });
    }
  };

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm p-6 w-full font-poppins">
        <h3 className="text-xl font-semibold text-gray-900 mb-1">Send Note</h3>
        <p className="text-sm text-gray-500 mb-6">
          Compose and send a message to your contacts
        </p>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Message
          </label>
          <textarea
            className="w-full h-48 p-4 border border-gray-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-transparent text-sm text-gray-700 placeholder-gray-400"
            placeholder="Type your message here..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={maxLength}
          ></textarea>
        </div>

        <div className="flex justify-between items-center mb-6">
          <span className="text-xs text-gray-400">
            {message.length} / {maxLength} characters
          </span>
        </div>

        <div className="flex gap-3">
          <button
            className="flex-1 px-6 py-3 rounded-xl text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
            onClick={() => setMessage("")}
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            className="flex items-center justify-center gap-2 flex-1 px-6 py-3 rounded-xl text-sm font-medium text-white bg-primary-100 hover:bg-primary-200 transition-colors"
          >
            <Icon icon="solar:plain-bold" className="text-lg rotate-45" />
            Send
          </button>
        </div>
      </div>

      <FeedbackModal
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig((prev) => ({ ...prev, isOpen: false }))}
        title={modalConfig.title}
        message={modalConfig.message}
        variant={modalConfig.variant}
      />
    </>
  );
};

export default SendNote;
