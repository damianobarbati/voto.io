import { results } from "#webapp/data/pollResults.ts";

export const ChoiceResults = () => (
  <>
    <h2 className="font-bold">Choices</h2>
    <div className="mt-5 space-y-4">
      {results.map((result) => (
        <div key={result.label}>
          <div className="flex justify-between">
            <span>{result.label}</span>
            <strong>
              {result.percentage}% · {result.votes}
            </strong>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-app bg-slate-100">
            <div className="h-full rounded-app bg-blue-600" style={{ width: `${result.percentage}%` }} />
          </div>
        </div>
      ))}
    </div>
  </>
);
