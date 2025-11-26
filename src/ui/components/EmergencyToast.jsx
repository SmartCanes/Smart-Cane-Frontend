import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function EmergencyToast({
  message = "Juan Dela Cruz seems like in danger.", // Default message from image
  duration = 5000,
  onClose
}) {
  const [visible, setVisible] = useState(true);

  // The design doesn't show a close button, but we keep the logic
  // for the timer and for a potential manual close if `onClose` is provided.
  const handleClose = useCallback(() => {
    setVisible(false);
    if (onClose) onClose();
  }, [onClose]);

  //   useEffect(() => {
  //     const timer = setTimeout(handleClose, duration);
  //     return () => clearTimeout(timer);
  //   }, [duration, handleClose]);

  // Framer Motion variant for the main container
  const containerVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, scale: 0.9, transition: { duration: 0.3 } }
  };

  // Framer Motion variant for the pulsing icon
  const iconVariants = {
    pulse: {
      scale: [1, 1.05, 1], // Gentle scale pulse
      boxShadow: [
        "0 0 0px rgba(255, 255, 255, 0.4)",
        "0 0 10px rgba(255, 255, 255, 0.8)",
        "0 0 0px rgba(255, 255, 255, 0.4)"
      ]
    }
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          style={{
            width: "90%",
            maxWidth: "500px",
            borderRadius: "10px",
            overflow: "hidden",
            boxShadow: "0 10px 25px rgba(0, 0, 0, 0.3)"
          }}
        >
          {/* 3. Red Header Section */}
          <div
            style={{
              backgroundColor: "#f44336",
              color: "white",
              padding: "20px 20px 30px 20px",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              position: "relative"
            }}
          >
            {/* Emergency Alert Title */}
            <h2
              style={{
                fontSize: "1.8rem",
                fontWeight: "900",
                marginTop: "10px",
                marginBottom: "5px"
              }}
            >
              Emergency Alert
            </h2>
            {/* SOS Signal Text */}
            <p
              style={{
                fontSize: "1rem",
                fontWeight: "500",
                opacity: 0.8
              }}
            >
              SOS signal activated
            </p>

            {/* Icon Container (Overlaps the red/white sections) */}
            <motion.div
              variants={iconVariants}
              animate="pulse"
              transition={{ repeat: Infinity, duration: 1.5 }}
              style={{
                position: "absolute",
                top: "-50px", // Position it outside the red section to overlap
                width: "100px",
                height: "100px",
                borderRadius: "50%",
                backgroundColor: "white",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                // Center horizontally
                left: "50%",
                transform: "translateX(-50%)"
              }}
            >
              {/* The Exclamation Mark / Danger Icon */}
              <div
                style={{
                  width: "60px",
                  height: "60px",
                  borderRadius: "50%",
                  backgroundColor: "#f44336", // Red interior circle
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  fontSize: "2rem",
                  color: "white",
                  fontWeight: "900"
                }}
              >
                !
              </div>
              {/* // Alternative: Use the imported SVG
                <motion.img
                    src={EmergencyIcon}
                    alt="Emergency Icon"
                    style={{ width: "60px", height: "60px" }}
                    animate="pulse"
                    transition={{ repeat: Infinity, duration: 1.5 }}
                /> 
                */}
            </motion.div>
          </div>

          {/* 4. White Body Section (The Message) */}
          <div
            style={{
              backgroundColor: "white",
              color: "#333", // Dark text color
              padding: "40px 20px 30px 20px", // Extra padding at the top for the icon space
              textAlign: "center",
              minHeight: "100px",
              borderBottomLeftRadius: "10px",
              borderBottomRightRadius: "10px"
            }}
          >
            <p
              style={{
                fontSize: "1.2rem",
                fontWeight: "600"
              }}
            >
              {message}
            </p>
          </div>

          {/* Optional: Add a subtle 'Close' button for dismissibility if needed */}
          {/* <button onClick={handleClose} style={...}>Close</button> */}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
