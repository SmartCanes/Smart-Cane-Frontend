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
    <div className="min-h-screen bg-white pb-[var(--mobile-nav-height)] md:pb-0">
      {/* Header - Mobile Only */}
      <div className="md:hidden bg-primary-100 text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Icon icon="solar:document-add-linear" className="text-2xl" />
          <div>
            <h1 className="text-xl font-bold font-poppins">Send Note</h1>
            <p className="text-sm text-white/70">Compose and send a message to your contacts</p>
          </div>
        </div>
      </div>

      {/* Desktop Header */}
      <div className="hidden md:block px-8 py-6">
        <h1 className="text-3xl font-bold text-gray-900 font-poppins">Send Note</h1>
        <p className="text-gray-600 mt-2">Compose and send a message.</p>
      </div>

      {/* Content */}
      <div className="px-6 py-6 max-w-2xl mx-auto">
        {/* Message Label */}
        <label className="block text-gray-700 font-medium mb-2">
          Message
        </label>

        {/* Textarea */}
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value.slice(0, maxCharacters))}
          placeholder="Type your message here..."
          className="w-full h-48 px-4 py-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-transparent text-gray-700 placeholder-gray-400"
        />

        {/* Character Count */}
        <div className="text-sm text-gray-400 mt-2">
          {message.length} / {maxCharacters} characters
        </div>

        {/* Buttons */}
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
  );
};

export default Notes;
