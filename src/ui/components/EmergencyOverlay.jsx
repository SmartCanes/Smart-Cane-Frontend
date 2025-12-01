import { motion, useAnimation } from "framer-motion";
import { useEffect } from "react";

const EmergencyOverlay = ({ emergency }) => {
  const controls = useAnimation();

  useEffect(() => {
    if (emergency) {
      controls.start({
        opacity: [0, 1, 0],
        boxShadow: [
          "inset 0 0 0px rgba(255,0,0,0.8)",
          "inset 0 0 180px rgba(255,0,0,0.8)",
          "inset 0 0 0px rgba(255,0,0,0.8)"
        ],
        // x: [-2, 2, -2],
        // y: [-2, 2, -2],
        transition: {
          repeat: Infinity,
          duration: 0.8,
          ease: "easeInOut"
        }
      });
    } else {
      controls.stop();
      controls.set({
        opacity: 0,
        x: 0,
        y: 0,
        boxShadow: "inset 0 0 0px rgba(255,0,0,0)"
      });
    }
  }, [emergency, controls]);

  return (
    <motion.div
      animate={controls}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: "none",
        boxSizing: "border-box",
        zIndex: 9999,
        borderRadius: 0,
        backgroundColor: "transparent"
      }}
    />
  );
};

export default EmergencyOverlay;
