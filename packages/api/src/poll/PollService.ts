import { HTTPException } from "hono/http-exception";
import {
  type LivePollAttendee,
  type LivePollCreateRequest,
  type Poll,
  type PollCreateRequest,
  type PollResults,
  PollResultsSchema,
  type PollRow,
  PollSchema,
  type PollVoteRequest,
} from "types/Poll.ts";
import type { UserRow } from "types/User.ts";
import PollOptionRepository from "#api/poll/PollOptionRepository.ts";
import PollRepository from "#api/poll/PollRepository.ts";
import database from "#api-database/database.ts";

const POLL_NOT_FOUND_ERROR = "Poll not found";
const POLL_NOT_OPEN_ERROR = "Poll is not open for voting";
const POLL_ACCESS_DENIED_ERROR = "You are not eligible to vote on this poll";
const INVALID_BALLOT_ERROR = "The ballot does not match the poll voting method";
const ALREADY_VOTED_ERROR = "You have already voted on this poll";

const hasMatchingDemographics = ({ poll, user }: { poll: PollRow; user: UserRow }) => {
  const birthDate = new Date(user.birth_date);
  const age =
    new Date().getUTCFullYear() -
    birthDate.getUTCFullYear() -
    Number(new Date().getUTCMonth() < birthDate.getUTCMonth() || (new Date().getUTCMonth() === birthDate.getUTCMonth() && new Date().getUTCDate() < birthDate.getUTCDate()));
  return (
    (!poll.gender_restriction || user.gender === poll.gender_restriction) &&
    (poll.age_min === null || age >= poll.age_min) &&
    (poll.age_max === null || age <= poll.age_max) &&
    (poll.gross_income_min === null || (user.income !== null && user.income >= poll.gross_income_min)) &&
    (poll.gross_income_max === null || (user.income !== null && user.income <= poll.gross_income_max)) &&
    (poll.cities.length === 0 || (user.city !== null && poll.cities.includes(user.city))) &&
    (poll.countries.length === 0 || (user.country !== null && poll.countries.includes(user.country)))
  );
};

export default class PollService {
  static async createLive({ creatorId, poll }: { creatorId: string; poll: LivePollCreateRequest }): Promise<Poll> {
    const now = new Date();
    const result = await PollService.create({
      creatorId,
      poll: {
        ...poll,
        description: "",
        opens_at: new Date(now.getTime() + 86_400_000).toISOString(),
        closes_at: new Date(now.getTime() + 7 * 86_400_000).toISOString(),
        type: "single_choice",
        ranked_method: null,
        gender_restriction: null,
        age_min: null,
        age_max: null,
        gross_income_min: null,
        gross_income_max: null,
        cities: [],
        countries: [],
        group_id: null,
        is_live: true,
      },
    });
    return result;
  }

  static async openLive({ creatorId, pollId }: { creatorId: string; pollId: string }): Promise<Poll> {
    const poll = await PollRepository.findBy({ id: pollId, creator_id: creatorId }, true);
    if (!poll || !poll.is_live) throw new HTTPException(404, { message: POLL_NOT_FOUND_ERROR });
    await database("polls")
      .where({ id: pollId })
      .update({ opens_at: new Date().toISOString(), closes_at: new Date(Date.now() + 3_600_000).toISOString() });
    const result = await PollService.get({ pollId });
    return result;
  }

  static async joinLive({ pollId, token }: { pollId: string; token?: string }): Promise<LivePollAttendee> {
    const poll = await PollRepository.findBy({ id: pollId }, true);
    if (!poll || !poll.is_live) throw new HTTPException(404, { message: POLL_NOT_FOUND_ERROR });
    const existing = token ? await database("live_poll_attendees").where({ poll_id: pollId, token }).first() : undefined;
    if (existing) {
      await database("live_poll_attendees").where({ id: existing.id }).update({ last_seen_at: new Date().toISOString() });
      const result = { id: existing.id, token: existing.token, poll_id: pollId };
      return result;
    }
    const [attendee] = await database("live_poll_attendees").insert({ poll_id: pollId }).returning(["id", "token", "poll_id"]);
    const result = attendee as LivePollAttendee;
    return result;
  }

  static async voteLive({ pollId, attendeeToken, ballot }: { pollId: string; attendeeToken: string; ballot: PollVoteRequest }): Promise<void> {
    const attendee = await database("live_poll_attendees").where({ poll_id: pollId, token: attendeeToken }).first();
    if (!attendee) throw new HTTPException(401, { message: POLL_ACCESS_DENIED_ERROR });
    const poll = await PollRepository.findBy({ id: pollId }, true);
    if (!poll || !poll.is_live || new Date(poll.opens_at) > new Date() || poll.closed_at) throw new HTTPException(422, { message: POLL_NOT_OPEN_ERROR });
    const [vote] = await database("poll_votes").insert({ poll_id: pollId, live_poll_attendee_id: attendee.id }).returning("*");
    await database("poll_vote_options").insert(ballot.option_ids.map((option_id) => ({ vote_id: vote.id, poll_id: pollId, option_id, rank: 1 })));
  }

  static async get({ pollId }: { pollId: string }): Promise<Poll> {
    const poll = await PollRepository.findBy({ id: pollId }, true);
    if (!poll) throw new HTTPException(404, { message: POLL_NOT_FOUND_ERROR });
    const options = await PollOptionRepository.getem({ poll_id: pollId }, true);
    const result = PollSchema.parse({ ...poll, options });
    return result;
  }

  static async list(): Promise<Poll[]> {
    const pollRows = await PollRepository.getem({}, true);
    const optionRows = await PollOptionRepository.getem({}, true);
    const optionsByPollId = Map.groupBy(optionRows, ({ poll_id }) => poll_id);
    const result = PollSchema.array().parse(
      pollRows.map((poll) => ({
        ...poll,
        options: optionsByPollId.get(poll.id) ?? [],
      })),
    );
    return result;
  }

  static async create({ creatorId, poll }: { creatorId: string; poll: PollCreateRequest }): Promise<Poll> {
    if (new Date(poll.closes_at) <= new Date(poll.opens_at)) throw new HTTPException(422, { message: "Closing time must be after opening time" });
    if ((poll.type === "ranked_choice") !== (poll.ranked_method !== null)) throw new HTTPException(422, { message: "Ranked polls require a ranked method" });
    if (new Set(poll.options).size !== poll.options.length) throw new HTTPException(422, { message: "Poll options must be unique" });

    const result = await database.transaction(async (transaction) => {
      if (poll.group_id) {
        const group = await transaction("groups").where({ id: poll.group_id, owner_id: creatorId }).first();
        if (!group) throw new HTTPException(403, { message: "Only the group owner can create a private poll" });
      }
      const { options: optionNames, ...pollInput } = poll;
      const [pollRow] = await transaction("polls")
        .insert({ ...pollInput, creator_id: creatorId })
        .returning("*");
      const optionRows = optionNames.map((name, index) => ({ poll_id: pollRow.id, name, position: index + 1, is_no_suitable_option: false }));
      if (poll.type !== "ranked_choice") optionRows.push({ poll_id: pollRow.id, name: "No suitable option.", position: optionRows.length + 1, is_no_suitable_option: true });
      const options = await transaction("poll_options").insert(optionRows).returning("*");
      return PollSchema.parse({ ...pollRow, options });
    });
    return result;
  }

  static async vote({ pollId, userId, ballot }: { pollId: string; userId: string; ballot: PollVoteRequest }): Promise<void> {
    await database.transaction(async (transaction) => {
      const poll = (await transaction("polls").where({ id: pollId }).first()) as PollRow | undefined;
      if (!poll) throw new HTTPException(404, { message: POLL_NOT_FOUND_ERROR });
      const now = new Date();
      if (new Date(poll.opens_at) > now || new Date(poll.closes_at) <= now || poll.closed_at) throw new HTTPException(422, { message: POLL_NOT_OPEN_ERROR });
      const user = (await transaction("users").where({ id: userId }).first()) as UserRow | undefined;
      const membership = poll.group_id ? await transaction("group_members").where({ group_id: poll.group_id, user_id: userId }).first() : true;
      if (!user || !membership || !hasMatchingDemographics({ poll, user })) throw new HTTPException(403, { message: POLL_ACCESS_DENIED_ERROR });
      const previousVote = await transaction("poll_votes").where({ poll_id: pollId, user_id: userId }).first();
      if (previousVote) throw new HTTPException(409, { message: ALREADY_VOTED_ERROR });
      const options = await transaction("poll_options").where({ poll_id: pollId }).orderBy("position");
      const validIds = new Set(options.map((option) => option.id));
      const isValidOptionSet = ballot.option_ids.every((optionId) => validIds.has(optionId)) && new Set(ballot.option_ids).size === ballot.option_ids.length;
      const hasValidCount =
        poll.type === "single_choice"
          ? ballot.option_ids.length === 1
          : poll.type === "multiple_choice"
            ? ballot.option_ids.length >= 1
            : ballot.option_ids.length === options.length;
      const noSuitableOption = options.find((option) => option.is_no_suitable_option);
      const selectsNoSuitableOptionWithAnotherOption = noSuitableOption && ballot.option_ids.includes(noSuitableOption.id) && ballot.option_ids.length > 1;
      if (!isValidOptionSet || !hasValidCount || selectsNoSuitableOptionWithAnotherOption) throw new HTTPException(422, { message: INVALID_BALLOT_ERROR });
      const [vote] = await transaction("poll_votes").insert({ poll_id: pollId, user_id: userId }).returning("*");
      await transaction("poll_vote_options").insert(
        ballot.option_ids.map((option_id, index) => ({ vote_id: vote.id, poll_id: pollId, option_id, rank: poll.type === "multiple_choice" ? null : index + 1 })),
      );
    });
  }

  static async results({ pollId }: { pollId: string }): Promise<PollResults> {
    const poll = (await database("polls").where({ id: pollId }).first()) as PollRow | undefined;
    if (!poll) throw new HTTPException(404, { message: POLL_NOT_FOUND_ERROR });
    const [users, members, votes, rowsUnsafe] = await Promise.all([
      database<UserRow>("users").select("*"),
      poll.group_id ? database("group_members").where({ group_id: poll.group_id }).select("user_id") : Promise.resolve([]),
      database("poll_votes").where({ poll_id: pollId }).count<{ count: string }[]>({ count: "*" }).first(),
      database("poll_options as option")
        .leftJoin("poll_vote_options as selection", "option.id", "selection.option_id")
        .where("option.poll_id", pollId)
        .groupBy("option.id")
        .select("option.id", "option.name", "option.position", "option.is_no_suitable_option")
        .count<{ votes: string }>("selection.vote_id as votes")
        .orderBy("votes", "desc")
        .orderBy("option.position"),
    ]);
    const rows = rowsUnsafe as unknown as { id: string; name: string; position: number; is_no_suitable_option: boolean; votes: string }[];
    const memberIds = new Set(members.map((member) => member.user_id));
    const eligibleVoters = users.filter((user) => (!poll.group_id || memberIds.has(user.id)) && hasMatchingDemographics({ poll, user })).length;
    const votesCast = Number(votes?.count ?? 0);
    const selectionCount = rows.reduce((total, row) => total + Number(row.votes), 0);
    const abstentionVotes = rows.find((row) => row.is_no_suitable_option)?.votes ?? 0;
    const result = PollResultsSchema.parse({
      poll_id: pollId,
      eligible_voters: eligibleVoters,
      votes_cast: votesCast,
      turnout_percentage: eligibleVoters === 0 ? 0 : (votesCast / eligibleVoters) * 100,
      abstention_percentage: votesCast === 0 ? 0 : (Number(abstentionVotes) / votesCast) * 100,
      options: rows.map((row) => ({
        option_id: row.id,
        name: row.name,
        votes: Number(row.votes),
        voter_percentage: votesCast === 0 ? 0 : (Number(row.votes) / votesCast) * 100,
        selection_percentage: selectionCount === 0 ? 0 : (Number(row.votes) / selectionCount) * 100,
      })),
    });
    return result;
  }
}
