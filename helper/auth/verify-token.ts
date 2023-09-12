import * as jwt from 'jsonwebtoken';

export const verifyToken = (token: string): jwt.JwtPayload => {
  const decoded = jwt.verify(token, process.env.JWT_SECRET as jwt.Secret, {
    algorithms: [process.env.JWT_ALGORITHM as jwt.Algorithm],
  });

  return decoded as jwt.JwtPayload;
};
