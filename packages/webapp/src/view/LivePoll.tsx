import React from "react";
import { FiCheck, FiCopy } from "react-icons/fi";
import { useParams } from "react-router-dom";
import { type Poll as ApiPoll, PollSchema } from "types/Poll.ts";
import { LiveDemographicPanel } from "#webapp/components/LiveDemographicPanel.tsx";
import { LivePollDeviceGate } from "#webapp/components/LivePollDeviceGate.tsx";
import { LiveQr } from "#webapp/components/LiveQr.tsx";
import { LocalizedLink as Link } from "#webapp/components/LocalizedLink.tsx";
import { apiUrl } from "#webapp/env.ts";
import { desktopMinimumWidth, useViewportWidth } from "#webapp/hooks/useViewportWidth.ts";
import { i18n } from "#webapp/i18n.ts";
import { localizedPath } from "#webapp/language.ts";
import { jwtStorageKey } from "#webapp/store.ts";

export const LivePoll = () => {
  const { id } = useParams();
  const viewportWidth = useViewportWidth();
  const [status, setStatus] = React.useState<"setup" | "open" | "closed">("setup");
  const [question, setQuestion] = React.useState("Which policy should open the forum?");
  const [options, setOptions] = React.useState(["Housing access", "Local transport", "Climate action"]);
  const [livePoll, setLivePoll] = React.useState<ApiPoll | null>(null);
  const [isLinkCopied, setIsLinkCopied] = React.useState(false);
  const liveAudienceLimit = 100;
  const viewers = status === "setup" ? 27 : status === "open" ? 184 : 213;
  const voters = status === "setup" ? 0 : status === "open" ? 131 : 187;
  const overAudienceLimit = viewers > liveAudienceLimit;
  const addOption = () => setOptions([...options, ""]);
  const updateOption = ({ index, value }: { index: number; value: string }) => setOptions(options.map((option, optionIndex) => (optionIndex === index ? value : option)));
  const copyVoterLink = async () => {
    const voterLink = `${window.location.origin}${localizedPath({ path: `/live-poll/${livePoll?.id ?? id}/vote`, language: i18n.resolvedLanguage ?? "en" })}`;
    await navigator.clipboard.writeText(voterLink);
    setIsLinkCopied(true);
  };
  if (viewportWidth < desktopMinimumWidth) return <LivePollDeviceGate message="Live poll creation works only on a computer with a screen at least 1280px wide." />;
  return (
    <main className="mx-auto max-w-5xl px-4 py-6 sm:px-7">
      {id === "new" && (
        <Link className="inline-flex font-bold text-app-primary no-underline hover:text-app-text" to="/">
          Back to voto.io
        </Link>
      )}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-bold text-app-primary tracking-wider">LIVE POLL</p>
          <h1 className="mt-1 font-bold">City forum</h1>
        </div>
        <div className="text-center text-app-text-muted">
          <LiveQr />
          <p className="mt-2 font-bold">
            {viewers} / {liveAudienceLimit} live users
          </p>
          <button className="mt-2 inline-flex items-center gap-1 font-bold text-app-primary" onClick={copyVoterLink} type="button">
            {isLinkCopied ? <FiCheck /> : <FiCopy />}
            {isLinkCopied ? "Link copied" : "Copy link"}
          </button>
        </div>
      </div>
      {status === "setup" && (
        <form
          className="mt-7 max-w-3xl space-y-5 rounded-app border border-app-border bg-app-surface p-5 sm:p-7"
          onSubmit={async (event) => {
            event.preventDefault();
            const token = localStorage.getItem(jwtStorageKey);
            if (!token) return;
            const createdResponse = await fetch(`${apiUrl}/live-polls`, {
              method: "POST",
              headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
              body: JSON.stringify({ name: question, options }),
            });
            if (!createdResponse.ok) return;
            const created = PollSchema.parse(await createdResponse.json());
            const openedResponse = await fetch(`${apiUrl}/live-polls/${created.id}/open`, {
              method: "POST",
              headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
              body: JSON.stringify({}),
            });
            if (!openedResponse.ok) return;
            const opened = PollSchema.parse(await openedResponse.json());
            setLivePoll(opened);
            setStatus("open");
          }}
        >
          <label className="block font-semibold">
            Question
            <input className="mt-1.5 w-full rounded-app border border-app-border px-3 py-2.5 font-normal" onChange={(event) => setQuestion(event.target.value)} value={question} />
          </label>
          <div>
            <p className="font-bold">Options</p>
            <div className="mt-2 space-y-2">
              {options.map((option, index) => (
                <input
                  className="w-full rounded-app border border-app-border px-3 py-2.5"
                  key={`live-option-${index}`}
                  onChange={(event) => updateOption({ index, value: event.target.value })}
                  value={option}
                />
              ))}
            </div>
            {options.length < 5 && (
              <button className="mt-3 font-bold text-app-primary" onClick={addOption} type="button">
                + Add option
              </button>
            )}
          </div>
          <button className="rounded-app bg-app-primary px-5 py-3 font-bold text-app-inverse" type="submit">
            Open poll
          </button>
        </form>
      )}
      {status === "open" && (
        <section className="mt-7 max-w-3xl rounded-app border border-app-border bg-app-surface p-5 sm:p-7">
          <span className="rounded-app bg-app-success-subtle px-2.5 py-1 font-bold text-app-success">OPEN</span>
          <h2 className="mt-4 font-bold">{question}</h2>
          <div className="mt-6">
            <div className="flex justify-between font-bold">
              <span>Live participation</span>
              <span>
                {voters} / {viewers} voted
              </span>
            </div>
            <div className="mt-2 h-3 overflow-hidden rounded-app bg-app-subtle">
              <div className="h-full rounded-app bg-app-primary" style={{ width: `${(voters / viewers) * 100}%` }} />
            </div>
          </div>
          <button className="mt-7 rounded-app bg-app-text px-5 py-3 font-bold text-app-inverse" onClick={() => setStatus("closed")} type="button">
            Close poll
          </button>
          {overAudienceLimit && (
            <Link className="ml-3 inline-block rounded-app border border-app-primary px-5 py-3 font-bold text-app-primary no-underline" to="/my-subscription">
              Upgrade plan
            </Link>
          )}
        </section>
      )}
      {status === "closed" && (
        <section className="mt-7 max-w-3xl rounded-app border border-app-border bg-app-surface p-5 sm:p-7">
          <span className="rounded-app bg-app-subtle px-2.5 py-1 font-bold text-app-text-muted">CLOSED</span>
          <h2 className="mt-4 font-bold">{question}</h2>
          <div className="mt-6 space-y-4">
            {[
              { label: options[0], percentage: 48 },
              { label: options[1], percentage: 34 },
              { label: options[2], percentage: 18 },
            ].map(({ label, percentage }) => (
              <div className="rounded-app border border-app-border-subtle p-4" key={label}>
                <div className="flex justify-between">
                  <span>{label}</span>
                  <strong>{percentage}%</strong>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-app bg-app-subtle">
                  <div className="h-full rounded-app bg-app-primary" style={{ width: `${percentage}%` }} />
                </div>
                <LiveDemographicPanel />
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
};
