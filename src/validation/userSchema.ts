export function validateLogin({ email, password }: { email: string; password: string }) {
  const errors: Record<string, string> = {};

  // Trim and normalize
  const normalizedEmail = email.trim().toLowerCase();

  // Email validation
  if (!normalizedEmail) {
    errors.email = "Email is required";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    errors.email = "Invalid email format";
  }

  // Password validation
  if (!password) {
    errors.password = "Password is required";
  } else if (password.length < 5) {
    errors.password = "Password must be at least 5 characters";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    data: {
      email: normalizedEmail,
      password,
    },
  };
}
