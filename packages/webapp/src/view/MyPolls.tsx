import React from "react";
import { EmptyTab } from "#webapp/components/EmptyTab.tsx";
import { PollCard } from "#webapp/components/PollCard.tsx";
import { usePolls } from "#webapp/hooks/usePolls.ts";

export const MyPolls = () => {
  const { data: polls = [] } = usePolls();
  const [pollTab, setPollTab] = React.useState<"created" | "voted">("created");
  const visiblePolls =
    pollTab === "created"
      ? polls.filter((poll) => poll.id === "board-priorities" || poll.id === "city-green")
      : polls.filter((poll) => poll.id === "night-buses" || poll.id === "school-meals");
  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-7">
      <h1 className="font-bold">Your polls</h1>
      <div className="mt-7 flex border-slate-200 border-b">
        <button
          className={`px-4 py-2 font-bold ${pollTab === "created" ? "border-blue-600 border-b-2 text-blue-700" : "text-slate-500"}`}
          onClick={() => setPollTab("created")}
          type="button"
        >
          Polls you created
        </button>
        <button
          className={`px-4 py-2 font-bold ${pollTab === "voted" ? "border-blue-600 border-b-2 text-blue-700" : "text-slate-500"}`}
          onClick={() => setPollTab("voted")}
          type="button"
        >
          Polls you voted
        </button>
      </div>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {visiblePolls.map((poll) => (
          <PollCard key={poll.id} poll={poll} />
        ))}
        {visiblePolls.length === 0 &&
          (pollTab === "created" ? (
            <EmptyTab action="Create poll" actionTo="/poll/new" message="You have not created any polls yet." />
          ) : (
            <EmptyTab action="Explore polls" actionTo="/poll/list" message="You have not voted on any polls yet." />
          ))}
      </div>
    </main>
  );
};
