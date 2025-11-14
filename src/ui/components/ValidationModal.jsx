import { motion, AnimatePresence } from "framer-motion";
import PrimaryButton from "./PrimaryButton";
import { useEffect, useState } from "react";

const ValidationModal = ({
  type,
  email,
  onClose,
  onAction,
  position = "center",
  isVisible = true
}) => {
  const [isModalVisible, setIsModalVisible] = useState(isVisible || onClose);
  useEffect(() => {
    if (!isModalVisible) return;

    const scrollY = window.scrollY;
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";

    return () => {
      document.body.style.position = "";
      document.body.style.top = "";
      window.scrollTo(0, scrollY);
    };
  }, [isModalVisible]);

  const getContent = () => {
    switch (type) {
      case "verification-code":
        return {
          title: "Forgot Password",
          description: (
            <>
              We've sent a <span className="font-bold">verification code</span>{" "}
              to your email:
              <br />
              {email || "afri******@gmail.com"}
              <br />
              <br />
              Please check your <span className="font-bold">Inbox</span> or{" "}
              <span className="font-bold">Spam</span> Folder.
            </>
          ),
          showButton: false
        };
      case "account-created":
        return {
          title: "Account Created!",
          description: (
            <>
              Success! your ICane account is ready. Click below to sign in and
              start exploring.
            </>
          ),
          buttonText: "Go to Login",
          showButton: true
        };
      case "login-success":
        return {
          title: "Welcome!",
          description: (
            <>You have successfully logged into your ICane account.</>
          ),
          showButton: false
        };
      case "phone-verification":
        return {
          title: "Phone Verification",
          description: (
            <>
              We've sent a <span className="font-bold">verification code</span>{" "}
              to your phone number:
              <br />
              +63 9** *** ****
              <br />
              <br />
              Please check your <span className="font-bold">Messages</span>.
            </>
          ),
          showButton: false
        };
      default:
        return {
          title: "Notification",
          description: "Action completed successfully.",
          showButton: false
        };
    }
  };

  const content = getContent();

  const isCornerPosition =
    position === "top-right" ||
    position === "top-left" ||
    position === "top-center";

  const positionClasses = {
    center: "fixed inset-0 flex items-center justify-center",
    "top-right": "fixed top-4 right-4",
    "top-left": "fixed top-4 left-4",
    "top-center": "fixed top-4 left-1/2 transform -translate-x-1/2"
  };

  const shouldDimBackground = position === "center";

  const modalSizeClasses = isCornerPosition
    ? "max-w-sm w-80"
    : "w-full max-w-2xl mx-10 sm:mx-7";

  const contentPadding = isCornerPosition
    ? "px-4 py-4 sm:px-8 sm:py-6"
    : "px-4 py-6 sm:px-12 sm:py-10";
  const headerHeight = isCornerPosition ? "h-16 sm:h-20" : "h-24 sm:h-32";

  const titleSize = isCornerPosition
    ? "text-lg sm:text-3xl"
    : "text-2xl sm:text-5xl";
  const descriptionSize = isCornerPosition
    ? "text-xs sm:text-sm"
    : "text-sm sm:text-lg";

  return (
    <AnimatePresence>
      {isModalVisible && (
        <>
          {shouldDimBackground && (
            <motion.div
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9999]"
              onClick={() => setIsModalVisible(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            />
          )}

          {/* Modal */}
          <motion.div
            className={`${positionClasses[position] || positionClasses.center} z-[9999] pointer-events-none`}
            initial={{
              opacity: 0,
              scale: position === "center" ? 0.9 : 1,
              x:
                position === "top-right"
                  ? 50
                  : position === "top-left"
                    ? -50
                    : 0,
              y:
                position === "center" ? 20 : position === "top-center" ? -50 : 0
            }}
            animate={{
              opacity: 1,
              scale: position === "center" ? 1 : 1,
              x: 0,
              y: 0
            }}
            exit={{
              opacity: 0,
              scale: position === "center" ? 0.9 : 1,
              x:
                position === "top-right"
                  ? 50
                  : position === "top-left"
                    ? -50
                    : 0,
              y:
                position === "center" ? 20 : position === "top-center" ? -50 : 0
            }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 25
            }}
          >
            <div
              className={`bg-white rounded-3xl shadow-2xl ${modalSizeClasses} pointer-events-auto`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div
                className={`bg-[#1C253C] ${headerHeight} rounded-t-3xl`}
              ></div>

              {/* Content */}
              <div className={`${contentPadding} text-center`}>
                <h1
                  className={`font-poppins ${titleSize} font-bold text-[#1C253C] mb-4`}
                >
                  {content.title}
                </h1>

                <p
                  className={`font-poppins text-[#1C253C] ${descriptionSize} leading-relaxed ${content.showButton ? "mb-8" : ""}`}
                >
                  {content.description}
                </p>

                {content.showButton && (
                  <PrimaryButton
                    className="font-poppins w-full max-w-md mx-auto py-4 text-[18px] font-medium"
                    bgColor="bg-primary-100"
                    text={content.buttonText}
                    onClick={onAction}
                  />
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ValidationModal;
