import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export default class JWTService {
  private secretKey: string | undefined;

  constructor() {
    this.secretKey = process.env.JWT_SECRET;

    if (!this.secretKey) {
      console.error('JWT secret key not found');
      throw new Error('JWT secret key not found');
    }
  }

  signToken = (payload: any, expiresIn = '24h') => {
    try {
      const token = jwt.sign(payload, this.secretKey, { expiresIn });
      return token;
    } catch (error) {
      console.error('Error signing the token:', error);
      throw new Error('Error when signing token: ', error);
    }
  };

  signTokenNoExpiration = (payload: any) => {
    try {
      const token = jwt.sign(payload, this.secretKey);
      return token;
    } catch (error) {
      console.error('Error signing the token:', error);
      throw new Error('Error when signing token: ', error);
    }
  };

  verifyToken = (token: string) => {
    let decoded: any;
    let tokenExpired = false;

    try {
      decoded = jwt.verify(token, this.secretKey);
    } catch (error) {
      console.error('Error verifying the token:', error);
      if (error instanceof jwt.TokenExpiredError) {
        console.error('Token expired');
        tokenExpired = true;
      } else {
        throw new Error('Invalid token');
      }
    }

    return { decoded, tokenExpired };
  };
}
