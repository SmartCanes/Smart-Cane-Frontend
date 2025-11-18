import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Usage example:
// <Toast message="Saved successfully!" type="success" duration={3000} />

export default function Toast({ message, type = "info", duration = 3000 }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), duration);
    return () => clearTimeout(timer);
  }, [duration]);

  const colors = {
    success: "bg-green-600",
    error: "bg-red-600",
    info: "bg-blue-600",
    warning: "bg-yellow-600 text-black"
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.25 }}
          className={`fixed bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-xl shadow-lg text-white ${
            colors[type] || colors.info
          }`}
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
