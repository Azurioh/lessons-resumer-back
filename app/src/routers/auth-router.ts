import express from 'express';
import { UserRepository } from '@repositories/user-repository';
import { UserService } from '@services/user-service';
import { AuthController } from '@controllers/auth-controller';
import requestValidator from '@src/middlewares/request-validator';
import { loginSchema, registerSchema } from '@src/entities/auth';

const authRouter = express.Router();

const userRepository = new UserRepository();
const userService = new UserService(userRepository);
const authController = new AuthController(userService);

authRouter.post('/login', requestValidator(loginSchema), authController.loginUser);
authRouter.post('/register', requestValidator(registerSchema), authController.registerUser);

export default authRouter;
