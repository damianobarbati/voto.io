import type { RankedAlgorithm } from "#webapp/lib/polls.ts";

type RankedChoiceResultsProps = { algorithm: RankedAlgorithm };

export const RankedChoiceResults = ({ algorithm }: RankedChoiceResultsProps) => {
  if (algorithm === "borda") {
    return (
      <>
        <h2 className="font-bold">Final ranking</h2>
        <ol className="mt-5 space-y-2">
          {[
            ["Extend route N6", 1371],
            ["Add an airport connection", 1028],
            ["Increase frequency on route N15", 847],
          ].map(([option, points], index) => (
            <li className="flex justify-between border-slate-100 border-b pb-2" key={option}>
              <span>
                {index + 1}. {option}
              </span>
              <strong>{points} Borda points</strong>
            </li>
          ))}
        </ol>
      </>
    );
  }
  return (
    <>
      <div className="rounded-app bg-blue-50 p-4 text-blue-950">
        <p className="font-bold">Winner: Extend route N6</p>
        <p className="mt-1">52.4% after round 3</p>
      </div>
      <h2 className="mt-5 font-bold">Instant-runoff rounds</h2>
      <div className="mt-3 space-y-2">
        <p>Round 1: Increase frequency on route N15 eliminated.</p>
        <p>Round 2: Add an airport connection eliminated.</p>
        <p>Round 3: Extend route N6 reached a majority.</p>
      </div>
      <h3 className="mt-5 font-bold">Preference distribution by rank</h3>
      <p className="mt-1 text-slate-600">First, second, and third preferences are shown in the demographic charts.</p>
    </>
  );
};
