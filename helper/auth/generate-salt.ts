import { enc } from 'crypto-js';

export const generateSalt = (length: number): string => {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const salt = enc.Hex.parse('');

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    salt.concat(enc.Utf8.parse(charset.charAt(randomIndex)));
  }

  return salt.toString(enc.Hex);
};
