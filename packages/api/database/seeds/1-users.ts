import type { Knex } from "knex";
import AuthService from "#api/auth/AuthService.ts";

export async function seed(database: Knex): Promise<void> {
  await database("users").insert({
    email: "john.doe@gmail.com",
    password_hash: await AuthService.hashPassword({ password: "Password123!" }),
    name: "John Doe",
  });
}
