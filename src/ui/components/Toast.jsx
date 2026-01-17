import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SuccessIcon from "@/assets/images/check.svg";
import ErrorIcon from "@/assets/images/warning.svg";
import InfoIcon from "@/assets/images/information.svg";
import WarningIcon from "@/assets/images/warning.svg";
import ExitIcon from "@/assets/images/exit.svg";

export default function Toast({
  message,
  type = "info",
  duration = 3000,
  position = "bottom-right",
  onClose
}) {
  const [visible, setVisible] = useState(true);
  const exitTimerRef = useRef(null);

  const handleClose = useCallback(() => {
    setVisible(false);

    if (exitTimerRef.current) clearTimeout(exitTimerRef.current);

    exitTimerRef.current = setTimeout(() => {
      if (onClose) onClose();
    }, 500);
  }, [onClose]);

  useEffect(() => {
    const timer = setTimeout(handleClose, duration);
    return () => clearTimeout(timer);
  }, [duration, handleClose]);

  const colors = {
    success: "bg-green-600",
    error: "bg-red-600",
    info: "bg-blue-600",
    warning: "bg-yellow-500 text-black"
  };

  const positionStyles = {
    "top-left": "top-22 left-4 sm:left-4",
    "top-right": "top-22 right-4 sm:right-4",
    "bottom-left": "bottom-20 md:bottom-6 left-4",
    "bottom-right": "bottom-20 md:bottom-6 right-4"
  };

  const icons = {
    success: SuccessIcon,
    error: ErrorIcon,
    info: InfoIcon,
    warning: WarningIcon
  };

  // Determine slide direction
  const slideFrom = position.includes("left") ? { x: -50 } : { x: 50 };
  if (position.includes("top")) slideFrom.y = -50;
  if (position.includes("bottom")) slideFrom.y = 50;

  useEffect(() => {
    if (visible) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [visible]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="toast-root"
          initial={{ opacity: 0, x: position.includes("left") ? -50 : 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: position.includes("left") ? -50 : 50 }}
          transition={{ duration: 0.3 }}
          className={`
            fixed z-50 flex items-center
            w-[calc(100vw-1rem)] sm:w-auto sm:min-w-[280px] sm:max-w-[400px]
            min-h-[56px] sm:min-h-[64px]
            px-3 sm:px-4
            py-3 sm:py-4
            rounded-lg shadow-xl
            text-white
            ${colors[type] || colors.info}
            ${positionStyles[position]}
          `}
          style={{
            // Responsive max width for mobile only
            maxWidth: "calc(100vw - 2rem)",
            wordBreak: "break-word"
          }}
        >
          {/* Icon */}
          <div className="flex-shrink-0 mr-3">
            <img
              loading="lazy"
              src={icons[type]}
              alt={`${type} icon`}
              className="w-5 h-5 sm:w-6 sm:h-6"
            />
          </div>

          {/* Message */}
          <div className="flex-1 min-w-0">
            <p
              className="
              text-sm sm:text-base
              font-normal
              leading-relaxed
              break-words
              overflow-hidden
            "
            >
              {message}
            </p>
          </div>

          {/* Divider - hidden on mobile if message is long */}
          <div
            className={`
            flex-shrink-0
            w-px h-5 sm:h-6
            bg-white/30
            mx-2 sm:mx-3
            ${message.length > 40 ? "hidden sm:block" : ""}
          `}
          />

          {/* Close Button */}
          <button
            onClick={handleClose}
            className="
              flex-shrink-0
              ml-1 sm:ml-2
              p-1
              focus:outline-none
              focus:ring-2 focus:ring-white/50
              rounded
              transition-opacity
              hover:opacity-80
              active:opacity-60
              cursor-pointer
            "
            aria-label="Close toast"
          >
            <img
              loading="lazy"
              src={ExitIcon}
              alt="Close"
              className="w-4 h-4 sm:w-5 sm:h-5"
            />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
