import type { FromSchema } from 'json-schema-to-ts';

export const registerSchema = {
  type: 'object',
  properties: {
    username: { type: 'string' },
    firstName: { type: 'string' },
    lastName: { type: 'string' },
    email: { type: 'string' },
    password: { type: 'string' },
  },
  required: ['username', 'firstName', 'lastName', 'email', 'password'],
  additionalProperties: false,
} as const;

export type RegisterData = FromSchema<typeof registerSchema>;

export const loginSchema = {
  type: 'object',
  properties: {
    username: { type: 'string' },
    email: { type: 'string' },
    password: { type: 'string' },
  },
  anyOf: [{ required: ['username', 'password'] }, { required: ['email', 'password'] }],
  additionalProperties: false,
} as const;

export type LoginData = FromSchema<typeof loginSchema>;
