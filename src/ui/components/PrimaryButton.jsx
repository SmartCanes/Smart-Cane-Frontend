const VARIANTS = {
  primary: {
    bg: "bg-primary-100",
    hover: "hover:bg-primary-100/90",
    text: "text-white"
  },
  secondary: {
    bg: "bg-gray-300",
    hover: "hover:bg-gray-400",
    text: "text-secondary-100"
  },
  success: {
    bg: "bg-green-600",
    hover: "hover:bg-green-700",
    text: "text-white"
  },
  danger: {
    bg: "bg-red-600",
    hover: "hover:bg-red-700",
    text: "text-white"
  },
  cancel: {
    bg: "bg-gray-200",
    hover: "hover:bg-gray-300",
    text: "text-secondary-100"
  },
  outline: {
    bg: "bg-transparent border border-primary-100",
    hover: "hover:bg-primary-100/10",
    text: "text-primary-100"
  }
};

const PrimaryButton = ({
  text = "Button",
  variant = "primary",
  onClick,
  type = "button",
  className = "",
  disabled = false,
  ...props
}) => {
  const style = VARIANTS[variant] || VARIANTS.primary;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        ${style.bg}
        ${style.hover}
        ${style.text}
        px-6 py-2 rounded-[15px]
        font-medium font-poppins
        transition-colors duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
      {...props}
    >
      {text}
    </button>
  );
};

export default PrimaryButton;
