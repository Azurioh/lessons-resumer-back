import { UserRepository } from '@src/repositories/user-repository';
import JWTService from '@src/services/jwt-service';
import type { Response, NextFunction } from 'express';

const jwtService = new JWTService();
const userRepostory = new UserRepository();

const authMiddleware = async (req: any, res: Response, next: NextFunction) => {
  const tokenStr = req.headers.authorization;

  if (!tokenStr) {
    res.status(401).json({ err: 'No token provided.' });
    return;
  }

  if (!tokenStr.startsWith('Bearer ')) {
    res.status(401).json({ err: 'Invalid token format.' });
    return;
  }

  const token = tokenStr.replace('Bearer ', '');

  try {
    const { decoded, tokenExpired } = jwtService.verifyToken(token);
    if (tokenExpired) {
      res.status(401).json({ err: 'Token expired.' });
      return;
    }

    const user = await userRepostory.getUserById(decoded.id);
    req.user = user;

    next();
  } catch (err) {
    console.error(err);
    res.status(401).json({ err: 'Invalid token.' });
    return;
  }
};

export default authMiddleware;
