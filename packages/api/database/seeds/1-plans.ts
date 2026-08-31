import type { Knex } from "knex";

export async function seed(database: Knex): Promise<void> {
  await database("plans").insert([
    { id: "free", name: "Free", monthly_price: 0, group_member_limit: 0, live_voter_limit: 100 },
    { id: "small", name: "Small", monthly_price: 9, group_member_limit: 100, live_voter_limit: 1_000 },
    { id: "big", name: "Big", monthly_price: 90, group_member_limit: 1_000, live_voter_limit: 10_000 },
    { id: "unlimited", name: "Unlimited", monthly_price: 900, group_member_limit: null, live_voter_limit: null },
  ]);
}
