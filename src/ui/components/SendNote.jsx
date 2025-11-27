import { useState } from "react";

const SendNote = () => {
  const [message, setMessage] = useState("");
  const maxLength = 500;

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 w-full font-poppins">
      <h3 className="text-xl font-semibold text-gray-800 mb-1">Send Note</h3>
      <p className="text-sm text-gray-500 mb-4">Compose and send a message.</p>

      <div className="mb-2">
        <textarea
          className="w-full h-32 p-4 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm text-gray-700 placeholder-gray-400"
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

      <div className="flex gap-3 justify-between">
        <button
          className="px-6 py-2.5 rounded-lg text-sm font-medium text-gray-600 bg-gray-200 hover:bg-gray-300 transition-colors"
          onClick={() => setMessage("")}
        >
          Cancel
        </button>
        <button className="px-6 py-2.5 rounded-lg text-sm font-medium text-white bg-[#11285A] hover:bg-[#0f172a] transition-colors">
          Send Message
        </button>
      </div>
    </div>
  );
};

export default SendNote;
