import * as bcrypt from 'bcrypt'; // Correct import for bcrypt

// Hash Password
export const HashPassword = async (createUserInput) => {
  // Hash the password with bcrypt
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(
    createUserInput.password,
    saltRounds,
  );

  return hashedPassword;
};

// Verify Password
export const verifyPassword = async (
  inputPassword: string, // Password entered by the user
  storedPassword: string, // Hashed password stored in the database
): Promise<boolean> => {
  // Compare the entered password with the stored (hashed) password
  const isMatch = await bcrypt.compare(inputPassword, storedPassword);

  return isMatch; // Returns true if the passwords match, false otherwise
};
