import { FiBarChart2, FiCheck, FiClock, FiUsers } from "react-icons/fi";
import { useParams } from "react-router-dom";
import { AccessDenied } from "#webapp/components/AccessDenied.tsx";
import { ChoiceResults } from "#webapp/components/ChoiceResults.tsx";
import { DemographicChart, type Range } from "#webapp/components/DemographicChart.tsx";
import { LocalizedLink as Link } from "#webapp/components/LocalizedLink.tsx";
import { LockBadge } from "#webapp/components/LockBadge.tsx";
import { Metric } from "#webapp/components/Metric.tsx";
import { MultipleChoiceResults } from "#webapp/components/MultipleChoiceResults.tsx";
import { RankedChoiceResults } from "#webapp/components/RankedChoiceResults.tsx";
import { results } from "#webapp/data/pollResults.ts";
import { usePolls } from "#webapp/hooks/usePolls.ts";
import { groupFor, memberCanAccess } from "#webapp/lib/groups.ts";
import { Spinner } from "#webapp/ui/Spinner.tsx";

const genderBreakdown: Range[] = [
  { range: "Women", votes: 641, percentage: 51.4 },
  { range: "Men", votes: 607, percentage: 48.6 },
];

const cityBreakdown: Range[] = [
  { range: "Milan", votes: 534, percentage: 42.8 },
  { range: "Rome", votes: 407, percentage: 32.6 },
  { range: "Turin", votes: 307, percentage: 24.6 },
];

const ageBreakdown: Range[] = [
  { range: "60+", votes: 71, percentage: 5.7 },
  { range: "51–60", votes: 112, percentage: 9 },
  { range: "41–50", votes: 161, percentage: 12.9 },
  { range: "31–40", votes: 246, percentage: 19.7 },
  { range: "24–30", votes: 212, percentage: 17 },
  { range: "19–24", votes: 350, percentage: 28 },
  { range: "14–18", votes: 96, percentage: 7.7 },
];

const incomeBreakdown: Range[] = [
  { range: "€100k+", votes: 46, percentage: 3.7 },
  { range: "€61k–100k", votes: 87, percentage: 7 },
  { range: "€51k–60k", votes: 98, percentage: 7.9 },
  { range: "€41k–50k", votes: 146, percentage: 11.7 },
  { range: "€31k–40k", votes: 243, percentage: 19.5 },
  { range: "€21k–30k", votes: 387, percentage: 31 },
  { range: "€11k–20k", votes: 160, percentage: 12.8 },
  { range: "€0–10k", votes: 81, percentage: 6.5 },
];

export const ResultsPage = () => {
  const { id } = useParams();
  const { data: polls } = usePolls();
  if (!polls) return <Spinner />;
  const poll = polls.find((item) => item.id === id);
  if (!poll) return <main className="mx-auto max-w-5xl px-4 py-8 sm:px-7">Poll not found.</main>;
  const group = groupFor(poll.groupId);
  const abstentionRate = ((results.find((result) => result.label === "No suitable option.")?.votes ?? 0) / poll.votes) * 100;
  if (group && !memberCanAccess(poll)) return <AccessDenied group={group} />;
  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-7">
      <Link className="font-bold text-slate-500" to={`/poll/${poll.id}`}>
        ← Back to poll
      </Link>
      <div className="mt-5 flex justify-between gap-3">
        <div>
          <p className="font-bold text-blue-700 tracking-wider">RESULTS</p>
          <h1 className="mt-1 font-bold">{poll.title}</h1>
        </div>
        {group && <LockBadge group={group} />}
      </div>
      <section className="mt-7 grid gap-4 sm:grid-cols-4">
        <Metric icon={<FiUsers />} label="Votes cast" value={poll.votes.toLocaleString()} />
        <Metric icon={<FiBarChart2 />} label="Eligible turnout" value={`${((poll.votes / poll.eligible) * 100).toFixed(1)}%`} />
        <Metric icon={<FiClock />} label="Time remaining" value={poll.closes} />
        <Metric icon={<FiCheck />} label="Abstention rate" value={`${abstentionRate.toFixed(1)}%`} />
      </section>
      <section className="mt-6 rounded-app border border-slate-200 bg-white p-5">
        {poll.votingMethod === "One choice" && <ChoiceResults />}
        {poll.votingMethod === "Multiple choice" && <MultipleChoiceResults />}
        {poll.votingMethod === "Ranked choice" && <RankedChoiceResults algorithm={poll.rankedAlgorithm ?? "irv"} />}
      </section>
      <section className="mt-6 grid gap-6 lg:grid-cols-2">
        <DemographicChart data={ageBreakdown} title="Age range" />
        <DemographicChart data={incomeBreakdown} title="Income range" />
        <DemographicChart data={genderBreakdown} title="Gender" />
        <DemographicChart data={cityBreakdown} title="Geography by city" />
      </section>
    </main>
  );
};
