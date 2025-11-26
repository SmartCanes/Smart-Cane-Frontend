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
    "top-left": { top: "1rem", left: "1rem" },
    "top-right": { top: "1rem", right: "1rem" },
    "bottom-left": { bottom: "1rem", left: "1rem" },
    "bottom-right": { bottom: "1rem", right: "1rem" }
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

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, x: position.includes("left") ? -50 : 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: position.includes("left") ? -50 : 50 }}
          transition={{ duration: 0.3 }}
          style={{
            position: "fixed",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            minWidth: 250,
            maxWidth: 400,
            ...positionStyles[position]
          }}
          className={`px-4 py-4 rounded-sm shadow-lg text-white ${colors[type] || colors.info}`}
        >
          <img
            src={icons[type]}
            alt={`${type} icon`}
            className="w-6 h-6 mr-3"
          />

          <span className="flex-1">{message}</span>

          <div className="w-px h-6 bg-white ml-5 mr-2 opacity-30"></div>

          <button
            onClick={handleClose}
            className="ml-3 font-bold text-lg focus:outline-none cursor-pointer"
          >
            <img src={ExitIcon} alt="Close icon" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
