import { SHA256 } from 'crypto-js';
import { generateSalt } from './generate-salt';

const salt = generateSalt(16);

export const hashPassword = (password: string): string => {
  const hashedPassword = SHA256(password + salt).toString();
  return hashedPassword;
};
