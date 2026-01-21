import { capitalizeWords } from "@/utils/Capitalize";
import { Icon } from "@iconify/react";

const roleStyles = {
  primary: {
    bg: "bg-blue-100",
    text: "text-blue-800",
    ring: "ring-blue-200",
    icon: "ph:crown-simple-bold"
  },
  secondary: {
    bg: "bg-purple-100",
    text: "text-purple-800",
    ring: "ring-purple-200",
    icon: "ph:shield-chevron-bold"
  },
  guardian: {
    bg: "bg-gray-100",
    text: "text-gray-700",
    ring: "ring-gray-200",
    icon: "ph:user-bold"
  }
};

const RoleBadge = ({ role = "guardian", size = "sm", fixed = false }) => {
  const style = roleStyles[role] || roleStyles.guardian;

  return (
    <span
      className={`
        inline-flex items-center justify-center gap-1.5
        rounded-full font-semibold
        ring-1 ${style.bg} ${style.text} ${style.ring}
        ${size === "sm" ? "px-2.5 py-1 text-xs" : "px-3 py-1.5 text-sm"}
        ${fixed ? "min-w-[96px]" : ""}
      `}
    >
      <Icon icon={style.icon} className="w-3.5 h-3.5" />
      {capitalizeWords(role)}
    </span>
  );
};

export default RoleBadge;
