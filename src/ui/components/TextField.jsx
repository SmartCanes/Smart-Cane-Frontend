const TextField = ({
  label,
  type = "text",
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
  inputClassName = "",
  labelClassName = "",
  ...props
}) => {
  const validationColor = "var(--color-validation-100, #CE4B34)";
  const hasError = Boolean(error);
  const errorHasContent =
    typeof error === "string" ? error.trim().length > 0 : Boolean(error);
  const labelColor = hasError
    ? validationColor
    : "var(--color-secondary-100, #1C253C)";

  return (
    <div className={`w-full ${className}`}>
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

      <input
        type={type}
        id={id || name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className={`
          w-full px-5 py-4 
          border rounded-customradius
          focus:outline-none focus:ring-2 focus:border-transparent
          disabled:bg-gray-100 disabled:cursor-not-allowed
          ${
            hasError
              ? "" // Use inline style for validation color to respect CSS variable
              : "border-gray-300 focus:ring-primary-100" // Default ring color when no error
          }
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
      />

      {hasError && errorHasContent && (
        <p className="text-sm mt-1 ml-2" style={{ color: validationColor }}>
          {typeof error === "string" ? error.trim() : error}
        </p>
      )}

      {helperText && !error && (
        <p className="text-gray-500 text-sm mt-1">{helperText}</p>
      )}
    </div>
  );
};

export default TextField;
