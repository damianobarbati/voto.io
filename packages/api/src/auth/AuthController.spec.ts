import type { User } from "types/User.ts";
import { describe, expect, it, vi } from "vitest";
import { app } from "../index.ts";
import AuthService from "./AuthService.ts";

describe("AuthController", () => {
  describe("POST /login", () => {
    it("returns the JWT as a JSON string", async () => {
      const token = "header.payload.signature";
      vi.spyOn(AuthService, "login").mockResolvedValue(token);

      const response = await app.request("/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "john.doe@gmail.com", password: "Password123!" }),
      });

      expect(response.status).toEqual(200);
      expect(await response.json()).toEqual(token);
      expect(AuthService.login).toHaveBeenCalledWith({ email: "john.doe@gmail.com", password: "Password123!" });
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

  describe("GET /me", () => {
    it("returns the authenticated user", async () => {
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
      vi.spyOn(AuthService, "me").mockResolvedValue(user);

      const response = await app.request("/me", {
        method: "GET",
        headers: { Authorization: "Bearer header.payload.signature" },
      });

      expect(response.status).toEqual(200);
      expect(await response.json()).toMatchObject(user);
      expect(AuthService.me).toHaveBeenCalledWith({ authorization: "Bearer header.payload.signature" });
    });

    it("rejects a request without an authentication token", async () => {
      const response = await app.request("/me", { method: "GET" });

      expect(response.status).toEqual(401);
    });
  });
});
