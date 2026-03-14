import { motion, useAnimation } from "framer-motion";
import { useEffect } from "react";

const FallOverlay = ({ fall }) => {
  const controls = useAnimation();

  useEffect(() => {
    if (fall) {
      controls.start({
        opacity: [0, 1, 0.2, 1, 0],
        boxShadow: [
          "inset 0 0 0px rgba(255,165,0,0.75)",
          "inset 0 0 140px rgba(255,165,0,0.75)",
          "inset 0 0 60px rgba(255,140,0,0.65)",
          "inset 0 0 140px rgba(255,165,0,0.75)",
          "inset 0 0 0px rgba(255,165,0,0)"
        ],
        transition: {
          repeat: Infinity,
          duration: 1,
          ease: "easeInOut"
        }
      });
    } else {
      controls.stop();
      controls.set({
        opacity: 0,
        boxShadow: "inset 0 0 0px rgba(255,165,0,0)"
      });
    }
  }, [fall, controls]);

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
        zIndex: 9998,
        borderRadius: 0,
        backgroundColor: "transparent"
      }}
    />
  );
};

export default FallOverlay;
