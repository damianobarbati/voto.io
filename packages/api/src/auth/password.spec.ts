import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "./password.ts";

describe("password", () => {
  it("verifies the seeded password", async () => {
    const passwordHash = await hashPassword({ password: "Password123!" });
    const actual = await verifyPassword({ password: "Password123!", passwordHash });
    expect(actual).toBe(true);
  });

  it("rejects another password", async () => {
    const passwordHash = await hashPassword({ password: "Password123!" });
    const actual = await verifyPassword({ password: "Password123?", passwordHash });
    expect(actual).toBe(false);
  });
});
