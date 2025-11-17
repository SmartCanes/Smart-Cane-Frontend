import { useState, useEffect, useRef } from "react";

const SelectField = ({
  label,
  placeholder = "",
  value,
  onChange,
  name,
  id,
  required = false,
  disabled = false,
  error = "",
  helperText = "",
  className = "",
  inputClassName = "", //
  labelClassName = "",
  options = [],
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef(null);
  const validationColor = "var(--color-validation-100, #CE4B34)";
  const hasError = Boolean(error);
  const labelColor = hasError
    ? validationColor
    : "var(--color-secondary-100, #1C253C)";

  // Hanapin 'yung label ng napiling option
  const selectedOption = options.find((option) => option.value === value);
  const displayLabel = selectedOption ? selectedOption.label : placeholder;

  // Function para i-toggle 'yung dropdown
  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  // Function para pumili ng option
  const handleSelectOption = (option) => {
    // Gumawa ng mock event object para maging compatible
    // sa form handlers (tulad ng handleFormChange sa Register.js)
    const mockEvent = {
      target: {
        name: name, // Ipasa 'yung pangalan ng field
        value: option.value // Ipasa 'yung napiling value
      }
    };

    onChange(mockEvent);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [selectRef]);

  return (
    <div className={`w-full ${className}`} ref={selectRef}>
      {/* 1. Label (mula sa luma mong component) */}
      {label && (
        <label
          htmlFor={id || name}
          className={`block text-[18px] font-medium mb-2 ${labelClassName}`}
          style={{ color: labelColor }}
        >
          {label}
          {required && (
            <span className="ml-1" style={{ color: validationColor }}>*</span>
          )}
        </label>
      )}

      {/* 2. Custom Dropdown Wrapper */}
      <div className="relative w-full font-poppins">
        {/* Ito 'yung "trigger" button na mukhang input field */}
        <button
          type="button"
          id={id || name}
          name={name}
          disabled={disabled}
          onClick={handleToggle}
          className={`
            w-full text-left px-5 py-4 
            border rounded-[15px]
            flex items-center justify-between
            focus:outline-none focus:ring-2
            transition-all duration-200
            ${
              disabled
                ? "bg-gray-100 cursor-not-allowed"
                : "bg-white cursor-pointer"
            }
            ${hasError ? "" : "border-gray-300 focus:ring-secondary-100"}
            ${inputClassName} 
          `}
          style={
            hasError
              ? { borderColor: validationColor, "--tw-ring-color": validationColor }
              : undefined
          }
          {...props}
        >
          {/* Ito 'yung text (placeholder or selected value) */}
          <span className={value ? "text-secondary-100" : "text-gray-400"}>
            {displayLabel}
          </span>

          {/* Ito 'yung arrow icon (SVG) */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className={`w-5 h-5 text-gray-500 transition-transform duration-200
                        ${isOpen ? "transform rotate-180" : ""}`}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 8.25l-7.5 7.5-7.5-7.5"
            />
          </svg>
        </button>

        {/* 3. Ito 'yung floating options panel */}
        {isOpen && (
          <div
            className="absolute top-full left-0 right-0 mt-2 w-full bg-white rounded-lg shadow-lg z-10 
                       border border-gray-200 overflow-hidden"
          >
            {/* Listahan ng options */}
            <ul className="max-h-60">
              {options.map((option) => (
                <li
                  key={option.value}
                  className="px-5 py-3 cursor-pointer hover:bg-primary-100 hover:text-white text-secondary-100 
                             border-b border-gray-200 last:border-b-0 transition-colors duration-200" // Ito 'yung horizontal line
                  onClick={() => handleSelectOption(option)}
                >
                  {option.label}
                </li>
              ))}
              {/* Kung walang options */}
              {options.length === 0 && (
                <li className="px-5 py-3 text-gray-500">No options found</li>
              )}
            </ul>
          </div>
        )}
      </div>

      {/* 4. Error at Helper Text (mula sa luma mong component) */}
      {error && (
        <p className="text-sm mt-1" style={{ color: validationColor }}>
          {error}
        </p>
      )}

      {helperText && !error && (
        <p className="text-gray-500 text-sm mt-1">{helperText}</p>
      )}
    </div>
  );
};

export default SelectField;
