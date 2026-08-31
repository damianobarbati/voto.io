import { z } from "zod";

export const UserRowSchema = z
  .object({
    id: z.string(),
    email: z.email(),
    password_hash: z.string(),
    name: z.string(),
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

export const UserLoginResponseSchema = z
  .object({
    user: UserSchema,
    token: z.string().min(1),
  })
  .strict();
export type UserLoginResponse = z.output<typeof UserLoginResponseSchema>;
