import { useState, useEffect, useRef } from "react";

const SelectField = ({
  label,
  placeholder = "",
  value,
  onChange,
  onCustomInputChange, // New prop for handling custom input
  name,
  id,
  required = false,
  disabled = false,
  error = "",
  helperText = "",
  className = "",
  inputClassName = "",
  labelClassName = "",
  options = [],
  hasCustomOption = false,
  customOptionValue = "",
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customInputValue, setCustomInputValue] = useState("");
  const selectRef = useRef(null);
  const customInputRef = useRef(null);
  const validationColor = "var(--color-validation-100, #CE4B34)";
  const hasError = Boolean(error);
  const labelColor = hasError
    ? validationColor
    : "var(--color-secondary-100, #1C253C)";

  // Check if current value is from custom input (not in options)
  const isCustomValue =
    value && !options.some((option) => option.value === value);

  // Get display label
  const selectedOption = options.find((option) => option.value === value);
  const displayLabel = isCustomValue
    ? `Others: ${value}`
    : selectedOption
      ? selectedOption.label
      : placeholder;

  // Handle dropdown toggle
  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  // Handle option selection
  const handleSelectOption = (option) => {
    if (option.value === "others" && hasCustomOption) {
      // Show custom input when "Others" is selected
      setShowCustomInput(true);
      setIsOpen(false);

      // Focus the custom input after a short delay
      setTimeout(() => {
        if (customInputRef.current) {
          customInputRef.current.focus();
        }
      }, 100);
    } else {
      // Regular selection
      const mockEvent = {
        target: {
          name: name,
          value: option.value
        }
      };
      onChange(mockEvent);
      setShowCustomInput(false);
      setIsOpen(false);
    }
  };

  // Handle custom input change
  const handleCustomInputChange = (e) => {
    const newValue = e.target.value;
    setCustomInputValue(newValue);

    if (onCustomInputChange) {
      const mockEvent = {
        target: {
          name: name,
          value: newValue
        }
      };
      onCustomInputChange(mockEvent);
    }
  };

  // Handle custom input blur (save when user clicks away)
  const handleCustomInputBlur = () => {
    if (customInputValue.trim() && onCustomInputChange) {
      const mockEvent = {
        target: {
          name: name,
          value: customInputValue.trim()
        }
      };
      onCustomInputChange(mockEvent);
    }
  };

  // Handle Enter key in custom input
  const handleCustomInputKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (customInputValue.trim() && onCustomInputChange) {
        const mockEvent = {
          target: {
            name: name,
            value: customInputValue.trim()
          }
        };
        onCustomInputChange(mockEvent);
        setShowCustomInput(false);
      }
    } else if (e.key === "Escape") {
      setShowCustomInput(false);
      if (!customInputValue.trim()) {
        // If custom input is empty, reset to empty value
        const mockEvent = {
          target: {
            name: name,
            value: ""
          }
        };
        onChange(mockEvent);
      }
    }
  };

  // Initialize custom input value
  useEffect(() => {
    if (isCustomValue && value) {
      setCustomInputValue(value);
      setShowCustomInput(true);
    }
  }, [value, isCustomValue]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
        if (showCustomInput && !customInputValue.trim()) {
          setShowCustomInput(false);
          // Reset to empty if custom input is empty
          const mockEvent = {
            target: {
              name: name,
              value: ""
            }
          };
          onChange(mockEvent);
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [selectRef, showCustomInput, customInputValue, name, onChange]);

  return (
    <div className={`w-full ${className}`} ref={selectRef}>
      {/* Label */}
      {label && (
        <label
          htmlFor={id || name}
          className={`block text-[18px] font-medium mb-2 ${labelClassName}`}
          style={{ color: labelColor }}
        >
          {label}
          {required && (
            <span className="ml-1" style={{ color: validationColor }}>
              *
            </span>
          )}
        </label>
      )}

      {/* Custom Dropdown Wrapper */}
      <div className="relative w-full font-poppins">
        {/* If showing custom input, display input field instead of dropdown button */}
        {showCustomInput ? (
          <div className="relative">
            <input
              name={name}
              ref={customInputRef}
              type="text"
              value={customInputValue}
              onChange={handleCustomInputChange}
              onBlur={handleCustomInputBlur}
              onKeyDown={handleCustomInputKeyDown}
              className={`
                w-full px-5 py-4 
                border rounded-[15px]
                focus:outline-none focus:ring-2
                transition-all duration-200
                bg-white
                ${hasError ? "" : "border-gray-300 focus:ring-secondary-100"}
                ${inputClassName}
              `}
              style={
                hasError
                  ? {
                      borderColor: validationColor,
                      "--tw-ring-color": validationColor
                    }
                  : undefined
              }
              placeholder="Type relationship here..."
              autoFocus
            />
            <button
              type="button"
              onClick={() => {
                setShowCustomInput(false);
                if (!customInputValue.trim()) {
                  // Reset if empty
                  const mockEvent = {
                    target: {
                      name: name,
                      value: ""
                    }
                  };
                  onChange(mockEvent);
                }
              }}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        ) : (
          // Regular dropdown button
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
              transition-all duration-200 whitespace-nowrap overflow-hidden
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
                ? {
                    borderColor: validationColor,
                    "--tw-ring-color": validationColor
                  }
                : undefined
            }
            {...props}
          >
            {/* Display label with custom value indicator */}
            <span className={value ? "text-secondary-100" : "text-gray-400"}>
              {displayLabel}
            </span>

            {/* Arrow icon */}
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
        )}

        {/* Dropdown options panel */}
        {isOpen && !showCustomInput && (
          <div
            className="absolute top-full left-0 right-0 mt-2 w-full bg-white rounded-lg shadow-lg z-10 
                       border border-gray-200 overflow-hidden"
          >
            <ul className="max-h-60 overflow-y-auto">
              {options.map((option) => (
                <li
                  key={option.value}
                  className="px-5 py-3 cursor-pointer hover:bg-primary-100 hover:text-white text-secondary-100 
                             border-b border-gray-200 last:border-b-0 transition-colors duration-200"
                  onClick={() => handleSelectOption(option)}
                >
                  {option.label}
                </li>
              ))}
              {options.length === 0 && (
                <li className="px-5 py-3 text-gray-500">No options found</li>
              )}
            </ul>
          </div>
        )}
      </div>

      {/* Error and Helper Text */}
      {error && (
        <p
          className="text-[13px] mt-[4px] ml-2 min-h-[1.22rem]"
          style={{ color: validationColor }}
        >
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
