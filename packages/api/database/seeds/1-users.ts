import type { Knex } from "knex";
import AuthService from "#api/auth/AuthService.ts";

export async function seed(database: Knex): Promise<void> {
  const password_hash = await AuthService.hashPassword({ password: "Password123!" });
  await database("users").insert([
    {
      id: "user-john",
      email: "john.doe@gmail.com",
      password_hash,
      name: "John Doe",
      first_name: "John",
      last_name: "Doe",
      birth_date: "1990-04-12",
      gender: "m",
      income: 50_000,
      city: "Rome",
      country: "IT",
      language: "en",
    },
    {
      id: "user-jane",
      email: "jane.dane@gmail.com",
      password_hash,
      name: "Jane Dane",
      first_name: "Jane",
      last_name: "Dane",
      birth_date: "1987-09-03",
      gender: "f",
      income: 62_000,
      city: "Milan",
      country: "IT",
      language: "it",
    },
    {
      id: "user-ana",
      email: "ana.rossi@example.com",
      password_hash,
      name: "Ana Rossi",
      first_name: "Ana",
      last_name: "Rossi",
      birth_date: "1998-01-21",
      gender: "f",
      income: 32_000,
      city: "Milan",
      country: "IT",
      language: "it",
    },
    {
      id: "user-luca",
      email: "luca.bianchi@example.com",
      password_hash,
      name: "Luca Bianchi",
      first_name: "Luca",
      last_name: "Bianchi",
      birth_date: "1978-07-11",
      gender: "m",
      income: 78_000,
      city: "Turin",
      country: "IT",
      language: "it",
    },
  ]);
}
