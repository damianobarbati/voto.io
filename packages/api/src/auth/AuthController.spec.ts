import { describe, expect, it, vi } from "vitest";
import UserRepository from "#api/user/UserRepository.ts";
import { app } from "../index.ts";
import AuthService from "./AuthService.ts";

describe("AuthController", () => {
  describe("POST /login", () => {
    it("returns the JWT as a JSON string", async () => {
      const response = await app.request("/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "john.doe@gmail.com", password: "Password123!" }),
      });
      const token = await response.json();

      expect(response.status).toEqual(200);
      expect(token).toEqual(expect.any(String));
    });

    it("rejects an invalid login payload", async () => {
      const response = await app.request("/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "john.doe@gmail.com" }),
      });

      expect(response.status).toEqual(400);
    });
  });

  describe("POST /register", () => {
    it("returns the JWT as a JSON string", async () => {
      const token = "header.payload.signature";
      vi.spyOn(AuthService, "register").mockResolvedValue(token);

      const response = await app.request("/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: "John",
          last_name: "Doe",
          birth_date: "1990-01-01",
          gender: "m",
          income: 50_000,
          city: "Rome",
          country: "it",
          language: "en",
          email: "john.doe@gmail.com",
          password: "Password123!",
        }),
      });

      expect(await response.json()).toEqual(token);
      expect(AuthService.register).toHaveBeenCalledWith({
        first_name: "John",
        last_name: "Doe",
        birth_date: "1990-01-01",
        gender: "m",
        income: 50_000,
        city: "Rome",
        country: "IT",
        language: "en",
        email: "john.doe@gmail.com",
        password: "Password123!",
      });
    });
  });

  describe("GET /me", () => {
    it("returns the authenticated user", async () => {
      const userRow = await UserRepository.findBy({ email: "john.doe@gmail.com" }, true);
      if (!userRow) throw new Error("Seeded user is missing");
      const { password_hash: _passwordHash, ...user } = userRow;
      const token = await AuthService.login({ email: "john.doe@gmail.com", password: "Password123!" });

      const response = await app.request("/me", { method: "GET", headers: { Authorization: `Bearer ${token}` } });
      const result = await response.json();

      expect(response.status).toEqual(200);
      expect(result).toMatchObject(user);
    });

    it("rejects a request without an authentication token", async () => {
      const response = await app.request("/me", { method: "GET" });

      expect(response.status).toEqual(401);
    });
  });
});
