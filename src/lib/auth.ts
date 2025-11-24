import bcrypt from 'bcryptjs';

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

// Helper function สำหรับแยก password ออกจาก user object
export function excludePassword<T extends { password?: string }>(
  user: T
): Omit<T, 'password'> {
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
}
