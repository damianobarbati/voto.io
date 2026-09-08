import Repository from "nano-fw/database/Repository.ts";
import type { PollPageRequest, PollRow } from "types/Poll.ts";
import database from "#api-database/database.ts";

class PollRepository extends Repository<PollRow> {
  async page({ offset, limit, query, group_ids, sort }: PollPageRequest) {
    const polls = database<PollRow>("polls");
    if (query) polls.whereRaw("strpos(lower(name), lower(?)) > 0", [query]);
    if (group_ids) polls.whereIn("group_id", group_ids.split(","));
    else polls.whereNull("group_id");
    const count = await polls.clone().count<{ count: string }>("id as count").first();
    if (sort === "Closing time: soonest") polls.orderBy("closes_at", "asc");
    if (sort === "Closing time: latest") polls.orderBy("closes_at", "desc");
    const rows = await polls.orderBy("id", "asc").limit(limit).offset(offset);
    const result = { rows, total: Number(count ? count.count : 0) };
    return result;
  }
}

export default new PollRepository({ database, tableName: "polls", uniqueSortColumn: "id" });
