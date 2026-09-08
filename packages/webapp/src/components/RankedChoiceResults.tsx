export const RankedChoiceResults = () => {
  return (
    <>
      <div className="rounded-app bg-app-info p-4 text-app-text">
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
      <p className="mt-1 text-app-text-muted">First, second, and third preferences are shown in the demographic charts.</p>
    </>
  );
};
