import { type User, type UserRow, UserRowSchema, UserSchema } from "types/User.ts";
import { describe, expect, it } from "vitest";

describe("User", () => {
  describe("UserSchema", () => {
    it("should succeed", () => {
      const user_row: UserRow = { id: "000000001", email: "john.doe@gmail.com", password_hash: "password", name: "John Doe" };
      const actual = UserRowSchema.safeParse(user_row);
      expect(actual.success).toBe(true);
    });

    it("should fail", () => {
      const user_row: UserRow = { id: "000000001", email: "john.doe", password_hash: "password", name: "John Doe" };
      const actual = UserRowSchema.safeParse(user_row);
      expect(actual.success).toBe(false);
    });

    it("does not expose the password hash", () => {
      const user: User = { id: "000000001", email: "john.doe@gmail.com", name: "John Doe" };
      const actual = UserSchema.safeParse(user);
      expect(actual.success).toBe(true);
    });
  });
});
