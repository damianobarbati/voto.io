import type { Poll as ApiPoll } from "types/Poll.ts";
import { formatDate } from "#webapp/i18n.ts";

export type VotingMethod = "One choice" | "Multiple choice" | "Ranked choice";

export type Poll = {
  id: string;
  title: string;
  description: string;
  votingMethod: VotingMethod;
  options: string[];
  optionIds: string[];
  votes: number;
  eligible: number;
  authorName: string;
  closes: string;
  closesAt: string;
  groupId?: string;
};

export const pollTurnout = (poll: Poll) => (poll.eligible === 0 ? 0 : (poll.votes / poll.eligible) * 100);

const pollVotingMethod = (type: ApiPoll["type"]): VotingMethod => {
  if (type === "single_choice") return "One choice";
  if (type === "multiple_choice") return "Multiple choice";
  return "Ranked choice";
};

export const toPoll = (poll: ApiPoll): Poll => ({
  id: poll.id,
  title: poll.name,
  description: poll.description,
  votingMethod: pollVotingMethod(poll.type),
  options: poll.options.map((option) => option.name),
  optionIds: poll.options.map((option) => option.id),
  votes: 0,
  eligible: 0,
  authorName: poll.creator_id,
  closes: formatDate({ date: poll.closes_at }),
  closesAt: poll.closes_at,
  groupId: poll.group_id ?? undefined,
});
