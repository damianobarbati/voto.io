import { DragDropProvider } from "@dnd-kit/react";
import React from "react";
import { FiCheck } from "react-icons/fi";
import { useParams } from "react-router-dom";
import { mutate } from "swr";
import { AccessDenied } from "#webapp/components/AccessDenied.tsx";
import { LocalizedLink as Link } from "#webapp/components/LocalizedLink.tsx";
import { LockBadge } from "#webapp/components/LockBadge.tsx";
import { RankedOption } from "#webapp/components/RankedOption.tsx";
import { apiUrl } from "#webapp/env.ts";
import { usePolls } from "#webapp/hooks/usePolls.ts";
import { groupFor, memberCanAccess } from "#webapp/lib/groups.ts";
import { jwtStorageKey } from "#webapp/store.ts";
import { Spinner } from "#webapp/ui/Spinner.tsx";

export const PollDetail = () => {
  const { id } = useParams();
  const { data: polls } = usePolls();
  if (!polls) return <Spinner />;
  const poll = polls.find((item) => item.id === id);
  if (!poll) return <main className="mx-auto max-w-4xl px-4 py-8 sm:px-7">Poll not found.</main>;
  const group = groupFor(poll.groupId);
  const [single, setSingle] = React.useState(poll.options[0]);
  const [many, setMany] = React.useState<string[]>([]);
  const [ranked, setRanked] = React.useState(poll.options);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState("");
  const [isSubmitted, setIsSubmitted] = React.useState(false);
  if (group && !memberCanAccess(poll)) return <AccessDenied group={group} />;
  const move = ({ source, target }: { source: string; target: string }) => {
    if (!source || source === target) return;
    const next = ranked.filter((option) => option !== source);
    next.splice(next.indexOf(target), 0, source);
    setRanked(next);
  };
  const submitVote = async () => {
    const token = localStorage.getItem(jwtStorageKey);
    if (!token) {
      setSubmitError("Log in to submit your vote.");
      return;
    }
    const choices = poll.votingMethod === "One choice" ? [single] : poll.votingMethod === "Multiple choice" ? many : ranked;
    const optionIds = choices.map((choice) => poll.optionIds[poll.options.indexOf(choice)]).filter((optionId): optionId is string => Boolean(optionId));
    if (optionIds.length === 0) {
      setSubmitError("Select at least one option.");
      return;
    }
    setIsSubmitting(true);
    setSubmitError("");
    try {
      const response = await fetch(`${apiUrl}/polls/${poll.id}/votes`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ option_ids: optionIds }),
      });
      if (!response.ok) {
        let body: { message?: string } | null = null;
        try {
          body = (await response.json()) as { message?: string };
        } catch {}
        throw new Error(body?.message ?? "Unable to submit your vote.");
      }
      setIsSubmitted(true);
      await mutate(`${apiUrl}/polls`);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Unable to submit your vote.");
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <main className="mx-auto max-w-4xl px-4 py-8 sm:px-7">
      <Link className="font-bold text-slate-500" to="/poll/list">
        ← Back to polls
      </Link>
      <div className="mt-5 grid gap-6 lg:grid-cols-[1fr_270px]">
        <section>
          {group && <LockBadge group={group} />}
          <h1 className="mt-4 font-bold">{poll.title}</h1>
          <p className="mt-3 text-slate-600">{poll.description}</p>
          <div className="mt-6 rounded-app border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-2 font-bold">
              <FiCheck className="text-blue-600" />{" "}
              {poll.votingMethod === "One choice" ? "Choose one option" : poll.votingMethod === "Multiple choice" ? "Choose all that apply" : "Rank options by preference"}
            </div>
            <div className="mt-4 space-y-3">
              {poll.votingMethod === "One choice" &&
                poll.options.map((option) => (
                  <label className="flex cursor-pointer items-center gap-3 rounded-app border border-slate-200 p-3 has-checked:border-blue-600 has-checked:bg-blue-50" key={option}>
                    <input checked={single === option} name="vote" onChange={() => setSingle(option)} type="radio" />
                    {option}
                  </label>
                ))}
              {poll.votingMethod === "Multiple choice" &&
                poll.options.map((option) => (
                  <label className="flex cursor-pointer items-center gap-3 rounded-app border border-slate-200 p-3 has-checked:border-blue-600 has-checked:bg-blue-50" key={option}>
                    <input
                      checked={many.includes(option)}
                      onChange={() => {
                        const isNoSuitableOption = option === "No suitable option.";
                        if (isNoSuitableOption) {
                          setMany(many.includes(option) ? [] : [option]);
                          return;
                        }
                        const selectedOptions = many.filter((item) => item !== "No suitable option.");
                        setMany(many.includes(option) ? selectedOptions.filter((item) => item !== option) : [...selectedOptions, option]);
                      }}
                      type="checkbox"
                    />
                    {option}
                  </label>
                ))}
              {poll.votingMethod === "Ranked choice" && (
                <DragDropProvider
                  onDragEnd={({ canceled, operation }) => {
                    const source = operation.source?.id;
                    const target = operation.target?.id;
                    if (!canceled && typeof source === "string" && typeof target === "string") move({ source, target });
                  }}
                >
                  {ranked.map((option, index) => (
                    <RankedOption index={index} key={option} onMove={move} option={option} options={ranked} />
                  ))}
                </DragDropProvider>
              )}
            </div>
            <div className="mt-5 flex gap-3">
              <button
                className="rounded-app bg-blue-700 px-5 py-3 font-bold text-white disabled:cursor-not-allowed disabled:bg-slate-400"
                disabled={isSubmitting || isSubmitted}
                onClick={submitVote}
                type="button"
              >
                Submit vote
              </button>
              <Link className="rounded-app border border-slate-300 px-5 py-3 font-bold text-slate-800 no-underline" to={`/poll/${poll.id}/stats`}>
                See results
              </Link>
            </div>
            {isSubmitted && <p className="mt-3 font-semibold text-emerald-700">Your vote was submitted.</p>}
            {submitError && <p className="mt-3 font-semibold text-red-700">{submitError}</p>}
          </div>
        </section>
        <aside className="rounded-app bg-slate-100 p-5">
          <h2 className="font-bold">Poll facts</h2>
          <dl className="mt-4 space-y-4">
            <div>
              <dt className="text-slate-500">Status</dt>
              <dd className="font-bold text-blue-700">Open for voting</dd>
            </div>
            <div>
              <dt className="text-slate-500">Closes</dt>
              <dd className="font-bold">In {poll.closes}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Eligibility</dt>
              <dd className="font-bold">Verified demographic match{group ? " and active group member" : ""}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Votes so far</dt>
              <dd className="font-bold">{poll.votes.toLocaleString()}</dd>
            </div>
          </dl>
        </aside>
      </div>
    </main>
  );
};
