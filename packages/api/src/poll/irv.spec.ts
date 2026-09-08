import { describe, expect, it } from "vitest";
import { countIrv, type ElectionHistory, type IrvRound, resolve_tie } from "#api/poll/irv.ts";

const round = ({ number, tallies }: { number: number; tallies: Record<string, number> }): IrvRound => ({
  number,
  activeCandidates: Object.keys(tallies),
  tallies,
  eliminatedCandidates: [],
});

const history = (rounds: IrvRound[]): ElectionHistory => ({ rounds, seed: "test-seed", auditLog: [] });

describe("countIrv", () => {
  it("uses the preceding round to resolve an elimination tie", () => {
    const currentRound = round({ number: 2, tallies: { A: 8, B: 2, C: 2 } });
    const electionHistory = history([round({ number: 1, tallies: { A: 6, B: 1, C: 3 } }), currentRound]);
    const result = resolve_tie(["B", "C"], currentRound, electionHistory);

    expect(result).toMatchObject({ eliminatedCandidates: ["B"], resolution: "historical_lookback" });
  });

  it("uses round one first-preference votes when no later round distinguishes the tie", () => {
    const currentRound = round({ number: 3, tallies: { A: 8, B: 2, C: 2 } });
    const electionHistory = history([round({ number: 1, tallies: { A: 5, B: 1, C: 2 } }), round({ number: 2, tallies: { A: 7, B: 3, C: 3 } }), currentRound]);
    const result = resolve_tie(["B", "C"], currentRound, electionHistory);

    expect(result.eliminatedCandidates).toEqual(["B"]);
    expect(electionHistory.auditLog[0]).toMatchObject({ resolution: "historical_lookback", message: expect.stringContaining("round 1") });
  });

  it("batch eliminates tied candidates below the next candidate", () => {
    const currentRound = round({ number: 2, tallies: { A: 5, B: 3, C: 1, D: 1 } });
    const electionHistory = history([round({ number: 1, tallies: { A: 5, B: 3, C: 1, D: 1 } }), currentRound]);
    const result = resolve_tie(["C", "D"], currentRound, electionHistory);

    expect(result.eliminatedCandidates).toEqual(["C", "D"]);
    expect(electionHistory.auditLog[0]).toMatchObject({ resolution: "batch_elimination" });
  });

  it("uses a reproducible seed and logs the final-round fallback", () => {
    const input = {
      candidates: ["A", "B"],
      ballots: [
        ["A", "B"],
        ["B", "A"],
      ],
      electionId: "audit-election",
    };
    const firstResult = countIrv(input);
    const secondResult = countIrv(input);

    expect(firstResult).toMatchObject({ winner: secondResult.winner, seed: secondResult.seed });
    expect(firstResult.auditLog[0]).toMatchObject({
      resolution: "deterministic_fallback",
      seed: firstResult.seed,
      message: expect.stringContaining("Deterministic tie-break applied using Seed"),
    });
  });
});
