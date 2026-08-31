import Repository from "nano-fw/database/Repository.ts";
import type { UserRow } from "types/User.ts";
import database from "#api-database/database.ts";

class UserRepository extends Repository<UserRow> {}

export default new UserRepository({ database, tableName: "users", uniqueSortColumn: "id" });
