import { useState, useEffect } from "react"; // 1. Added useState and useEffect
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@iconify/react";

const TermsAndConditions = ({ isOpen, onClose, onAccept }) => {
  // 2. State para sa checkbox
  const [isChecked, setIsChecked] = useState(false);

  // Reset checkbox kapag nagsara o nagbukas ulit ang modal
  useEffect(() => {
    if (isOpen) {
      setIsChecked(false);
    }
  }, [isOpen]);

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[85vh] flex flex-col font-poppins"
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.2 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                Terms and Conditions
              </h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition cursor-pointer"
              >
                <Icon icon="ph:x-bold" className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 text-gray-700">
              <div className="space-y-4">
                <section>
                  <h3 className="text-lg font-semibold font-poppins text-gray-900 mb-2">
                    {" "}
                    Acceptance of Terms
                  </h3>
                  <p className="text-sm font-poppins leading-relaxed">
                    Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum
                    Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum
                    Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum
                    Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum.
                  </p>
                </section>

                <section>
                  {/* 3. Fixed Checkbox Implementation */}
                  <label className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors">
                    <input
                      type="checkbox"
                      className="mt-1 w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      checked={isChecked}
                      onChange={(e) => setIsChecked(e.target.checked)}
                    />
                    <span className="text-sm font-poppins text-gray-700 select-none">
                      I confirm that the Terms and Conditions have been read and
                      explained to me in a language I understand. I voluntarily
                      assume the risks associated with using this prototype
                      device.
                    </span>
                  </label>
                </section>
              </div>
            </div>

            {/* Footer */}
            <div className="flex gap-3 p-6 border-t border-gray-200">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-900 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
              >
                Cancel
              </button>

              {/* 4. Logic sa Accept button */}
              <button
                disabled={!isChecked} // Disable kung hindi checked
                onClick={() => {
                  if (isChecked) {
                    onAccept && onAccept();
                    onClose();
                  }
                }}
                className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors font-bold cursor-pointer ${
                  isChecked
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-gray-400 cursor-not-allowed opacity-70"
                }`}
              >
                Accept
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TermsAndConditions;
