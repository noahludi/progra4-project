import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1).optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const reviewSchema = z.object({
  bookId: z.string().min(1),
  title: z.string().min(1),
  content: z.string().min(1),
  rating: z.number().int().min(1).max(5),
});

export const voteSchema = z.object({
  value: z.number().int().refine((v) => v === 1 || v === -1),
});

export const favoriteSchema = z.object({
  bookId: z.string().min(1),
});
