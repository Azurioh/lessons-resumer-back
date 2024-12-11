import type { Request, Response } from 'express';
import type { UserService } from '@src/services/user-service';
import { encryptPassword, verifyPassword } from '@libs/password';
import JWTService from '@services/jwt-service';
import { userTypeData } from '@src/entities/users';
import { TokenTypes } from '@src/enums/tokens';

const jwtService = new JWTService();

export class AuthController {
  public userService: UserService;

  constructor(userService: UserService) {
    this.userService = userService;
  }

  loginUser = async (req: Request, res: Response): Promise<void> => {
    const userData = req.body;

    try {
      const user = await this.userService.getUserByEmail(userData.email);

      if (!verifyPassword(userData.password, user.password)) {
        res.status(404).json({ err: 'Email and/or password invalid.' });
        return;
      }

      const userInformations = userTypeData(user);

      const accessToken = jwtService.signToken({ ...userInformations, type: TokenTypes.ACCESS });
      const refreshToken = jwtService.signToken({
        id: userInformations.id,
        email: user.email,
        type: TokenTypes.REFRESH,
      });

      res.status(200).json({ data: { accessToken, refreshToken } });
      return;
    } catch (err) {
      console.error(err);
      res.status(404).json({ err: 'Email and/or password invalid.' });
      return;
    }
  };

  registerUser = async (req: Request, res: Response): Promise<void> => {
    const userData = req.body;

    try {
      userData.password = encryptPassword(userData.password);

      const user = await this.userService.createUser(userData);

      const userInformations = userTypeData(user as any);

      const accessToken = jwtService.signToken({ ...userInformations, type: TokenTypes.ACCESS });
      const refreshToken = jwtService.signToken({
        id: userInformations.id,
        email: user.email,
        type: TokenTypes.REFRESH,
      });

      res.status(201).json({ data: { accessToken, refreshToken } });
      return;
    } catch (err) {
      console.error(err);
      res.status(500).json({ err: 'An error occured during the account creation' });
      return;
    }
  };
}
