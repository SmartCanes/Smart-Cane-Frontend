import { useState } from "react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";

const Notes = () => {
  const [message, setMessage] = useState("");
  const maxCharacters = 500;

  const handleSend = () => {
    if (message.trim()) {
      // TODO: Implement send note functionality
      console.log("Sending message:", message);
      setMessage("");
    }
  };

  const handleCancel = () => {
    setMessage("");
  };

  return (
    <>
      <div className="bg-white md:bg-[#f9fafb] rounded-t-[32px] md:rounded-none min-h-[calc(100vh-var(--header-height)-var(--mobile-nav-height))] md:min-h-[calc(100vh-var(--header-height))] md:max-h-[calc(100vh-var(--header-height))] overflow-y-visible md:overflow-y-auto p-6 pb-[calc(var(--mobile-nav-height)+1.5rem)] md:pb-6">
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
            disabled={!message.trim()}
            className="flex items-center justify-center gap-2 px-8 py-3 rounded-xl text-sm font-semibold text-white bg-[#11285A] hover:bg-[#1e3a7a] transition-colors shadow-lg shadow-blue-900/20 flex-[2] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Icon icon="material-symbols:send-rounded" className="text-lg" />
            Send
          </button>
        </div>
      </div>

      {/* ================= DESKTOP VIEW (Original Design) ================= */}
      {/* Desktop View */}
      <div className="hidden md:block bg-white min-h-screen">
        <div className="px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Send Note</h1>
          <p className="text-gray-600 mt-2">Compose and send a message.</p>
        </div>

        <div className="px-6 py-6 max-w-2xl mx-auto">
          <label className="block text-gray-700 font-medium mb-2">
            Message
          </label>

          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value.slice(0, maxCharacters))}
            placeholder="Type your message here..."
            className="w-full h-48 px-4 py-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-transparent text-gray-700 placeholder-gray-400"
          />

          <div className="text-sm text-gray-400 mt-2">
            {message.length} / {maxCharacters} characters
          </div>

          <div className="flex gap-4 mt-6">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleCancel}
              className="flex-1 py-3 px-6 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
            >
              Cancel
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleSend}
              disabled={!message.trim()}
              className="flex-1 py-3 px-6 bg-primary-100 text-white rounded-lg font-medium hover:bg-primary-200 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Send Message
            </motion.button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Notes;
