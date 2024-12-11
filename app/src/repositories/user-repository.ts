import type { UpdateUserData } from '@entities/users';
import { prisma } from '@global';
import type { Prisma } from '@prisma/client';
import type { RegisterData } from '@src/entities/auth';

export class UserRepository {
  async getAllUsers(include?: Prisma.UserInclude, where?: Prisma.UserWhereInput) {
    return await prisma.user.findMany({
      include: { ...include },
      where: { ...where },
    });
  }

  async getUserById(id: string, include?: Prisma.UserInclude) {
    return await prisma.user.findUniqueOrThrow({
      where: { id },
      include: { ...include },
    });
  }

  async getUserByUsername(username: string, include?: Prisma.UserInclude) {
    return await prisma.user.findUniqueOrThrow({
      where: { username },
      include: { ...include },
    });
  }

  async getUserByEmail(email: string, include?: Prisma.UserInclude) {
    return await prisma.user.findUniqueOrThrow({
      where: { email },
      include: { ...include },
    });
  }

  async createUser(userData: RegisterData) {
    return await prisma.user.create({
      data: userData,
    });
  }

  async updateUser(id: string, userData: UpdateUserData) {
    return await prisma.user.update({
      where: { id },
      data: userData,
    });
  }

  async deleteUser(id: string) {
    return await prisma.user.update({ where: { id }, data: { deletedAt: new Date() } });
  }
}
