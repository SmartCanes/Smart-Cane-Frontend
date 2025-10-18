import React from 'react'

const PrimaryButton = ({ 
  text = 'Sign in', 
  bgColor = 'bg-primary',
  hoverColor = 'hover:bg-[#1C253C]/90',
  textColor = 'text-white',
  onClick,
  type = 'button',
  className = '',
  disabled = false,
  ...props 
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        ${bgColor} 
        ${hoverColor} 
        ${textColor}
        px-6 py-2 font-medium font-poppins
        transition-colors duration-200
        rounded-[15px]
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
      {...props}
    >
      {text}
    </button>
  );
};

export default PrimaryButton