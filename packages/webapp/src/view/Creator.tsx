import React from "react";
import { PollCard } from "#webapp/components/PollCard.tsx";
import { usePolls } from "#webapp/hooks/usePolls.ts";
import { memberCanAccess } from "#webapp/lib/groups.ts";

export const Creator = () => {
  const { data: polls = [] } = usePolls();
  const [pollTab, setPollTab] = React.useState<"open" | "closed">("open");
  const visiblePolls = polls.filter((poll) => (pollTab === "open" ? memberCanAccess(poll) && poll.id !== "partner-review" : poll.id === "school-meals"));
  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-7">
      <p className="font-bold text-blue-700 tracking-wider">CREATOR</p>
      <h1 className="mt-1 font-bold">Elena R.</h1>
      <div className="mt-7 flex border-slate-200 border-b">
        <button
          className={`px-4 py-2 font-bold ${pollTab === "open" ? "border-blue-600 border-b-2 text-blue-700" : "text-slate-500"}`}
          onClick={() => setPollTab("open")}
          type="button"
        >
          Open polls
        </button>
        <button
          className={`px-4 py-2 font-bold ${pollTab === "closed" ? "border-blue-600 border-b-2 text-blue-700" : "text-slate-500"}`}
          onClick={() => setPollTab("closed")}
          type="button"
        >
          Closed polls
        </button>
      </div>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {visiblePolls.map((poll) => (
          <PollCard key={poll.id} poll={poll} />
        ))}
      </div>
    </main>
  );
};
