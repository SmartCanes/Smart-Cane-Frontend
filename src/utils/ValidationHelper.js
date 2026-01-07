const VALIDATION_RULES = {
  firstName: [
    { test: (v) => v.trim() !== "", message: "First Name is required" },
    {
      test: (v) => /^[a-zA-Z\s]+$/.test(v),
      message: "Only letters and spaces allowed"
    },
    {
      test: (v) => v.length >= 2,
      message: "Should be at least 2 characters long"
    },
    { test: (v) => v.length <= 50, message: "Should not exceed 50 characters" }
  ],
  middleName: [
    {
      test: (v) => !v || /^[a-zA-Z\s]+$/.test(v),
      message: "Only letters and spaces allowed"
    },
    {
      test: (v) => !v || v.length >= 2,
      message: "Should be at least 2 characters long"
    },
    {
      test: (v) => !v || v.length <= 50,
      message: "Should not exceed 50 characters"
    }
  ],
  lastName: [
    { test: (v) => v.trim() !== "", message: "Last Name is required" },
    {
      test: (v) => /^[a-zA-Z\s]+$/.test(v),
      message: "Only letters and spaces allowed"
    },
    {
      test: (v) => v.length >= 2,
      message: "Should be at least 2 characters long"
    },
    { test: (v) => v.length <= 50, message: "Should not exceed 50 characters" }
  ],
  username: [
    { test: (v) => v.trim() !== "", message: "Username is required" },
    {
      test: (v) => /^[a-zA-Z0-9_]+$/.test(v),
      message: "Only letters, numbers, underscores"
    },
    { test: (v) => v.length >= 3, message: "At least 3 characters" },
    { test: (v) => v.length <= 20, message: "No more than 20 characters" },
    {
      test: (v) => (v.match(/[a-zA-Z]/g) || []).length >= 3,
      message: "Must contain at least 3 letters"
    }
  ],
  email: [
    { test: (v) => v.trim() !== "", message: "Email is required" },
    {
      test: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
      message: "Invalid email address"
    },
    {
      test: (v) => v.length <= 100,
      message: "Email should not exceed 100 characters"
    }
  ],
  contactNumber: [
    { test: (v) => v.trim() !== "", message: "Contact Number is required" },
    { test: (v) => /^\d{11}$/.test(v), message: "Must be exactly 11 digits" },
    { test: (v) => /^09\d{9}$/.test(v), message: "Must start with 09" }
  ],
  streetAddress: [
    { test: (v) => v.trim() !== "", message: "Street Address is required" },
    { test: (v) => v.length >= 5, message: "Should be more specific" },
    {
      test: (v) => v.length <= 100,
      message: "Should not exceed 100 characters"
    }
  ]
};

export const validateField = (name, value) => {
  const rules = VALIDATION_RULES[name];
  if (!rules) return "";

  for (const rule of rules) {
    if (!rule.test(value)) return rule.message;
  }

  return "";
};
