import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import envk from "envk/fn";

export default async () => {
  const directory = path.dirname(fileURLToPath(import.meta.url));
  const envPath = path.resolve(directory, "../../../.env");
  const migrationsDirectory = path.resolve(directory, "../../api/database/migrations");
  if (fs.existsSync(envPath)) envk(envPath);
  const { default: database } = await import("../../api/database/database.ts");
  const { seed: cleanup } = await import("../../api/database/seeds/0-cleanup.ts");
  const { seed: plans } = await import("../../api/database/seeds/1-plans.ts");
  const { seed: users } = await import("../../api/database/seeds/1-users.ts");
  const { seed: polls } = await import("../../api/database/seeds/2-polls.ts");
  const { seed: domain } = await import("../../api/database/seeds/3-domain.ts");
  await database.migrate.latest({ directory: migrationsDirectory });
  await cleanup(database);
  await plans(database);
  await users(database);
  await polls(database);
  await domain(database);
  return async () => await database.destroy();
};
