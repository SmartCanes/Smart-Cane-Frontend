import { useState } from "react";
import checkboxIcon from "@/assets/images/checkbox.png";
import EyeOn from "@/assets/images/eye-on.svg";
import EyeOff from "@/assets/images/eye-off.svg";

const PasswordField = ({
  label,
  placeholder,
  className,
  required,
  name,
  value,
  onChange,
  error = "",
  helperText = "",
  showValidationRules = false,
  inputClassName = "",
  showErrorIcon = false,
  ...rest
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const validationColor = "var(--color-validation-100, #CE4B34)";
  const hasError = Boolean(error);
  const errorHasContent =
    typeof error === "string" ? error.trim().length > 0 : Boolean(error);
  const passwordValue = value || "";
  const {
    onFocus: inputOnFocus,
    onBlur: inputOnBlur,
    type: _ignoredInputType,
    ...inputProps
  } = rest;

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const labelColor = hasError
    ? validationColor
    : "var(--color-secondary-100, #1C253C)";

  const hasLower = /[a-z]/.test(passwordValue);
  const hasUpper = /[A-Z]/.test(passwordValue);
  const hasNumber = /[0-9]/.test(passwordValue);
  const hasSpecial = /[!@#$%^&*]/.test(passwordValue);
  const hasLength = passwordValue.length >= 8;

  const passwordRules = [
    {
      key: "lowerUpper",
      label: "Lowercase & Uppercase",
      isValid: hasLower && hasUpper
    },
    {
      key: "number",
      label: "Number (0-9)",
      isValid: hasNumber
    },
    {
      key: "special",
      label: "Special Character (!@#$%^&*)",
      isValid: hasSpecial
    },
    {
      key: "length",
      label: "At least 8 Characters",
      isValid: hasLength
    }
  ];

  const shouldShowRules =
    showValidationRules && (isFocused || passwordValue.length > 0);

  const handleFocus = (event) => {
    setIsFocused(true);
    if (inputOnFocus) {
      inputOnFocus(event);
    }
  };

  const handleBlur = (event) => {
    setIsFocused(false);
    if (inputOnBlur) {
      inputOnBlur(event);
    }
  };

  const renderRuleIndicator = (isValid) => (
    <span className="flex h-5 w-5 shrink-0 items-center justify-center">
      {isValid && <img src={checkboxIcon} alt="Valid" className="h-4 w-4" />}
    </span>
  );

  return (
    <div className={`flex flex-col top-left item-align-center ${className}`}>
      {label && (
        <label
          htmlFor={name}
          className="font-poppins font-medium mt-2 text-[16px] align-center"
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
      <div className="relative">
        <input
          id={name}
          type={showPassword ? "text" : "password"}
          name={name}
          value={value || ""}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={`w-full px-4 py-4 border rounded-customradius focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-transparent item-center ${
            hasError ? "" : "border-gray-300"
          } ${inputClassName}`}
          style={
            hasError
              ? {
                  borderColor: validationColor,
                  "--tw-ring-color": validationColor
                }
              : undefined
          }
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...inputProps}
        />
        <button
          type="button"
          onClick={togglePasswordVisibility}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
        >
          <img
            src={showPassword ? EyeOff : EyeOn}
            alt={showPassword ? "Hide password" : "Show password"}
            className="item-center py-2 h-10 w-10"
          />
        </button>
      </div>
      {hasError && errorHasContent && (
        <p
          className="flex items-center gap-2 text-sm mt-1 ml-2"
          style={{ color: validationColor }}
        >
          {showErrorIcon && (
            <span className="material-symbols-outlined text-base">error</span>
          )}
          <span>{typeof error === "string" ? error.trim() : error}</span>
        </p>
      )}
      {shouldShowRules && (
        <ul className="mt-3 space-y-2 text-sm font-poppins">
          {passwordRules.map((rule) => (
            <li
              key={rule.key}
              className={`flex items-center gap-2 transition-colors duration-150 ${
                rule.isValid
                  ? "text-[color:var(--color-secondary-100,#1C253C)]"
                  : "text-[#1C253C80]"
              }`}
            >
              {renderRuleIndicator(rule.isValid)}
              <span>{rule.label}</span>
            </li>
          ))}
        </ul>
      )}
      {helperText && !error && (
        <p className="text-gray-500 text-sm mt-1">{helperText}</p>
      )}
    </div>
  );
};

export default PasswordField;
