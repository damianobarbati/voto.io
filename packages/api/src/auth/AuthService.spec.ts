import { describe, expect, it } from "vitest";
import AuthService from "./AuthService.ts";

describe("AuthService", () => {
  it("verifies the seeded password", async () => {
    const passwordHash = await AuthService.hashPassword({ password: "Password123!" });
    const result = await AuthService.verifyPassword({ password: "Password123!", passwordHash });
    expect(result).toBe(true);
  });

  it("rejects another password", async () => {
    const passwordHash = await AuthService.hashPassword({ password: "Password123!" });
    const result = await AuthService.verifyPassword({ password: "Password123?", passwordHash });
    expect(result).toBe(false);
  });
});
