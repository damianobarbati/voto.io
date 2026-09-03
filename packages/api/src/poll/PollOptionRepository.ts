import Repository from "nano-fw/database/Repository.ts";
import type { PollOptionRow } from "types/Poll.ts";
import database from "#api-database/database.ts";

class PollOptionRepository extends Repository<PollOptionRow> {}

export default new PollOptionRepository({ database, tableName: "poll_options", uniqueSortColumn: "id" });
