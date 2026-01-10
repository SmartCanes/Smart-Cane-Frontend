import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@iconify/react";
import PrimaryButton from "./PrimaryButton";

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

const MODAL_VARIANTS = {
  banner: {
    positions: ["center", "top-right", "top-left", "top-center"],
    size: "large",
    showCloseButton: false,
    hasHeaderImage: true,
    headerColor: "#1C253C",
    rounded: "3xl"
  },
  dialog: {
    positions: ["center"],
    size: "medium",
    showCloseButton: true,
    hasHeaderImage: false,
    rounded: "2xl"
  },
  form: {
    positions: ["center"],
    size: "medium",
    showCloseButton: true,
    hasHeader: false,
    rounded: "2xl",
    hasInputs: true
  }
};

export default function Modal({
  isOpen,
  onClose,
  title,
  message,
  modalType = "info",
  variant = "dialog",
  closeTimer = 5000,
  icon,

  actionText,
  onAction,

  handleConfirm,
  handleCancel,
  children,
  footer
}) {
  useEffect(() => {
    const handleEscape = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  useEffect(() => {
    if (!closeTimer) return;
    if (closeTimer && isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, closeTimer);

      return () => clearTimeout(timer);
    }
  }, [closeTimer, isOpen, onClose]);

  const type = MODAL_TYPES[modalType];

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto ">
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 flex justify-center items-center"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {variant === "dialog" && (
              <motion.div
                className="relative bg-white p-6 rounded-2xl shadow-xl w-full max-w-md font-poppins"
                onClick={(e) => e.stopPropagation()}
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ duration: 0.2 }}
              >
                {MODAL_VARIANTS[variant].showCloseButton && (
                  <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition cursor-pointer"
                  >
                    <Icon icon="ph:x-bold" className="w-6 h-6" />
                  </button>
                )}

                <div className="flex items-start gap-3 mb-4">
                  <Icon
                    icon={icon || type.icon}
                    className={`w-10 h-10 ${type.bg} p-1 rounded-full text-white`}
                  />
                  <div>
                    <p className="text-lg font-medium text-gray-900">{title}</p>
                    {!children && message && (
                      <p className="text-sm text-gray-700 mt-1">{message}</p>
                    )}
                  </div>
                </div>

                {children && <div className="mb-4">{children}</div>}

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
            )}

            {variant === "banner" && (
              <motion.div
                className="bg-white rounded-2xl shadow-xl w-full max-w-md min-h-fit flex flex-col"
                onClick={(e) => e.stopPropagation()}
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ duration: 0.2 }}
              >
                <div className="bg-[#1C253C] rounded-t-2xl h-18"></div>
                <div className="flex flex-col flex-1 gap-6 p-10 text-center rounded-b-2xl">
                  <h1 className="font-bold text-[#1C253C] text-3xl sm:text-4xl">
                    {title}
                  </h1>
                  <div className="text-[#1C253C] leading-relaxed">
                    {children || message}
                  </div>
                  {actionText && (
                    <PrimaryButton
                      className="w-full max-w-md text-[15px] sm:text-[18px] font-medium mt-auto"
                      bgColor="bg-primary-100"
                      text={actionText}
                      onClick={onAction}
                    />
                  )}
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
