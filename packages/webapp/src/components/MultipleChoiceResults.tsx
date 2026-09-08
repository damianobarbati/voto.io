const multipleChoiceResults = [
  { label: "Breakfast", votes: 302, voterPercentage: 68, selectionPercentage: 43 },
  { label: "Lunch", votes: 271, voterPercentage: 61, selectionPercentage: 39 },
  { label: "After-school snacks", votes: 129, voterPercentage: 29, selectionPercentage: 18 },
  { label: "No suitable option.", votes: 18, voterPercentage: 4, selectionPercentage: 0 },
];

export const MultipleChoiceResults = () => (
  <>
    <h2 className="font-bold">Choices</h2>
    <div className="mt-5 space-y-3">
      {multipleChoiceResults.map((result) => (
        <div className="grid gap-1 border-app-border-subtle border-b pb-3 sm:grid-cols-[1fr_auto_auto_auto] sm:gap-5" key={result.label}>
          <strong>{result.label}</strong>
          <span>{result.voterPercentage}% of voters</span>
          <span>{result.selectionPercentage}% of selections</span>
          <span>{result.votes} votes</span>
        </div>
      ))}
    </div>
  </>
);
