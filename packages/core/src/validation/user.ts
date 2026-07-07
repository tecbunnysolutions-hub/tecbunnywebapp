import { z } from 'zod';

export const GetUsersSchema = z.object({
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(10),
  search: z.string().default(''),
  roles: z.array(z.string()).default([]),
  sortColumn: z.string().default('created_at'),
  sortDirection: z.enum(['asc', 'desc']).default('desc'),
  operatorRole: z.string().nullable().default(null),
});

export const CreateUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  role: z.string().optional(),
  mobile: z.string().optional(),
  password: z.string().optional(),
  operatorRole: z.string().nullable(),
  operatorId: z.string(),
});

export const UpdateUserSchema = z.object({
  userId: z.string(),
  updates: z.record(z.string(), z.any()),
  operatorRole: z.string().nullable(),
  operatorId: z.string(),
});

export const DeleteUserSchema = z.object({
  userId: z.string(),
  operatorRole: z.string().nullable(),
  operatorId: z.string(),
});
