import { useState } from "react";
import { Icon } from "@iconify/react";

const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-300 py-4 max-w-7xl">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center cursor-pointer"
      >
        <span className="font-semibold text-card-100">{question}</span>
        <Icon
          icon={isOpen ? "akar-icons:chevron-up" : "akar-icons:chevron-down"}
          className="text-xl"
        />
      </button>
      {isOpen && (
        <p className="mt-2 text-[12px] text-gray-600 text-left">{answer}</p>
      )}
    </div>
  );
};

export default FAQItem;
