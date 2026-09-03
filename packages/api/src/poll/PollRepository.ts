import Repository from "nano-fw/database/Repository.ts";
import type { PollRow } from "types/Poll.ts";
import database from "#api-database/database.ts";

class PollRepository extends Repository<PollRow> {}

export default new PollRepository({ database, tableName: "polls", uniqueSortColumn: "id" });
