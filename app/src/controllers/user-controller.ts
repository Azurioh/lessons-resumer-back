import type { Request, Response } from 'express';
import type { UserService } from '@src/services/user-service';
import type { GetUserByIdQueryType, UpdateUserData } from '@src/entities/users';

export class UserController {
  public userService: UserService;

  constructor(userService: UserService) {
    this.userService = userService;
  }

  getUserMe = async (req: Request & { user: GetUserByIdQueryType }, res: Response): Promise<void> => {
    const user = req.user;

    res.status(200).json({ data: user });
    return;
  };

  updateUserMe = async (req: Request & { user: GetUserByIdQueryType }, res: Response): Promise<void> => {
    const data: UpdateUserData = req.body;
    const userId = req.user.id;

    try {
      const user = await this.userService.updateUser(userId, data);
      res.status(200).json({ data: user });
      return;
    } catch (err) {
      if (err.message === 'User already exists') {
        res.status(409).json({ err: 'Username already taken' });
        return;
      }
      console.error(err);
      res.status(500).json({ err: 'An error occured during the account creation' });
    }
  };

  deleteUserMe = async (req: Request & { user: GetUserByIdQueryType }, res: Response): Promise<void> => {
    const userId = req.user.id;

    await this.userService.deleteUser(userId);

    res.status(204).send();
    return;
  };

  getUserById = async (req: Request & { user: GetUserByIdQueryType }, res: Response): Promise<void> => {
    const userId = req.params.id;

    const user = await this.userService.getUserById(userId);

    res.status(200).json({ data: user });
    return;
  };
}
