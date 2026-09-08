import { createHash } from "node:crypto";

export type IrvBallot = readonly string[];
export type IrvTally = Record<string, number>;

export type IrvRound = {
  number: number;
  activeCandidates: string[];
  tallies: IrvTally;
  eliminatedCandidates: string[];
};

export type TieBreakEvent = {
  round: number;
  candidates: string[];
  resolution: "historical_lookback" | "batch_elimination" | "deterministic_fallback";
  seed?: string;
  message: string;
};

export type ElectionHistory = {
  rounds: IrvRound[];
  seed: string;
  auditLog: TieBreakEvent[];
};

export type TieResolution = {
  eliminatedCandidates: string[];
  resolution: TieBreakEvent["resolution"];
};

export type IrvResult = {
  winner: string | null;
  rounds: IrvRound[];
  auditLog: TieBreakEvent[];
  seed: string;
};

const tallyBallots = ({ activeCandidates, ballots, candidates }: { activeCandidates: Set<string>; ballots: readonly IrvBallot[]; candidates: readonly string[] }): IrvTally => {
  const tallies = Object.fromEntries(candidates.map((candidate) => [candidate, 0]));
  for (const ballot of ballots) {
    const preference = ballot.find((candidate) => activeCandidates.has(candidate));
    if (preference) tallies[preference] += 1;
  }
  return tallies;
};

const createSeed = ({ ballots, candidates, electionId }: { ballots: readonly IrvBallot[]; candidates: readonly string[]; electionId?: string }) => {
  const dataset = JSON.stringify({ ballots, candidates: [...candidates].sort(), electionId: electionId ?? null });
  const result = createHash("sha256").update(dataset).digest("hex");
  return result;
};

const seededIndex = ({ candidates, seed }: { candidates: readonly string[]; seed: string }) => {
  let state = Number.parseInt(createHash("sha256").update(seed).digest("hex").slice(0, 8), 16);
  state = (state + 0x6d2b79f5) | 0;
  let random = Math.imul(state ^ (state >>> 15), 1 | state);
  random = (random + Math.imul(random ^ (random >>> 7), 61 | random)) ^ random;
  const normalizedRandom = ((random ^ (random >>> 14)) >>> 0) / 2 ** 32;
  const result = Math.floor(normalizedRandom * candidates.length);
  return result;
};

export const resolve_tie = (tied_candidates: readonly string[], current_round: IrvRound, election_history: ElectionHistory): TieResolution => {
  if (tied_candidates.length < 2) throw new Error("A tie requires at least two candidates");
  const tiedCandidates = [...new Set(tied_candidates)].sort();
  let unresolvedCandidates = tiedCandidates;

  for (let index = election_history.rounds.length - 2; index >= 0; index -= 1) {
    const precedingRound = election_history.rounds[index];
    const fewestVotes = Math.min(...unresolvedCandidates.map((candidate) => precedingRound.tallies[candidate]));
    unresolvedCandidates = unresolvedCandidates.filter((candidate) => precedingRound.tallies[candidate] === fewestVotes);
    if (unresolvedCandidates.length === 1) {
      const eliminatedCandidates = unresolvedCandidates;
      election_history.auditLog.push({
        round: current_round.number,
        candidates: tiedCandidates,
        resolution: "historical_lookback",
        message: `Historical tie-break eliminated ${eliminatedCandidates[0]} using round ${precedingRound.number} tallies.`,
      });
      return { eliminatedCandidates, resolution: "historical_lookback" };
    }
  }

  const lowestVotes = current_round.tallies[tiedCandidates[0]];
  const votesAboveTie = current_round.activeCandidates.filter((candidate) => current_round.tallies[candidate] > lowestVotes).map((candidate) => current_round.tallies[candidate]);
  const directlyAboveVotes = votesAboveTie.length === 0 ? null : Math.min(...votesAboveTie);
  const combinedTiedVotes = tiedCandidates.reduce((total, candidate) => total + current_round.tallies[candidate], 0);
  if (directlyAboveVotes !== null && combinedTiedVotes < directlyAboveVotes) {
    election_history.auditLog.push({
      round: current_round.number,
      candidates: tiedCandidates,
      resolution: "batch_elimination",
      message: `Batch elimination removed ${tiedCandidates.join(", ")}; their combined ${combinedTiedVotes} votes are below ${directlyAboveVotes}.`,
    });
    return { eliminatedCandidates: tiedCandidates, resolution: "batch_elimination" };
  }

  const eliminatedCandidates = [tiedCandidates[seededIndex({ candidates: tiedCandidates, seed: election_history.seed })]];
  election_history.auditLog.push({
    round: current_round.number,
    candidates: tiedCandidates,
    resolution: "deterministic_fallback",
    seed: election_history.seed,
    message: `Deterministic tie-break applied using Seed ${election_history.seed} between ${tiedCandidates.join(", ")}; eliminated ${eliminatedCandidates[0]}.`,
  });
  return { eliminatedCandidates, resolution: "deterministic_fallback" };
};

export const countIrv = ({ ballots, candidates, electionId }: { ballots: readonly IrvBallot[]; candidates: readonly string[]; electionId?: string }): IrvResult => {
  const uniqueCandidates = [...new Set(candidates)].sort();
  if (uniqueCandidates.length < 2) throw new Error("IRV requires at least two candidates");
  if (ballots.some((ballot) => ballot.some((candidate) => !uniqueCandidates.includes(candidate)) || new Set(ballot).size !== ballot.length))
    throw new Error("Ballots must contain unique known candidates");

  const history: ElectionHistory = { rounds: [], seed: createSeed({ ballots, candidates: uniqueCandidates, electionId }), auditLog: [] };
  const activeCandidates = new Set(uniqueCandidates);
  let roundNumber = 1;

  while (activeCandidates.size > 1) {
    const tallies = tallyBallots({ activeCandidates, ballots, candidates: uniqueCandidates });
    const round: IrvRound = { number: roundNumber, activeCandidates: [...activeCandidates].sort(), tallies, eliminatedCandidates: [] };
    history.rounds.push(round);
    const activeVotes = round.activeCandidates.reduce((total, candidate) => total + tallies[candidate], 0);
    const majorityWinner = round.activeCandidates.find((candidate) => tallies[candidate] * 2 > activeVotes);
    if (majorityWinner) return { winner: majorityWinner, rounds: history.rounds, auditLog: history.auditLog, seed: history.seed };

    const lowestVotes = Math.min(...round.activeCandidates.map((candidate) => tallies[candidate]));
    const tiedCandidates = round.activeCandidates.filter((candidate) => tallies[candidate] === lowestVotes);
    const resolution =
      tiedCandidates.length === 1 ? { eliminatedCandidates: tiedCandidates, resolution: "historical_lookback" as const } : resolve_tie(tiedCandidates, round, history);
    round.eliminatedCandidates = resolution.eliminatedCandidates;
    for (const candidate of resolution.eliminatedCandidates) activeCandidates.delete(candidate);
    roundNumber += 1;
  }

  const winner = [...activeCandidates][0] ?? null;
  return { winner, rounds: history.rounds, auditLog: history.auditLog, seed: history.seed };
};
