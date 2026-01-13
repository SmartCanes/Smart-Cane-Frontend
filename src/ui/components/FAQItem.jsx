import { useState } from "react";
import chevronIcon from "@/assets/images/chevron.svg";
import { motion, AnimatePresence } from "framer-motion";

const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-300 py-4 max-w-7xl">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center cursor-pointer"
      >
        <span className="font-semibold text-card-100">{question}</span>
        <motion.div
          animate={{ rotate: isOpen ? 0 : 180 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
        >
          <img
            loading="lazy"
            src={chevronIcon}
            alt="Chevron Icon"
            className="w-5 h-5"
          />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div
              className="
    mt-2 text-[12px] text-gray-600 text-left 
    [&_li]:mb-2 
    [&_ul]:list-disc [&_ul]:pl-5
    max-w-5xl
  "
              dangerouslySetInnerHTML={{ __html: answer }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FAQItem;
