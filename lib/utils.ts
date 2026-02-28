export const validateUsername = (name: string) => {
  // Validates that the username is at least 3 characters long
  // and contains only letters (a–z, A–Z), numbers (0–9), or underscores (_)
  // ^                → start of string
  // [a-zA-Z0-9_]+   → one or more allowed characters (letters, digits, underscore)
  // $                → end of string
  // This ensures the entire username matches the allowed character set with no spaces or special symbols
  return name.length >= 3 && /^[a-zA-Z0-9_]+$/.test(name);
};
