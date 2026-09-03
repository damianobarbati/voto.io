import { z } from "zod";

export const UserRowSchema = z
  .object({
    id: z.string(),
    created_at: z.iso.datetime(),
    updated_at: z.iso.datetime(),
    email: z.email(),
    password_hash: z.string(),
    name: z.string(),
    first_name: z.string().nullable(),
    last_name: z.string().nullable(),
    birth_date: z.iso.datetime(),
    gender: z.enum(["m", "f"]).nullable(),
    income: z.number().nonnegative().nullable(),
    city: z.string().nullable(),
    country: z.string().length(2).nullable(),
    language: z.enum(["en", "es", "de", "fr", "it"]),
  })
  .strict();
export type UserRowUnsafe = z.input<typeof UserRowSchema>;
export type UserRow = z.output<typeof UserRowSchema>;

export const UserSchema = UserRowSchema.omit({ password_hash: true });
export type User = z.output<typeof UserSchema>;

export const UserLoginRequestSchema = z
  .object({
    email: z.email(),
    password: z.string().min(1),
  })
  .strict();
export type UserLoginRequest = z.output<typeof UserLoginRequestSchema>;

export const UserRegisterRequestSchema = z
  .object({
    first_name: z.string().trim().min(1).max(100),
    last_name: z.string().trim().min(1).max(100),
    birth_date: z.iso.date(),
    gender: z.enum(["m", "f"]),
    income: z.number().nonnegative(),
    city: z.string().trim().min(1).max(100),
    country: z.string().trim().length(2).toUpperCase(),
    language: z.enum(["en", "es", "de", "fr", "it"]),
    email: z.email(),
    password: z.string().min(1),
  })
  .strict();
export type UserRegisterRequest = z.output<typeof UserRegisterRequestSchema>;

export const UserMeRequestSchema = z
  .object({
    authorization: z.string().min(1),
  })
  .strict();
export type UserMeRequest = z.output<typeof UserMeRequestSchema>;

export const UserLoginResponseSchema = z.string().min(1);
export type UserLoginResponse = z.output<typeof UserLoginResponseSchema>;
