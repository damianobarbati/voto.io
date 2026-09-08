import React from "react";
import { FiCheck, FiSmartphone, FiUsers } from "react-icons/fi";
import { useLocation, useParams } from "react-router-dom";
import useSWR from "swr";
import { PollSchema } from "types/Poll.ts";
import { LivePollDeviceGate } from "#webapp/components/LivePollDeviceGate.tsx";
import { apiUrl } from "#webapp/env.ts";
import { useViewportWidth } from "#webapp/hooks/useViewportWidth.ts";
import { Field } from "#webapp/ui/Field.tsx";
import { SelectField } from "#webapp/ui/SelectField.tsx";

const phoneMaximumWidth = 767;

type LiveVoterStep = "register" | "waiting" | "quota" | "voting" | "thanks";

const getLiveVoterStep = ({ value }: { value: string | null }): LiveVoterStep => {
  if (value === "waiting" || value === "quota" || value === "voting" || value === "thanks") return value;
  return "register";
};

export const LiveVoter = () => {
  const viewportWidth = useViewportWidth();
  const { search } = useLocation();
  const { id } = useParams();
  const [step, setStep] = React.useState<LiveVoterStep>(() => getLiveVoterStep({ value: new URLSearchParams(search).get("state") }));
  const [choice, setChoice] = React.useState("");
  const [attendeeToken, setAttendeeToken] = React.useState("");
  const { data: livePoll } = useSWR(id ? `${apiUrl}/polls/${id}` : null, async (url: string) => PollSchema.parse(await (await fetch(url)).json()));
  if (viewportWidth > phoneMaximumWidth) return <LivePollDeviceGate message="Live poll participation works only on a phone." />;
  if (step === "register") {
    return (
      <main className="mx-auto min-h-[calc(100vh-58px)] max-w-[480px] bg-app-surface px-5 py-8">
        <FiSmartphone className="size-7.5 text-app-primary" />
        <h1 className="mt-5 font-bold">Join Elena Rossi's live poll</h1>
        <p className="mt-2 text-app-text-muted">Provide details to confirm eligibility.</p>
        <form
          className="mt-6 grid gap-4"
          onSubmit={async (event) => {
            event.preventDefault();
            if (!id) return;
            const response = await fetch(`${apiUrl}/live-polls/${id}/attendees`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) });
            if (!response.ok) return;
            const attendee = (await response.json()) as { token: string };
            setAttendeeToken(attendee.token);
            setStep("waiting");
          }}
        >
          <SelectField label="Gender" options={["Woman", "Man"]} />
          <Field label="Birth date" type="date" />
          <Field label="Gross annual income" type="number" />
          <Field label="City" />
          <Field label="Country" />
          <button className="rounded-app bg-app-primary px-5 py-3 font-bold text-app-inverse" type="submit">
            Continue
          </button>
        </form>
      </main>
    );
  }
  if (step === "waiting") {
    return (
      <main className="mx-auto flex min-h-[calc(100vh-58px)] max-w-[480px] flex-col items-center justify-center bg-app-surface px-5 text-center">
        <svg aria-label="Waiting for the poll to open" className="size-28 animate-pulse text-app-primary" viewBox="0 0 100 100">
          <circle cx="50" cy="50" fill="none" r="38" stroke="currentColor" strokeWidth="8" />
          <path d="M50 25v27l18 11" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="8" />
        </svg>
        <h1 className="mt-6 font-bold">Waiting for the poll</h1>
        <p className="mt-2 text-app-text-muted">The creator will open it soon.</p>
        <button className="mt-6 font-bold text-app-primary" onClick={() => setStep("voting")} type="button">
          Poll is open
        </button>
      </main>
    );
  }
  if (step === "quota") {
    return (
      <main className="mx-auto flex min-h-screen max-w-[480px] flex-col items-center justify-center bg-app-surface px-5 text-center">
        <FiUsers className="size-16 text-app-warning" />
        <h1 className="mt-5 font-bold">Audience limit reached</h1>
        <p className="mt-2 font-semibold text-app-warning">Waiting the creator to increase the poll audience...</p>
      </main>
    );
  }
  if (step === "thanks")
    return (
      <main className="mx-auto flex min-h-[calc(100vh-58px)] max-w-[480px] flex-col items-center justify-center bg-app-surface px-5 text-center">
        <FiCheck className="size-16 text-app-success" />
        <h1 className="mt-5 font-bold">Thank you</h1>
        <p className="mt-2 text-app-text-muted">Your vote was recorded.</p>
      </main>
    );
  return (
    <main className="mx-auto min-h-[calc(100vh-58px)] max-w-[480px] bg-app-surface px-5 py-8">
      <p className="font-bold text-app-primary tracking-wider">LIVE POLL</p>
      <h1 className="mt-2 font-bold">{livePoll?.name ?? "Loading poll"}</h1>
      <div className="mt-7 space-y-3">
        {(livePoll?.options ?? []).map((option) => (
          <label className="flex cursor-pointer items-center gap-3 rounded-app border border-app-border p-4 has-checked:border-app-primary has-checked:bg-app-info" key={option.id}>
            <input checked={choice === option.id} name="live-vote" onChange={() => setChoice(option.id)} type="radio" />
            {option.name}
          </label>
        ))}
      </div>
      <button
        className="mt-7 w-full rounded-app bg-app-primary px-5 py-3 font-bold text-app-inverse disabled:bg-app-disabled"
        disabled={!choice}
        onClick={async () => {
          if (!id) return;
          const response = await fetch(`${apiUrl}/live-polls/${id}/votes`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "x-live-attendee-token": attendeeToken },
            body: JSON.stringify({ option_ids: [choice] }),
          });
          if (response.ok) setStep("thanks");
        }}
        type="button"
      >
        Submit vote
      </button>
    </main>
  );
};
