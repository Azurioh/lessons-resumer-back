import express from 'express';
import { UserRepository } from '@repositories/user-repository';
import { UserService } from '@services/user-service';
import { UserController } from '@src/controllers/user-controller';
import requestValidator from '@src/middlewares/request-validator';
import { updateUserSchema } from '@src/entities/users';

const userRouter = express.Router();

const userRepository = new UserRepository();
const userService = new UserService(userRepository);
const userController = new UserController(userService);

userRouter.get('/me', userController.getUserMe);
userRouter.put('/me', requestValidator(updateUserSchema), userController.updateUserMe);
userRouter.delete('/me', userController.deleteUserMe);
userRouter.get('/:id', userController.getUserById);

export default userRouter;
