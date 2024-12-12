import type { FromSchema } from 'json-schema-to-ts';

export const createSummarizeSchema = {
  type: 'object',
  properties: {
    content: { type: 'array', items: { type: 'string' } },
    pdf_file: { type: 'string' },
  },
  required: ['content', 'pdf_file'],
  additionalProperties: false,
} as const;

export type CreateSummarizeData = FromSchema<typeof createSummarizeSchema>;

export const pollSummarizeSchema = {
  type: 'object',
  properties: {
    requestId: { type: 'string' },
  },
  required: ['requestId'],
  additionalProperties: false,
} as const;

export type PollSummarizeData = FromSchema<typeof pollSummarizeSchema>;

export const updateSummarizeSchema = {
  type: 'object',
  properties: {
    content: { type: 'array', items: { type: 'string' } },
  },
  required: ['content'],
  additionalProperties: false,
} as const;

export type UpdateSummarizeData = FromSchema<typeof updateSummarizeSchema>;
