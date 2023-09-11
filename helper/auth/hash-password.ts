import { SHA256 } from 'crypto-js';
import { generateSalt } from './generate-salt';

export const hashPassword = (password: string): string => {
  const salt = generateSalt(16);
  const hashedPassword = SHA256(password + salt).toString();

  return hashedPassword;
};
