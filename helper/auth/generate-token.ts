import * as jwt from 'jsonwebtoken';

export const generateToken = (data: { [key: string]: any }): string => {
  return jwt.sign(data, process.env.JWT_SECRET as jwt.Secret, {
    expiresIn: process.env.JWT_EXPIRATION as string,
    algorithm: process.env.JWT_ALGORITHM as jwt.Algorithm,
  });
};
