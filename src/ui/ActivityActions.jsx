import { Icon } from "@iconify/react";

const variants = {
  login: {
    label: "Login",
    icon: "mdi:login",
    style: "bg-[#D4F8D3] text-[#1F7A37]",
  },
  settings: {
    label: "Settings",
    icon: "ph:gear-fill",
    style: "bg-[#D8E6FD] text-[#1B3B8C]",
  },
  device: {
    label: "Device",
    icon: "ph:link-bold",
    style: "bg-[#D4F8D3] text-[#1F7A37]",
  },
  alert: {
    label: "Alert",
    icon: "ph:warning-fill",
    style: "bg-[#FFE4E4] text-[#D92D20]",
  },
};

const ActivityActions = ({ type = "login", label, onClick }) => {
  const variant = variants[type.toLowerCase()] || variants.login;
  const displayLabel = label || variant.label;

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center gap-2 px-5 py-2 rounded-full font-poppins font-bold text-lg transition-opacity ${
        onClick ? "cursor-pointer hover:opacity-80" : ""
      } ${variant.style}`}
    >
      <Icon icon={variant.icon} className="text-2xl" />
      <span>{displayLabel}</span>
    </div>
  );
};

export default ActivityActions;