import * as jwt from 'jsonwebtoken';

const tokenExpiresIn = '1h';

export const generateToken = (userId: string): string => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: tokenExpiresIn });
};
