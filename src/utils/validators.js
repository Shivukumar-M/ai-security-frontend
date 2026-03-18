// frontend/src/utils/validators.js

/**
 * Validates if an email string is in a correct format.
 */
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validates password strength (e.g., min 8 chars).
 */
export const isValidPassword = (password) => {
  return password.length >= 8;
};