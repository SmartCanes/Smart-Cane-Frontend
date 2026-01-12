import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@iconify/react";

const VARIANTS = {
  default: "bg-[#1C253C]", // Dark blue (Brand)
  primary: "bg-primary-100",
  success: "bg-green-500",
  error: "bg-red-500",
  warning: "bg-yellow-500",
  info: "bg-blue-500"
};

const FeedbackModal = ({
  isOpen,
  onClose,
  title = "Sent!",
  message = "Your message has been sent successfully.",
  variant = "default",
  duration = 3000
}) => {
  const headerColor = VARIANTS[variant] || VARIANTS.default;

  useEffect(() => {
    if (isOpen && duration) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isOpen, duration, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-[60] backdrop-blur-sm"
          />

          {/* Modal Container */}
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 pointer-events-none font-poppins">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-[400px] bg-white rounded-[32px] shadow-xl overflow-hidden pointer-events-auto relative flex flex-col"
            >
              {/* Header */}
              <div
                className={`${headerColor} h-24 w-full relative flex justify-end p-6 shrink-0`}
              >
                <button
                  onClick={onClose}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-white text-[#1C253C] hover:bg-gray-100 transition-colors shadow-sm"
                >
                  <Icon icon="ph:x-bold" className="text-lg" />
                </button>
              </div>

              {/* Body */}
              <div className="px-8 pb-12 pt-2 text-center flex flex-col items-center justify-center h-full">
                <h2 className="text-[40px] font-bold text-[#1C253C] mb-4 leading-tight">
                  {title}
                </h2>
                <p className="text-[#1C253C] text-lg leading-relaxed px-2 font-medium">
                  {message}
                </p>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default FeedbackModal;
