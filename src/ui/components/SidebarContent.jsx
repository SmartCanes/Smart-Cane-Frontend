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
      height: 0,
      position: "fixed",
      left: 0,
      top: -140,
      zIndex: 40
    },
    mobileFinal: {
      width: "100%",
      height: 140,
      position: "relative",
      borderBottomLeftRadius: 60,
      borderBottomRightRadius: 60,
      top: 0,
      zIndex: 0
    }
  };

  const { clearRegisterStore, clearDeviceValidated } = useRegisterStore();

  return (
    <>
      {/* --- CIRCLE OVERLAY TRANSITION --- */}
      {animationPhase === "white" && (
        <motion.div
          initial={{ clipPath: "circle(0px at 50% 50%)" }}
          animate={{
            clipPath: `circle(${Math.hypot(window.innerWidth, window.innerHeight)}px at 50% 50%)`
          }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="fixed inset-0 bg-white z-50"
          onAnimationComplete={() => setAnimationPhase("final")}
        />
      )}

      <motion.div
        animate={animationPhase === "final" ? "mobileFinal" : "mobileStart"}
        variants={containerVariants}
        className="bg-primary-100 flex flex-col items-center justify-center relative overflow-hidden"
      >
        <motion.h1
          initial={{ fontSize: "2.5rem" }}
          animate={
            isMobile && animationPhase === "final"
              ? { fontSize: "3.5rem" }
              : { fontSize: "2.5rem" }
          }
          transition={{ duration: 0.4, ease: "easeOut" }}
          style={{
            lineHeight: isMobile && animationPhase === "final" ? "1" : "inherit"
          }}
          className="font-gabriela text-6xl sm:text-h1 text-[#FDFCFA]"
        >
          iCane
        </motion.h1>
      </motion.div>

      {(!isMobile || animationPhase !== "final") && (
        <motion.div
          initial={"desktopStart"}
          animate={animationPhase === "final" ? "desktopFinal" : "desktopStart"}
          variants={containerVariants}
          transition={{ duration: 0.8, ease: "circOut" }}
          className={`bg-primary-100 flex flex-col items-center justify-center relative overflow-hidden sm:min-h-screen z-40 ${className}`}
        >
          {/* Background Pattern */}
          {!isMobile && (
            <motion.img
              src={SmartCaneLogo}
              alt="Background Pattern"
              animate={
                isMobile && animationPhase !== "start"
                  ? { opacity: 0 }
                  : { opacity: 0.05 }
              }
              className="absolute pointer-events-none select-none w-[150%] sm:w-auto"
            />
          )}

          {/* Content Container */}
          <motion.div
            animate={{ y: 0, scale: 1 }}
            className="z-10 flex flex-col items-center gap-y-4 sm:gap-y-12 px-4 text-center absolute top-1/2 -translate-y-1/2 w-full"
          >
            {isMobile && (
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
            )}

            {/* Text: iCane */}
            <motion.h1
              animate={
                isMobile && animationPhase === "final"
                  ? { fontSize: "4.5rem" }
                  : {}
              }
              style={{
                lineHeight:
                  isMobile && animationPhase === "final" ? "1" : "inherit"
              }}
              className="font-gabriela text-6xl sm:text-h1 text-[#FDFCFA]"
            >
              iCane
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
      )}
    </>
  );
};

export default SidebarContent;
