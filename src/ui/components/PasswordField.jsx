import { useState } from "react";

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
  labelClassName = "",
  showErrorIcon = false,
  reserveErrorSpace = false,
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
      {isValid && (
        <svg className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      )}
    </span>
  );

  return (
    <div className={`flex flex-col top-left item-align-center ${className}`}>
      {label && (
        <label
          htmlFor={name}
          className={`font-poppins font-medium mt-0 mb-1.5 sm:mb-2 text-[15px] sm:text-[17px] align-center ${labelClassName}`}
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
          className={`w-full pl-4 pr-10 py-2.5 sm:py-3.5 text-sm sm:text-base border rounded-customradius focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-transparent item-center font-poppins ${
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
          {showPassword ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
              <line x1="1" y1="1" x2="23" y2="23"/>
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          )}
        </button>
      </div>
      {reserveErrorSpace ? (
        <p
          className={`flex items-center gap-2 text-sm mt-1 ml-2 min-h-[1.25rem] font-poppins ${
            hasError && errorHasContent ? "visible" : "invisible"
          }`}
          style={{ color: validationColor }}
        >
          {showErrorIcon && hasError && errorHasContent && (
            <span className="material-symbols-outlined text-base">error</span>
          )}
          <span>
            {hasError && errorHasContent
              ? typeof error === "string"
                ? error.trim()
                : error
              : " "}
          </span>
        </p>
      ) : (
        hasError &&
        errorHasContent && (
          <p
            className="flex items-center gap-2 text-sm mt-1 ml-2 font-poppins"
            style={{ color: validationColor }}
          >
            {showErrorIcon && (
              <span className="material-symbols-outlined text-base">error</span>
            )}
            <span>{typeof error === "string" ? error.trim() : error}</span>
          </p>
        )
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
        <p className="text-gray-500 text-sm mt-1 font-poppins">{helperText}</p>
      )}
    </div>
  );
};

export default PasswordField;