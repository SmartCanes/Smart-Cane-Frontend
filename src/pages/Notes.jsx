import { useState } from "react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import FeedbackModal from "@/ui/feedbackmodal";

const Notes = () => {
  const [message, setMessage] = useState("");
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: "",
    message: "",
    variant: "default"
  });
  const maxCharacters = 500;

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

  const handleCancel = () => {
    setMessage("");
  };

  return (
    <>
      {/* Mobile View */}
      <div className="md:hidden bg-white rounded-t-[32px] min-h-[calc(100vh-var(--header-height)-var(--mobile-nav-height))] overflow-y-visible p-6 pb-[calc(var(--mobile-nav-height)+1.5rem)]">
        <div className="mb-6">
          <h3 className="text-xl font-bold text-[#11285A] mb-1">Send Note</h3>
          <p className="text-sm text-gray-500 mb-4">
            Compose and send a message to your contacts
          </p>
          <div className="w-full h-[1px] bg-gray-100"></div>
        </div>

        {/* Textarea */}
        <div className="mb-4 flex-1">
          <label className="block text-sm font-bold text-[#11285A] mb-3">
            Message
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value.slice(0, maxCharacters))}
            placeholder="Type your message here..."
            className="w-full h-64 p-4 border border-gray-200 bg-white rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-primary-100/50 focus:border-primary-100 text-sm text-gray-700 placeholder-gray-300 shadow-sm transition-all"
          />
          <div className="text-right mt-2">
            <span className="text-xs text-gray-400 font-medium">
              {message.length} / {maxCharacters} characters
            </span>
          </div>
        </div>

        {/* Buttons Footer */}
        <div className="flex items-center justify-between gap-4 mt-auto">
          <button
            onClick={handleCancel}
            className="px-6 py-3 rounded-xl text-sm font-semibold text-[#11285A] hover:bg-gray-50 transition-colors flex-1"
          >
            Cancel
          </button>

          <button
            onClick={handleSend}
            className="flex items-center justify-center gap-2 px-8 py-3 rounded-xl text-sm font-semibold text-white bg-[#11285A] hover:bg-[#1e3a7a] transition-colors shadow-lg shadow-blue-900/20 flex-[2] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Icon icon="material-symbols:send-rounded" className="text-lg" />
            Send
          </button>
        </div>
      </div>

      {/* Desktop View */}
      <div className="hidden md:block bg-[#F9FAFB] min-h-[calc(100vh-var(--header-height))] p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-[#11285A]">Send Note</h1>
            <p className="text-gray-500 mt-1">
              Compose and send a message to your contacts
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-8">
            <label className="block text-[#11285A] font-semibold mb-3">
              Message
            </label>

            <textarea
              value={message}
              onChange={(e) =>
                setMessage(e.target.value.slice(0, maxCharacters))
              }
              placeholder="Type your message here..."
              className="w-full h-64 p-4 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-primary-100/50 focus:border-primary-100 text-gray-700 placeholder-gray-400 transition-all"
            />

            <div className="text-right mt-2 mb-8">
              <span className="text-sm text-gray-400 font-medium">
                {message.length} / {maxCharacters} characters
              </span>
            </div>

            <div className="flex justify-end gap-4">
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleCancel}
                className="px-8 py-3 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleSend}
                className="flex items-center gap-2 px-8 py-3 bg-[#11285A] text-white rounded-xl font-semibold hover:bg-[#1e3a7a] transition-colors shadow-lg shadow-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Icon
                  icon="material-symbols:send-rounded"
                  className="text-lg"
                />
                Send Message
              </motion.button>
            </div>
          </div>
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

export default Notes;
