import Repository from "nano-fw/database/Repository.ts";
import type { PollOptionRow } from "types/Poll.ts";
import database from "#api-database/database.ts";

class PollOptionRepository extends Repository<PollOptionRow> {
  async forPolls({ pollIds }: { pollIds: string[] }): Promise<PollOptionRow[]> {
    const result = await database<PollOptionRow>("poll_options").whereIn("poll_id", pollIds).orderBy("position");
    return result;
  }
}

export default new PollOptionRepository({ database, tableName: "poll_options", uniqueSortColumn: "id" });
