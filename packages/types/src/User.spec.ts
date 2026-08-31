import { type User, type UserRow, UserRowSchema, UserSchema } from "types/User.ts";
import { describe, expect, it } from "vitest";

describe("User", () => {
  describe("UserSchema", () => {
    it("should succeed", () => {
      const user_row: UserRow = {
        id: "000000001",
        created_at: "2026-01-01T00:00:00Z",
        updated_at: "2026-01-01T00:00:00Z",
        email: "john.doe@gmail.com",
        password_hash: "password",
        name: "John Doe",
        first_name: "John",
        last_name: "Doe",
        birth_date: "1990-01-01T00:00:00Z",
        gender: "m",
        income: 50_000,
        city: "Rome",
        country: "IT",
        language: "it",
      };
      const actual = UserRowSchema.safeParse(user_row);
      expect(actual.success).toBe(true);
    });

    it("should fail", () => {
      const user_row: UserRow = {
        id: "000000001",
        created_at: "2026-01-01T00:00:00Z",
        updated_at: "2026-01-01T00:00:00Z",
        email: "john.doe",
        password_hash: "password",
        name: "John Doe",
        first_name: "John",
        last_name: "Doe",
        birth_date: "1990-01-01T00:00:00Z",
        gender: "m",
        income: 50_000,
        city: "Rome",
        country: "IT",
        language: "it",
      };
      const actual = UserRowSchema.safeParse(user_row);
      expect(actual.success).toBe(false);
    });

    it("does not expose the password hash", () => {
      const user: User = {
        id: "000000001",
        created_at: "2026-01-01T00:00:00Z",
        updated_at: "2026-01-01T00:00:00Z",
        email: "john.doe@gmail.com",
        name: "John Doe",
        first_name: "John",
        last_name: "Doe",
        birth_date: "1990-01-01T00:00:00Z",
        gender: "m",
        income: 50_000,
        city: "Rome",
        country: "IT",
        language: "it",
      };
      const actual = UserSchema.safeParse(user);
      expect(actual.success).toBe(true);
    });
  });
});
