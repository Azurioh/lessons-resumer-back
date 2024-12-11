import type { Prisma } from '@prisma/client';
import { UserRepository } from '@src/repositories/user-repository';
import type { FromSchema } from 'json-schema-to-ts';

export const updateUserSchema = {
  type: 'object',
  properties: {
    username: { type: 'string' },
    firstName: { type: 'string' },
    lastName: { type: 'string' },
  },
  anyOf: [{ required: ['username'] }, { required: ['firstName'] }, { required: ['lastName'] }],
  additionalProperties: false,
} as const;

export type UpdateUserData = FromSchema<typeof updateUserSchema>;

// TYPES
const userRepository = new UserRepository();

export type GetAllUsersQueryType = Prisma.PromiseReturnType<typeof userRepository.getAllUsers>;
export type GetUserByIdQueryType = Prisma.PromiseReturnType<typeof userRepository.getUserById>;
export type GetUserByEmailQueryType = Prisma.PromiseReturnType<typeof userRepository.getUserByEmail>;

export type UserType = {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  createdAt: Date;
  nbSummarizes?: number;
};

export const userTypeData = (user: GetUserByIdQueryType): UserType => ({
  id: user.id,
  username: user.username,
  firstName: user.firstName,
  lastName: user.lastName,
  createdAt: user.createdAt,
  ...(user.summarizes && { nbSummarizes: user.summarizes?.length }),
});
