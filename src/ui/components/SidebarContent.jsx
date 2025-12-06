import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import SmartCaneLogo from "@/assets/images/smartcane-logo.png";
import { useRegisterStore } from "@/stores/useRegisterStore";

const SidebarContent = ({ onAnimationComplete, className = "" }) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);
  const [viewportHeight, setViewportHeight] = useState(window.innerHeight);

  // Phase sequence: 'start' (Blue) -> 'white' (Expansion) -> 'final' (Header/Sidebar Reveal)
  const [animationPhase, setAnimationPhase] = useState("start");

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
      setViewportHeight(window.innerHeight);
    };
    window.addEventListener("resize", handleResize);

    // --- TIMING ADJUSTMENTS ---
    const timer1 = setTimeout(() => {
      setAnimationPhase("white");
    }, 1000);

    const timer2 = setTimeout(() => {
      setAnimationPhase("final");
      if (onAnimationComplete) onAnimationComplete();
    }, 1800);

    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  const containerVariants = {
    desktopStart: {
      width: "100%",
      height: viewportHeight,
      borderTopLeftRadius: 0,
      borderTopRightRadius: 0,
      borderBottomLeftRadius: 0,
      borderBottomRightRadius: 0,
      position: "fixed",
      left: 0,
      top: 0,
      zIndex: 40
    },
    desktopFinal: {
      width: "50%",
      height: viewportHeight,
      borderTopLeftRadius: 0,
      borderTopRightRadius: 0,
      borderBottomLeftRadius: 0,
      borderBottomRightRadius: 0,
      position: "fixed",
      left: 0,
      top: 0,
      zIndex: 0
    },
    mobileStart: {
      width: "100%",
      height: viewportHeight,
      borderTopLeftRadius: 0,
      borderTopRightRadius: 0,
      borderBottomLeftRadius: 0,
      borderBottomRightRadius: 0,
      position: "fixed",
      left: 0,
      top: 0,
      zIndex: 40
    },
    mobileFinal: {
      width: "100%",
      height: 120,
      borderTopLeftRadius: 0,
      borderTopRightRadius: 0,
      borderBottomLeftRadius: 40,
      borderBottomRightRadius: 40,
      position: "relative",
      zIndex: 0
    }
  };

  const { clearRegisterStore, clearDeviceValidated } = useRegisterStore();
  return (
    <>
      {/* --- WHITE OVERLAY TRANSITION --- */}
      <motion.div
        initial={{ clipPath: "circle(0% at 50% 90%)" }}
        animate={
          animationPhase === "start"
            ? { clipPath: "circle(0% at 50% 90%)" }
            : { clipPath: "circle(150% at 50% 90%)" }
        }
        transition={{ duration: 0.8, ease: "easeInOut" }}
        className={`fixed inset-0 ${isMobile ? "bg-primary-100" : "bg-[#FDFCFA]"} z-50 pointer-events-none`}
        style={{ display: animationPhase === "final" ? "none" : "block" }}
      />

      {/* --- MAIN BLUE CONTENT --- */}
      <motion.div
        initial={isMobile ? "mobileStart" : "desktopStart"}
        animate={
          animationPhase === "final"
            ? isMobile
              ? "mobileFinal"
              : "desktopFinal"
            : isMobile
              ? "mobileStart"
              : "desktopStart"
        }
        variants={containerVariants}
        transition={{ duration: 0.8, ease: "circOut" }}
        className={`bg-primary-100 flex flex-col items-center justify-center relative overflow-hidden sm:min-h-screen z-40 ${className}`}
      >
        {/* Background Pattern */}
        <motion.img
          src={SmartCaneLogo}
          alt="Background Pattern"
          animate={
            isMobile && animationPhase === "final"
              ? { opacity: 0 }
              : { opacity: 0.05 }
          }
          className="absolute pointer-events-none select-none w-[150%] sm:w-auto"
        />

        {/* Content Container */}
        <motion.div
          animate={{ y: 0, scale: 1 }}
          className="z-10 flex flex-col items-center gap-y-4 sm:gap-y-12 px-4 text-center absolute top-1/2 -translate-y-1/2 w-full"
        >
          <Link to="/">
            {/* Logo */}
            <motion.img
              src={SmartCaneLogo}
              alt="Smart Cane Logo"
              animate={
                isMobile && animationPhase === "final"
                  ? { opacity: 0, height: 0, marginBottom: 0 }
                  : { opacity: 1, width: "220px", height: "auto" }
              }
              className="w-[120px] sm:w-[220px] md:w-[290px] mx-auto"
            />
          </Link>

          {/* Text: iCane */}
          <motion.h1
            animate={
              isMobile && animationPhase === "final"
                ? { fontSize: "2.5rem" }
                : {}
            }
            style={{
              lineHeight:
                isMobile && animationPhase === "final" ? "1" : "inherit"
            }}
            className="font-gabriela text-6xl sm:text-h1 text-[#FDFCFA]"
          >
            icane
          </motion.h1>

          {/* Description */}
          <motion.p
            animate={
              isMobile && animationPhase === "final"
                ? { opacity: 0, height: 0 }
                : { opacity: 1, height: "auto" }
            }
            className="font-poppins text-paragraph text-[#FDFCFA] text-center max-w-md hidden sm:block"
          >
            Bringing independence closer through a cane that’s more than just
            support — it’s smart.
          </motion.p>
        </motion.div>
      </motion.div>
    </>
  );
};

export default SidebarContent;
