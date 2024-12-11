import type { Prisma } from '@prisma/client';
import type { RegisterData } from '@src/entities/auth';
import type { UpdateUserData } from '@src/entities/users';
import type { UserRepository } from '@src/repositories/user-repository';

export class UserService {
  public userRepository: UserRepository;

  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
  }

  async getAllUsers(include?: Prisma.UserInclude, where?: Prisma.UserWhereInput) {
    return await this.userRepository.getAllUsers(include, where);
  }

  async getUserByUsername(username: string, include?: Prisma.UserInclude) {
    return await this.userRepository.getUserByUsername(username, include);
  }

  async getUserById(id: string, include?: Prisma.UserInclude) {
    return await this.userRepository.getUserById(id, include);
  }

  async getUserByEmail(email: string, include?: Prisma.UserInclude) {
    return await this.userRepository.getUserByEmail(email, include);
  }

  async createUser(userData: RegisterData) {
    try {
      const user = await this.getUserByUsername(userData.username);
      if (user) {
        throw new Error('User already exists');
      }
    } catch (err) {
      if (err.message === 'User already exists') {
        throw err;
      }
    }

    try {
      const user = await this.getUserByEmail(userData.email);
      if (user) {
        throw new Error('User already exists');
      }
    } catch (err) {
      if (err.message === 'User already exists') {
        throw err;
      }
    }

    return await this.userRepository.createUser(userData);
  }

  async updateUser(id: string, userData: UpdateUserData) {
    try {
      if (userData.username) {
        const user = await this.getUserByUsername(userData.username);
        if (user.id !== id) {
          throw new Error('User already exists');
        }
      }
    } catch (err) {
      if (err.message === 'User already exists') {
        throw err;
      }
    }
    return await this.userRepository.updateUser(id, userData);
  }

  async deleteUser(id: string) {
    return await this.userRepository.deleteUser(id);
  }
}
