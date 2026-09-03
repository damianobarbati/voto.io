import { faker } from "@faker-js/faker";
import type { Knex } from "knex";

const pollCount = 100;

const createPollRows = ({ database }: { database: Knex }) => {
  faker.seed(20260831);
  const result = Array.from({ length: pollCount }, (_, index) => {
    const type = ["single_choice", "multiple_choice", "ranked_choice"][index % 3] as "single_choice" | "multiple_choice" | "ranked_choice";
    return {
      id: `poll-${index + 1}`,
      creator_id: index < 20 ? "user-jane" : "user-john",
      group_id: index < 20 ? "libertarians" : null,
      name: faker.lorem.words({ min: 3, max: 6 }),
      description: faker.lorem.sentence({ min: 8, max: 16 }),
      opens_at: database.raw("now() - interval '1 day'"),
      closes_at: database.raw(`now() + interval '${(index % 30) + 1} days'`),
      type,
      ranked_method: type === "ranked_choice" ? (index % 2 === 0 ? "irv" : "borda") : null,
    };
  });
  return result;
};

const createPollOptionRows = () => {
  const result = Array.from({ length: pollCount }, (_, pollIndex) => {
    const poll_id = `poll-${pollIndex + 1}`;
    const type = ["single_choice", "multiple_choice", "ranked_choice"][pollIndex % 3];
    const options = [
      { id: `${poll_id}-option-1`, poll_id, name: faker.lorem.words({ min: 2, max: 4 }), position: 1, is_no_suitable_option: false },
      { id: `${poll_id}-option-2`, poll_id, name: faker.lorem.words({ min: 2, max: 4 }), position: 2, is_no_suitable_option: false },
      { id: `${poll_id}-option-3`, poll_id, name: faker.lorem.words({ min: 2, max: 4 }), position: 3, is_no_suitable_option: false },
    ];
    if (type !== "ranked_choice") options.push({ id: `${poll_id}-option-4`, poll_id, name: "No suitable option.", position: 4, is_no_suitable_option: true });
    return options;
  }).flat();
  return result;
};

export async function seed(database: Knex): Promise<void> {
  await database("groups").insert({ id: "libertarians", owner_id: "user-jane", name: "Libertarians", description: "Libertarian political party" });
  await database("group_members").insert([
    { group_id: "libertarians", user_id: "user-jane", role: "owner" },
    { group_id: "libertarians", user_id: "user-ana", role: "member" },
  ]);

  const pollRows = createPollRows({ database });
  const pollOptionRows = createPollOptionRows();
  await database("polls").insert(pollRows);
  await database("poll_options").insert(pollOptionRows);
}
