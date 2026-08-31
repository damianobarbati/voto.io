import type { Knex } from "knex";
import { hashPassword } from "#api/auth/password.ts";

export async function seed(database: Knex): Promise<void> {
  await database("users").insert({
    email: "john.doe@gmail.com",
    password_hash: await hashPassword({ password: "Password123!" }),
    name: "John Doe",
  });
}
