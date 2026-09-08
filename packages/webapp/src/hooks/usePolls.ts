import useSWR from "swr";
import { PollSchema } from "types/Poll.ts";
import { apiUrl } from "#webapp/env.ts";
import { type Poll, toPoll } from "#webapp/lib/polls.ts";

const getPolls = async (): Promise<Poll[]> => {
  const response = await fetch(`${apiUrl}/polls`);
  if (!response.ok) throw new Error("Unable to retrieve polls");
  const body = await response.json();
  const result = PollSchema.array().parse(body).map(toPoll);
  return result;
};

export const usePolls = () => useSWR(`${apiUrl}/polls`, getPolls);
