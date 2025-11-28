import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@iconify/react";

const MODAL_TYPES = {
  warning: {
    icon: "ph:warning-circle-fill",
    bg: "bg-yellow-500",
    buttonColor: "bg-yellow-600",
    hover: "hover:bg-yellow-700"
  },
  error: {
    icon: "radix-icons:cross-2",
    bg: "bg-red-500",
    buttonColor: "bg-red-600",
    hover: "hover:bg-red-700"
  },
  info: {
    icon: "ph:info-fill",
    bg: "bg-blue-500",
    buttonColor: "bg-blue-600",
    hover: "hover:bg-blue-700"
  },
  success: {
    icon: "ph:check-circle-fill",
    bg: "bg-green-500",
    buttonColor: "bg-green-600",
    hover: "hover:bg-green-700"
  }
};

export default function Modal({
  isOpen,
  onClose,
  title,
  message,
  modalType = "info",
  handleConfirm,
  handleCancel,
  children, // custom content
  footer // optional custom footer
}) {
  useEffect(() => {
    const handleEscape = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  if (!isOpen) return null;

  const type = MODAL_TYPES[modalType];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Modal card */}
          <motion.div
            className="relative bg-white p-6 rounded-2xl shadow-xl w-full max-w-md font-poppins"
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.2 }}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition cursor-pointer"
            >
              <Icon icon="ph:x-bold" className="w-6 h-6" />
            </button>

            {/* Header */}
            <div className="flex items-start gap-3 mb-4">
              <Icon
                icon={type.icon}
                className={`w-10 h-10 ${type.bg} p-1 rounded-full text-white`}
              />
              <div>
                <p className="text-lg font-medium text-gray-900">{title}</p>
                {!children && message && (
                  <p className="text-sm text-gray-700 mt-1">{message}</p>
                )}
              </div>
            </div>

            {/* Content (custom children) */}
            {children && <div className="mb-4">{children}</div>}

            {/* Footer buttons */}
            {footer ? (
              <div className="flex gap-3 mt-4">{footer}</div>
            ) : handleConfirm || handleCancel ? (
              <div className="flex gap-3 mt-4">
                <button
                  onClick={handleCancel || onClose}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-900 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  onClick={handleConfirm}
                  className={`flex-1 px-4 py-2 ${type.buttonColor} ${type.hover} text-white rounded-lg transition-colors font-bold cursor-pointer`}
                >
                  Yes
                </button>
              </div>
            ) : null}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
