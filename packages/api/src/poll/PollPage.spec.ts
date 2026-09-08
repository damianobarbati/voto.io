import { PollPageResponseSchema } from "types/Poll.ts";
import { expect, it } from "vitest";
import { app } from "../index.ts";

it("paginates public polls in stable order and returns only their options", async () => {
  const response = await app.request("/polls/page?limit=2&sort=Closing%20time%3A%20soonest");
  expect(response.status).toBe(200);
  const first = PollPageResponseSchema.parse(await response.json());
  expect(first.polls).toHaveLength(2);
  expect(first.nextOffset).toBe(2);
  const nextResponse = await app.request("/polls/page?limit=2&offset=2&sort=Closing%20time%3A%20soonest");
  const second = PollPageResponseSchema.parse(await nextResponse.json());
  const polls = [...first.polls, ...second.polls];
  expect(new Set(polls.map((poll) => poll.id)).size).toBe(4);
  expect(polls.every((poll) => poll.group_id === null && poll.options.length > 0 && poll.options.every((option) => option.poll_id === poll.id))).toBe(true);
  expect(polls.map((poll) => poll.closes_at)).toEqual(polls.map((poll) => poll.closes_at).sort());
  const endResponse = await app.request(`/polls/page?offset=${first.total}`);
  expect(await endResponse.json()).toMatchObject({ polls: [], nextOffset: null, total: first.total });
});

it("filters before pagination and counts all matching polls", async () => {
  const response = await app.request("/polls/page?limit=1&group_ids=libertarians");
  const page = PollPageResponseSchema.parse(await response.json());
  expect(page.polls).toHaveLength(1);
  expect(page.polls[0].group_id).toBe("libertarians");
  const searchResponse = await app.request(`/polls/page?query=${encodeURIComponent(page.polls[0].name)}&group_ids=libertarians`);
  const search = PollPageResponseSchema.parse(await searchResponse.json());
  expect(search.polls.map((poll) => poll.id)).toContain(page.polls[0].id);
  expect(search.polls.every((poll) => poll.name.includes(page.polls[0].name))).toBe(true);
});

it.each(["limit=0", "limit=101", "offset=-1", "offset=1.5", "sort=invalid"])("rejects invalid pagination: %s", async (query) => {
  const response = await app.request(`/polls/page?${query}`);
  expect(response.status).toBe(400);
});
