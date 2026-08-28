import cx from "clsx-tw";
import React from "react";
import { useTranslation } from "react-i18next";
import {
  FiArrowDown,
  FiArrowRight,
  FiArrowUp,
  FiBarChart2,
  FiCheck,
  FiCheckSquare,
  FiClock,
  FiDisc,
  FiImage,
  FiList,
  FiLock,
  FiMenu,
  FiPlus,
  FiSearch,
  FiSmartphone,
  FiUsers,
  FiX,
} from "react-icons/fi";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { i18n, languageStorageKey } from "#webapp/i18n.ts";

type VotingMethod = "One choice" | "Multiple choice" | "Ranked choice";
type RankedAlgorithm = "irv" | "borda";
type InvitationStatus = "Pending" | "Accepted" | "Rejected";
type Group = { id: string; name: string; description: string; members: number; limit: number | "Unlimited"; owner: boolean; activeMember: boolean };
type Poll = {
  id: string;
  title: string;
  description: string;
  votingMethod: VotingMethod;
  options: string[];
  votes: number;
  eligible: number;
  authorName: string;
  closes: string;
  rankedAlgorithm?: RankedAlgorithm;
  groupId?: string;
};
type Range = { range: string; votes: number; percentage: number };
type PollSort = "Turnout: low to high" | "Turnout: high to low" | "Votes: low to high" | "Votes: high to low" | "Closing time: soonest" | "Closing time: latest";

const groups: Group[] = [
  { id: "northstar", name: "Northstar Strategy", description: "Leadership and planning", members: 46, limit: 100, owner: true, activeMember: true },
  { id: "milan-labour", name: "Milan Labour Council", description: "Member decisions", members: 328, limit: 1000, owner: false, activeMember: true },
  { id: "vendors", name: "Partner Council", description: "Approved partner review", members: 86, limit: 100, owner: false, activeMember: false },
];
const invitations: { email: string; status: InvitationStatus }[] = [
  { email: "ana.rossi@example.com", status: "Accepted" },
  { email: "luca.bianchi@example.com", status: "Pending" },
  { email: "marco.verdi@example.com", status: "Rejected" },
  { email: "sofia.gallo@example.com", status: "Accepted" },
];
const polls: Poll[] = [
  {
    id: "city-green",
    title: "More green space in the city",
    description: "Choose the next public-space investment.",
    votingMethod: "One choice",
    options: ["Plant 1,000 new trees", "Create community gardens", "Build a small urban forest", "No suitable option."],
    votes: 1248,
    eligible: 2340,
    authorName: "Elena Rossi",
    closes: "2 days",
  },
  {
    id: "night-buses",
    title: "Night buses on weekends",
    description: "Rank the late-night transport priorities.",
    votingMethod: "Ranked choice",
    options: ["Extend route N6", "Add an airport connection", "Increase frequency on route N15"],
    votes: 681,
    eligible: 1120,
    authorName: "Elena Rossi",
    closes: "9 days",
    rankedAlgorithm: "irv",
  },
  {
    id: "school-meals",
    title: "Free school meals",
    description: "Select every service that should be included.",
    votingMethod: "Multiple choice",
    options: ["Breakfast", "Lunch", "After-school snacks", "No suitable option."],
    votes: 442,
    eligible: 890,
    authorName: "Elena Rossi",
    closes: "12 days",
  },
  {
    id: "board-priorities",
    title: "Q4 strategic priorities",
    description: "Choose the initiative to lead the next quarter.",
    votingMethod: "One choice",
    options: ["Market expansion", "Product reliability", "Enterprise sales", "No suitable option."],
    votes: 31,
    eligible: 46,
    authorName: "Elena Rossi",
    closes: "3 days",
    groupId: "northstar",
  },
  {
    id: "partner-review",
    title: "Partner programme review",
    description: "Private partner council decision.",
    votingMethod: "Multiple choice",
    options: ["Renew criteria", "Change criteria", "Pause the programme", "No suitable option."],
    votes: 48,
    eligible: 86,
    authorName: "Elena Rossi",
    closes: "6 days",
    groupId: "vendors",
  },
  {
    id: "neighbourhood-library",
    title: "Neighbourhood library opening hours",
    description: "Choose the best schedule for the local library.",
    votingMethod: "One choice",
    options: ["Open earlier", "Open later", "Open on Sundays", "No suitable option."],
    votes: 916,
    eligible: 1580,
    authorName: "Elena Rossi",
    closes: "5 days",
  },
  {
    id: "community-sports",
    title: "Community sports programme",
    description: "Select the activities to fund next season.",
    votingMethod: "Multiple choice",
    options: ["Youth football", "Swimming lessons", "Senior fitness", "No suitable option."],
    votes: 287,
    eligible: 760,
    authorName: "Elena Rossi",
    closes: "15 days",
  },
];
const results = [
  { label: "Plant 1,000 new trees", votes: 704, percentage: 56 },
  { label: "Create community gardens", votes: 359, percentage: 29 },
  { label: "Build a small urban forest", votes: 185, percentage: 15 },
  { label: "No suitable option.", votes: 0, percentage: 0 },
];
const multipleChoiceResults = [
  { label: "Breakfast", votes: 302, voterPercentage: 68, selectionPercentage: 43 },
  { label: "Lunch", votes: 271, voterPercentage: 61, selectionPercentage: 39 },
  { label: "After-school snacks", votes: 129, voterPercentage: 29, selectionPercentage: 18 },
  { label: "No suitable option.", votes: 18, voterPercentage: 4, selectionPercentage: 0 },
];
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
const languages = [
  { value: "en", label: "🇬🇧 English" },
  { value: "es", label: "🇪🇸 Español" },
  { value: "de", label: "🇩🇪 Deutsch" },
  { value: "fr", label: "🇫🇷 Français" },
  { value: "it", label: "🇮🇹 Italiano" },
];
const registrationStorageKey = "voto.registered";

const groupFor = (groupId: string | undefined) => groups.find((group) => group.id === groupId);
const memberCanAccess = (poll: Poll) => !poll.groupId || groupFor(poll.groupId)?.activeMember === true;
const pollTurnout = (poll: Poll) => (poll.votes / poll.eligible) * 100;
const pollClosingDays = (poll: Poll) => Number.parseInt(poll.closes, 10);
const Field = ({ label, placeholder, textarea = false, type = "text" }: { label: string; placeholder?: string; textarea?: boolean; type?: string }) => (
  <label className="block font-semibold text-sm">
    {label}
    {textarea ? (
      <textarea className="mt-1.5 min-h-28 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 font-normal" placeholder={placeholder} />
    ) : (
      <input className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 font-normal" placeholder={placeholder} type={type} />
    )}
  </label>
);
type SelectFieldProps = { className?: string; label: string; onChange?: React.ChangeEventHandler<HTMLSelectElement>; options: string[]; value?: string };

const SelectField = ({ className = "", label, onChange, options, value }: SelectFieldProps) => (
  <label className={cx("block font-semibold text-sm", className)}>
    {label}
    <select className={`mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 font-normal ${className}`} onChange={onChange} value={value}>
      {options.map((option) => (
        <option key={option}>{option}</option>
      ))}
    </select>
  </label>
);

const Header = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [language, setLanguage] = React.useState(i18n.resolvedLanguage ?? i18n.language);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = React.useState(false);
  const isLoggedIn = localStorage.getItem(registrationStorageKey) === "true";
  const changeLanguage: React.ChangeEventHandler<HTMLSelectElement> = async (event) => {
    const selectedLanguage = event.target.value;
    await i18n.changeLanguage(selectedLanguage);
    localStorage.setItem(languageStorageKey, selectedLanguage);
    setLanguage(selectedLanguage);
  };
  const logout = () => {
    localStorage.removeItem(registrationStorageKey);
    navigate("/");
  };
  return (
    <header className="border-slate-800 border-b bg-slate-950 px-4 py-3 shadow-lg sm:px-7">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link className="font-bold text-white text-xl tracking-tight no-underline" to="/">
            voto<span className="text-blue-500">.</span>io
          </Link>
          <select aria-label={t("nav.language")} className="rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-white" onChange={changeLanguage} value={language}>
            {languages.map((language) => (
              <option key={language.value} value={language.value}>
                {language.label}
              </option>
            ))}
          </select>
        </div>
        <nav className="flex items-center gap-3 text-sm">
          <Link className="hidden rounded-full bg-blue-600 px-3 py-2 font-bold text-white no-underline hover:bg-blue-500 sm:block" to="/poll/new">
            {t("nav.createPoll")}
          </Link>
          <Link className="hidden text-slate-300 no-underline hover:text-white md:block" to="/live-poll/new">
            {t("nav.createLivePoll")}
          </Link>
          <Link className="hidden text-slate-300 no-underline hover:text-white sm:block" to="/poll/list">
            {t("nav.explorePolls")}
          </Link>
          {isLoggedIn ? (
            <div className="relative" onMouseEnter={() => setIsProfileMenuOpen(true)} onMouseLeave={() => setIsProfileMenuOpen(false)}>
              <button className="rounded-full bg-blue-600 px-3 py-2 font-bold text-white" onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)} type="button">
                Elena Rossi
              </button>
              {isProfileMenuOpen && (
                <div className="absolute top-full right-0 z-10 w-36 rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
                  <Link className="block rounded-lg px-3 py-2 font-semibold text-slate-800 no-underline hover:bg-slate-100" to="/my-polls">
                    Polls
                  </Link>
                  <Link className="block rounded-lg px-3 py-2 font-semibold text-slate-800 no-underline hover:bg-slate-100" to="/my-groups">
                    Groups
                  </Link>
                  <Link className="block rounded-lg px-3 py-2 font-semibold text-slate-800 no-underline hover:bg-slate-100" to="/my-subscription">
                    Subscription
                  </Link>
                  <Link className="block rounded-lg px-3 py-2 font-semibold text-slate-800 no-underline hover:bg-slate-100" to="/my-profile">
                    {t("nav.profile")}
                  </Link>
                  <Link className="block rounded-lg px-3 py-2 font-semibold text-slate-800 no-underline hover:bg-slate-100" to="/my-settings">
                    Settings
                  </Link>
                  <button className="w-full rounded-lg px-3 py-2 text-left font-semibold text-red-700 hover:bg-red-50" onClick={logout} type="button">
                    {t("nav.logout")}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link className="rounded-full border border-slate-600 px-3 py-2 font-bold text-white no-underline hover:border-white" to="/register">
              {t("nav.register")}
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};
const LockBadge = ({ group }: { group: Group }) => (
  <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 font-bold text-blue-800 text-xs">
    <FiLock /> Exclusive to {group.name}
  </span>
);
const VotingMethodIcon = ({ votingMethod }: { votingMethod: VotingMethod }) => {
  const label = votingMethod;
  return (
    <details className="group relative shrink-0">
      <summary aria-label={label} className="list-none rounded-md p-1 text-blue-700 hover:bg-blue-50 [&::-webkit-details-marker]:hidden">
        {votingMethod === "One choice" && <FiDisc aria-hidden="true" />}
        {votingMethod === "Multiple choice" && <FiCheckSquare aria-hidden="true" />}
        {votingMethod === "Ranked choice" && <FiList aria-hidden="true" />}
      </summary>
      <span className="absolute top-full right-0 z-10 mt-1 hidden w-max max-w-40 rounded-md bg-slate-950 px-2 py-1 text-center font-semibold text-white text-xs shadow-lg group-open:block md:group-hover:block md:group-open:hidden">
        {label}
      </span>
    </details>
  );
};
const PollCard = ({ poll }: { poll: Poll }) => {
  const group = groupFor(poll.groupId);
  const turnout = pollTurnout(poll).toFixed(1);
  return (
    <article className="flex min-w-0 flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      {group && (
        <div className="mb-3">
          <LockBadge group={group} />
        </div>
      )}
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-bold text-lg">{poll.title}</h3>
        <VotingMethodIcon votingMethod={poll.votingMethod} />
      </div>
      <p className="mt-2 text-slate-500 text-xs">
        Published by{" "}
        <Link className="font-bold text-blue-700 no-underline" to="/u/1">
          {poll.authorName}
        </Link>
      </p>
      <div className="mt-5 flex justify-between border-slate-100 border-t pt-4 text-slate-500 text-xs">
        <span>
          {poll.votes.toLocaleString()} votes · {turnout}% turnout
        </span>
        <span>Closes in {poll.closes}</span>
      </div>
      <Link className="mt-4 flex items-center justify-between font-bold text-blue-700 text-sm no-underline" to={`/poll/${poll.id}`}>
        Open poll <FiArrowRight />
      </Link>
    </article>
  );
};
const Landing = () => {
  const { t } = useTranslation();
  return (
    <>
      <section className="bg-[#071a3d] px-6 py-6 text-white sm:px-7 sm:py-12">
        <div className="mx-auto grid max-w-6xl items-center gap-8 lg:grid-cols-2">
          <div>
            <h1 className="mt-3 max-w-3xl font-bold text-5xl text-white tracking-tight lg:text-7xl">{t("landing.title")}</h1>
            <p className="mt-5 max-w-xl text-slate-300">{t("landing.description")}</p>
            <div className="mt-8 flex gap-3">
              <Link className="rounded-full bg-blue-500 px-5 py-3 font-bold text-white no-underline hover:bg-blue-400" to="/poll/list">
                {t("landing.poll")}
              </Link>
              <Link className="rounded-full border border-slate-600 px-5 py-3 font-bold text-white no-underline" to="/poll/list">
                {t("landing.vote")}
              </Link>
            </div>
          </div>
          <div aria-label={t("landing.imagePlaceholder")} className="flex min-h-72 items-center justify-center border border-blue-400/40 bg-gray-400 p-6 shadow-2xl" role="img">
            <FiImage className="text-6xl text-blue-200" />
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-7">
        <h2 className="font-bold text-3xl lg:text-4xl">{t("landing.whyTitle")}</h2>
        <p className="mt-4 max-w-4xl text-slate-600 leading-7">{t("landing.whyDescription")}</p>
      </section>
      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-7">
        <div className="flex items-end justify-between">
          <h2 className="mt-1 font-bold text-3xl lg:text-4xl">{t("landing.polls")}</h2>
          <Link className="font-bold text-blue-700 text-sm" to="/poll/list">
            {t("landing.allPolls")}
          </Link>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {[...polls]
            .filter(memberCanAccess)
            .sort((firstPoll, secondPoll) => secondPoll.votes - firstPoll.votes)
            .slice(0, 6)
            .map((poll) => (
              <PollCard key={poll.id} poll={poll} />
            ))}
        </div>
      </main>
    </>
  );
};

const PollList = () => {
  const [query, setQuery] = React.useState("");
  const [sort, setSort] = React.useState<PollSort>("Turnout: high to low");
  const [showMyGroups, setShowMyGroups] = React.useState(false);
  const matchingPolls = polls.filter((poll) => poll.title.toLowerCase().includes(query.toLowerCase()));
  const filteredPolls = matchingPolls.filter((poll) => (showMyGroups ? poll.groupId && memberCanAccess(poll) : !poll.groupId));
  const visiblePolls = [...filteredPolls].sort((firstPoll, secondPoll) => {
    if (sort === "Turnout: low to high") return pollTurnout(firstPoll) - pollTurnout(secondPoll);
    if (sort === "Turnout: high to low") return pollTurnout(secondPoll) - pollTurnout(firstPoll);
    if (sort === "Votes: low to high") return firstPoll.votes - secondPoll.votes;
    if (sort === "Votes: high to low") return secondPoll.votes - firstPoll.votes;
    if (sort === "Closing time: soonest") return pollClosingDays(firstPoll) - pollClosingDays(secondPoll);
    return pollClosingDays(secondPoll) - pollClosingDays(firstPoll);
  });
  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-7">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="mt-1 font-bold text-3xl lg:text-5xl">Polls open to you</h1>
        <Link className="hidden items-center gap-2 rounded-full bg-blue-700 px-4 py-3 font-bold text-white no-underline sm:inline-flex" to="/poll/new">
          <FiPlus /> Create poll
        </Link>
      </div>
      <label className="mt-7 flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3">
        <FiSearch className="text-slate-400" />
        <input aria-label="Search polls" className="grow border-0 py-3 outline-none" onChange={(event) => setQuery(event.target.value)} placeholder="Search polls" value={query} />
      </label>
      <div className="mt-3 flex flex-wrap items-end gap-2">
        <p className="mr-2 text-slate-500 text-sm">{visiblePolls.length} open polls</p>
        <button
          aria-pressed={showMyGroups}
          className={`rounded-full border px-3 py-1.5 text-sm ${showMyGroups ? "border-blue-600 bg-blue-50 font-bold text-blue-800" : "border-slate-300 bg-white"}`}
          onClick={() => setShowMyGroups(!showMyGroups)}
          type="button"
        >
          My groups
        </button>
        <SelectField
          className="mt-0 w-auto"
          label="Sort polls"
          onChange={(event) => setSort(event.target.value as PollSort)}
          options={["Turnout: high to low", "Turnout: low to high", "Votes: high to low", "Votes: low to high", "Closing time: soonest", "Closing time: latest"]}
          value={sort}
        />
      </div>
      <div className="mt-3 grid gap-4 md:grid-cols-2">
        {visiblePolls.map((poll) => (
          <PollCard key={poll.id} poll={poll} />
        ))}
      </div>
    </main>
  );
};

const CreatePoll = () => {
  const [options, setOptions] = React.useState(["", ""]);
  const [method, setMethod] = React.useState<VotingMethod>("One choice");
  const [rankedAlgorithm, setRankedAlgorithm] = React.useState<RankedAlgorithm>("irv");
  const [groupId, setGroupId] = React.useState("Public");
  const automaticNoChoice = method !== "Ranked choice";
  const ownedGroups = groups.filter((group) => group.owner);
  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-7">
      <Link className="font-bold text-slate-500 text-sm" to="/poll/list">
        ← Back to polls
      </Link>
      <h1 className="mt-5 font-bold text-3xl lg:text-5xl">Create a poll</h1>
      <form className="mt-7 space-y-6 rounded-2xl border border-slate-200 bg-white p-5 sm:p-7">
        <fieldset className="space-y-4">
          {/*<legend className="font-bold text-lg">Poll details</legend>*/}
          <Field label="Poll name" placeholder="e.g. Q4 strategic priorities" />
          <Field label="Description" placeholder="Essential decision context" textarea />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Opening date" type="datetime-local" />
            <Field label="Closing date" type="datetime-local" />
          </div>
        </fieldset>
        <fieldset>
          {/*<legend className="font-bold text-lg">Voting method</legend>*/}
          <SelectField
            label="Voting method"
            onChange={(event) => setMethod(event.target.value as VotingMethod)}
            options={["One choice", "Multiple choice", "Ranked choice"]}
            value={method}
          />
          {method === "Ranked choice" && (
            <SelectField
              className="mt-2"
              label="Ranked-choice algorithm"
              onChange={(event) => setRankedAlgorithm(event.target.value === "Instant runoff (IRV)" ? "irv" : "borda")}
              options={["Instant runoff (IRV)", "Borda count"]}
              value={rankedAlgorithm === "irv" ? "Instant runoff (IRV)" : "Borda count"}
            />
          )}
        </fieldset>
        <fieldset>
          {/*<legend className="font-bold text-lg">Voting options</legend>*/}
          <label className="block font-semibold text-sm">Options</label>
          <div className="mt-2 space-y-2">
            {options.map((option, index) => (
              <label className="flex gap-2" key={`option-${index}`}>
                <input
                  className="grow rounded-xl border border-slate-300 px-3 py-2.5"
                  onChange={(event) => setOptions(options.map((value, optionIndex) => (optionIndex === index ? event.target.value : value)))}
                  placeholder={`Option ${index + 1}`}
                  value={option}
                />
                {options.length > 2 && (
                  <button
                    aria-label={`Remove option ${index + 1}`}
                    className="p-2 text-slate-500"
                    onClick={() => setOptions(options.filter((_, optionIndex) => optionIndex !== index))}
                    type="button"
                  >
                    <FiX />
                  </button>
                )}
              </label>
            ))}
          </div>
          {automaticNoChoice && (
            <div className="mt-2 flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2.5 text-blue-900 text-sm">
              <FiCheck /> No suitable option. <span className="ml-auto font-bold text-xs">Automatic</span>
            </div>
          )}
          {options.length < 5 && (
            <button className="mt-3 font-bold text-blue-700 text-sm" onClick={() => setOptions([...options, ""])} type="button">
              + Add option
            </button>
          )}
          <p className="mt-2 text-slate-500 text-xs">One-choice and multiple-choice polls require at least two options.</p>
        </fieldset>
        <fieldset className="space-y-3">
          {/*<legend className="font-bold text-lg">Access control</legend>*/}
          <SelectField
            label="Who can view and vote"
            onChange={(event) => setGroupId(event.target.value === "Public" ? "Public" : (ownedGroups.find((group) => group.name === event.target.value)?.id ?? "Public"))}
            options={["Public", ...ownedGroups.map((group) => group.name)]}
            value={groupId === "Public" ? "Public" : groupFor(groupId)?.name}
          />
          <p className="text-slate-500 text-xs">Private polls require an active group membership and all demographic requirements.</p>
        </fieldset>
        <fieldset>
          {/*<legend className="font-bold text-lg">Eligible voters</legend>*/}
          <div className="grid gap-3 sm:grid-cols-2">
            <SelectField label="Gender" options={["Any gender", "Women", "Men"]} />
            <Field label="Minimum income" type="number" />
            <Field label="City or cities" />
            <Field label="Country" />
          </div>
        </fieldset>
        <button className="w-full rounded-full bg-blue-700 px-5 py-3 font-bold text-white hover:bg-blue-600" type="submit">
          Publish poll
        </button>
      </form>
    </main>
  );
};

const AccessDenied = ({ group }: { group: Group }) => (
  <main className="mx-auto max-w-xl px-4 py-20 text-center">
    <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-red-50 text-red-700">
      <FiLock className="text-2xl" />
    </div>
    <h1 className="mt-5 font-bold text-3xl">Access denied</h1>
    <p className="mt-3 text-slate-600">This poll is restricted to members of {group.name}.</p>
    <Link className="mt-7 inline-block rounded-full bg-blue-700 px-5 py-3 font-bold text-white no-underline" to="/my-groups">
      View your groups
    </Link>
  </main>
);
const PollDetail = () => {
  const { id } = useParams();
  const poll = polls.find((item) => item.id === id) ?? polls[0];
  const group = groupFor(poll.groupId);
  const [single, setSingle] = React.useState(poll.options[0]);
  const [many, setMany] = React.useState<string[]>([]);
  const [ranked, setRanked] = React.useState(poll.options);
  const [dragged, setDragged] = React.useState("");
  if (group && !memberCanAccess(poll)) return <AccessDenied group={group} />;
  const move = ({ source, target }: { source: string; target: string }) => {
    if (!source || source === target) return;
    const next = ranked.filter((option) => option !== source);
    next.splice(next.indexOf(target), 0, source);
    setRanked(next);
  };
  return (
    <main className="mx-auto max-w-4xl px-4 py-8 sm:px-7">
      <Link className="font-bold text-slate-500 text-sm" to="/poll/list">
        ← Back to polls
      </Link>
      <div className="mt-5 grid gap-6 lg:grid-cols-[1fr_270px]">
        <section>
          {group && <LockBadge group={group} />}
          <h1 className="mt-4 font-bold text-3xl lg:text-5xl">{poll.title}</h1>
          <p className="mt-3 text-slate-600">{poll.description}</p>
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-2 font-bold">
              <FiCheck className="text-blue-600" />{" "}
              {poll.votingMethod === "One choice" ? "Choose one option" : poll.votingMethod === "Multiple choice" ? "Choose all that apply" : "Rank options by preference"}
            </div>
            <div className="mt-4 space-y-3">
              {poll.votingMethod === "One choice" &&
                poll.options.map((option) => (
                  <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 p-3 has-checked:border-blue-600 has-checked:bg-blue-50" key={option}>
                    <input checked={single === option} name="vote" onChange={() => setSingle(option)} type="radio" />
                    {option}
                  </label>
                ))}
              {poll.votingMethod === "Multiple choice" &&
                poll.options.map((option) => (
                  <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 p-3 has-checked:border-blue-600 has-checked:bg-blue-50" key={option}>
                    <input
                      checked={many.includes(option)}
                      onChange={() => setMany(many.includes(option) ? many.filter((item) => item !== option) : [...many, option])}
                      type="checkbox"
                    />
                    {option}
                  </label>
                ))}
              {poll.votingMethod === "Ranked choice" &&
                ranked.map((option, index) => (
                  <div
                    className={`flex cursor-grab items-center gap-3 rounded-xl border p-3 ${dragged === option ? "border-blue-600 bg-blue-50" : "border-slate-200"}`}
                    draggable
                    key={option}
                    onDragEnd={() => setDragged("")}
                    onDragOver={(event) => event.preventDefault()}
                    onDragStart={(event) => {
                      event.dataTransfer.setData("text/plain", option);
                      setDragged(option);
                    }}
                    onDrop={(event) => {
                      event.preventDefault();
                      move({ source: dragged || event.dataTransfer.getData("text/plain"), target: option });
                    }}
                  >
                    <FiMenu className="text-slate-400" />
                    <span className="flex size-7 items-center justify-center rounded-full bg-blue-50 font-bold text-blue-700 text-sm">{index + 1}</span>
                    <span className="grow">{option}</span>
                    <button aria-label={`Move ${option} up`} disabled={index === 0} onClick={() => index > 0 && move({ source: option, target: ranked[index - 1] })} type="button">
                      <FiArrowUp />
                    </button>
                    <button
                      aria-label={`Move ${option} down`}
                      disabled={index === ranked.length - 1}
                      onClick={() => index < ranked.length - 1 && move({ source: option, target: ranked[index + 1] })}
                      type="button"
                    >
                      <FiArrowDown />
                    </button>
                  </div>
                ))}
            </div>
            <div className="mt-5 flex gap-3">
              <button className="rounded-full bg-blue-700 px-5 py-3 font-bold text-white" type="button">
                Submit vote
              </button>
              <Link className="rounded-full border border-slate-300 px-5 py-3 font-bold text-slate-800 text-sm no-underline" to={`/poll/${poll.id}/stats`}>
                See results
              </Link>
            </div>
          </div>
        </section>
        <aside className="rounded-2xl bg-slate-100 p-5">
          <h2 className="font-bold text-lg">Poll facts</h2>
          <dl className="mt-4 space-y-4 text-sm">
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

const DemographicChart = ({ data, title }: { data: Range[]; title: string }) => (
  <section className="rounded-2xl border border-slate-200 bg-white p-5">
    <h2 className="font-bold text-lg">{title}</h2>
    <div className="mt-4 h-72">
      <ResponsiveContainer height="100%" width="100%">
        <BarChart data={data} layout="vertical">
          <XAxis dataKey="percentage" tickFormatter={(value) => `${value}%`} type="number" />
          <YAxis dataKey="range" type="category" width={70} />
          <Tooltip formatter={(value) => [`${value}%`, "Turnout"] as [string, string]} />
          <Bar dataKey="percentage" radius={[0, 5, 5, 0]}>
            {data.map((item) => (
              <Cell fill="#2563eb" key={item.range} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  </section>
);
const ChoiceResults = () => (
  <>
    <h2 className="font-bold text-xl">Choices</h2>
    <div className="mt-5 space-y-4">
      {results.map((result) => (
        <div key={result.label}>
          <div className="flex justify-between text-sm">
            <span>{result.label}</span>
            <strong>
              {result.percentage}% · {result.votes}
            </strong>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-blue-600" style={{ width: `${result.percentage}%` }} />
          </div>
        </div>
      ))}
    </div>
  </>
);
const MultipleChoiceResults = () => (
  <>
    <h2 className="font-bold text-xl">Choices</h2>
    <div className="mt-5 space-y-3">
      {multipleChoiceResults.map((result) => (
        <div className="grid gap-1 border-slate-100 border-b pb-3 text-sm sm:grid-cols-[1fr_auto_auto_auto] sm:gap-5" key={result.label}>
          <strong>{result.label}</strong>
          <span>{result.voterPercentage}% of voters</span>
          <span>{result.selectionPercentage}% of selections</span>
          <span>{result.votes} votes</span>
        </div>
      ))}
    </div>
  </>
);
const RankedChoiceResults = ({ algorithm }: { algorithm: RankedAlgorithm }) => {
  if (algorithm === "borda") {
    return (
      <>
        <h2 className="font-bold text-xl">Final ranking</h2>
        <ol className="mt-5 space-y-2">
          {[
            ["Extend route N6", 1371],
            ["Add an airport connection", 1028],
            ["Increase frequency on route N15", 847],
          ].map(([option, points], index) => (
            <li className="flex justify-between border-slate-100 border-b pb-2 text-sm" key={option}>
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
      <div className="rounded-xl bg-blue-50 p-4 text-blue-950">
        <p className="font-bold">Winner: Extend route N6</p>
        <p className="mt-1 text-sm">52.4% after round 3</p>
      </div>
      <h2 className="mt-5 font-bold text-xl">Instant-runoff rounds</h2>
      <div className="mt-3 space-y-2 text-sm">
        <p>Round 1: Increase frequency on route N15 eliminated.</p>
        <p>Round 2: Add an airport connection eliminated.</p>
        <p>Round 3: Extend route N6 reached a majority.</p>
      </div>
      <h3 className="mt-5 font-bold">Preference distribution by rank</h3>
      <p className="mt-1 text-slate-600 text-sm">First, second, and third preferences are shown in the demographic charts.</p>
    </>
  );
};
const ResultsPage = () => {
  const { id } = useParams();
  const poll = polls.find((item) => item.id === id) ?? polls[0];
  const group = groupFor(poll.groupId);
  const abstentionRate = ((results.find((result) => result.label === "No suitable option.")?.votes ?? 0) / poll.votes) * 100;
  if (group && !memberCanAccess(poll)) return <AccessDenied group={group} />;
  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-7">
      <Link className="font-bold text-slate-500 text-sm" to={`/poll/${poll.id}`}>
        ← Back to poll
      </Link>
      <div className="mt-5 flex justify-between gap-3">
        <div>
          <p className="font-bold text-blue-700 text-sm tracking-wider">RESULTS</p>
          <h1 className="mt-1 font-bold text-3xl lg:text-5xl">{poll.title}</h1>
        </div>
        {group && <LockBadge group={group} />}
      </div>
      <section className="mt-7 grid gap-4 sm:grid-cols-4">
        <Metric icon={<FiUsers />} label="Votes cast" value={poll.votes.toLocaleString()} />
        <Metric icon={<FiBarChart2 />} label="Eligible turnout" value={`${((poll.votes / poll.eligible) * 100).toFixed(1)}%`} />
        <Metric icon={<FiClock />} label="Time remaining" value={poll.closes} />
        <Metric icon={<FiCheck />} label="Abstention rate" value={`${abstentionRate.toFixed(1)}%`} />
      </section>
      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
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
const Metric = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-5">
    <div className="flex items-center gap-2 text-slate-500 text-sm">
      {icon}
      {label}
    </div>
    <p className="mt-2 font-bold text-2xl">{value}</p>
  </div>
);

const liveQrSquares = [0, 1, 2, 4, 6, 8, 10, 12, 13, 15, 18, 20, 22, 24, 27, 28, 30, 32, 34, 36, 38, 40, 42, 44, 46, 47, 48];

const LiveQr = () => (
  <div aria-label="Live poll QR code" className="shrink-0 rounded-xl bg-white p-2 shadow-lg" role="img">
    <div className="grid grid-cols-7 gap-px" style={{ width: 84 }}>
      {Array.from({ length: 49 }, (_, index) => (
        <span className={liveQrSquares.includes(index) ? "aspect-square bg-slate-950" : "aspect-square bg-slate-100"} key={index} />
      ))}
    </div>
  </div>
);

type DemographicRow = { label: string; men: number; women: number };
type CityRow = { label: string; percentage: number };
type SplitBarProps = { men: number; women: number };
type StackedRowsProps = { rows: DemographicRow[] };
type CityBarsProps = { rows: CityRow[] };

const ageRows: DemographicRow[] = [
  { label: "14–18", men: 46, women: 54 },
  { label: "19–24", men: 49, women: 51 },
  { label: "25–30", men: 44, women: 56 },
  { label: "31–40", men: 52, women: 48 },
  { label: "41–50", men: 55, women: 45 },
  { label: "51–60", men: 47, women: 53 },
  { label: "60+", men: 42, women: 58 },
];
const incomeRows: DemographicRow[] = [
  { label: "€0–10k", men: 43, women: 57 },
  { label: "€11–20k", men: 45, women: 55 },
  { label: "€21–30k", men: 48, women: 52 },
  { label: "€31–40k", men: 53, women: 47 },
  { label: "€41–50k", men: 56, women: 44 },
  { label: "€51–60k", men: 58, women: 42 },
  { label: "€61–100k", men: 61, women: 39 },
  { label: "€100k+", men: 64, women: 36 },
];
const cityRows: CityRow[] = [
  { label: "Milan", percentage: 22 },
  { label: "Rome", percentage: 16 },
  { label: "Turin", percentage: 12 },
  { label: "Naples", percentage: 9 },
  { label: "Bologna", percentage: 7 },
  { label: "Florence", percentage: 6 },
  { label: "Genoa", percentage: 5 },
  { label: "Palermo", percentage: 4 },
  { label: "Bari", percentage: 3 },
  { label: "Verona", percentage: 2 },
  { label: "Other cities", percentage: 14 },
];

const SplitBar = ({ men, women }: SplitBarProps) => (
  <div className="flex h-7 overflow-hidden rounded-md text-center font-bold text-[10px] text-slate-900">
    <span className="flex items-center justify-center bg-sky-300" style={{ width: `${men}%` }}>
      {men}%
    </span>
    <span className="flex items-center justify-center bg-pink-400" style={{ width: `${women}%` }}>
      {women}%
    </span>
  </div>
);

const StackedRows = ({ rows }: StackedRowsProps) => (
  <div className="space-y-2">
    {rows.map((row) => (
      <div className="grid grid-cols-[4.5rem_1fr] items-center gap-2" key={row.label}>
        <span className="font-medium text-slate-600 text-xs">{row.label}</span>
        <SplitBar men={row.men} women={row.women} />
      </div>
    ))}
  </div>
);

const CityBars = ({ rows }: CityBarsProps) => (
  <div className="space-y-2">
    {rows.map((row) => (
      <div className="grid grid-cols-[4.5rem_1fr_2rem] items-center gap-2" key={row.label}>
        <span className="truncate font-medium text-slate-600 text-xs">{row.label}</span>
        <div className="h-5 overflow-hidden rounded-md bg-slate-100">
          <div className="h-full rounded-md bg-blue-600" style={{ width: `${row.percentage}%` }} />
        </div>
        <span className="text-right font-bold text-xs">{row.percentage}%</span>
      </div>
    ))}
  </div>
);

const LiveDemographicPanel = () => (
  <details className="mt-4 border-slate-100 border-t pt-4">
    <summary className="cursor-pointer font-bold text-blue-700 text-sm">Demographic breakdown</summary>
    <div className="mt-5 space-y-6">
      <section>
        <h3 className="font-bold text-sm">Gender</h3>
        <div className="mt-2">
          <SplitBar men={48} women={52} />
        </div>
        <div className="mt-1 flex justify-between text-slate-500 text-xs">
          <span>Men</span>
          <span>Women</span>
        </div>
      </section>
      <section>
        <h3 className="font-bold text-sm">Age</h3>
        <div className="mt-2">
          <StackedRows rows={ageRows} />
        </div>
      </section>
      <section>
        <h3 className="font-bold text-sm">Income</h3>
        <div className="mt-2">
          <StackedRows rows={incomeRows} />
        </div>
      </section>
      <section>
        <h3 className="font-bold text-sm">Geography</h3>
        <div className="mt-2">
          <CityBars rows={cityRows} />
        </div>
      </section>
    </div>
  </details>
);

const LivePoll = () => {
  const [status, setStatus] = React.useState<"setup" | "open" | "closed">("setup");
  const [question, setQuestion] = React.useState("Which policy should open the forum?");
  const [options, setOptions] = React.useState(["Housing access", "Local transport", "Climate action"]);
  const liveAudienceLimit = 100;
  const viewers = status === "setup" ? 27 : status === "open" ? 184 : 213;
  const voters = status === "setup" ? 0 : status === "open" ? 131 : 187;
  const overAudienceLimit = viewers > liveAudienceLimit;
  const addOption = () => setOptions([...options, ""]);
  const updateOption = ({ index, value }: { index: number; value: string }) => setOptions(options.map((option, optionIndex) => (optionIndex === index ? value : option)));
  return (
    <main className="mx-auto max-w-5xl px-4 py-6 sm:px-7">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-bold text-blue-700 text-sm tracking-wider">LIVE POLL</p>
          <h1 className="mt-1 font-bold text-3xl lg:text-5xl">City forum</h1>
        </div>
        <div className="text-center text-slate-600 text-xs">
          <LiveQr />
          <p className="mt-2 font-bold">
            {viewers} / {liveAudienceLimit} live users
          </p>
        </div>
      </div>
      {status === "setup" && (
        <form
          className="mt-7 max-w-3xl space-y-5 rounded-2xl border border-slate-200 bg-white p-5 sm:p-7"
          onSubmit={(event) => {
            event.preventDefault();
            setStatus("open");
          }}
        >
          <label className="block font-semibold text-sm">
            Question
            <input className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5 font-normal" onChange={(event) => setQuestion(event.target.value)} value={question} />
          </label>
          <div>
            <p className="font-bold text-sm">Options</p>
            <div className="mt-2 space-y-2">
              {options.map((option, index) => (
                <input
                  className="w-full rounded-xl border border-slate-300 px-3 py-2.5"
                  key={`live-option-${index}`}
                  onChange={(event) => updateOption({ index, value: event.target.value })}
                  value={option}
                />
              ))}
            </div>
            {options.length < 5 && (
              <button className="mt-3 font-bold text-blue-700 text-sm" onClick={addOption} type="button">
                + Add option
              </button>
            )}
          </div>
          <button className="rounded-full bg-blue-700 px-5 py-3 font-bold text-white" type="submit">
            Open poll
          </button>
        </form>
      )}
      {status === "open" && (
        <section className="mt-7 max-w-3xl rounded-2xl border border-slate-200 bg-white p-5 sm:p-7">
          <span className="rounded-full bg-emerald-50 px-2.5 py-1 font-bold text-emerald-700 text-xs">OPEN</span>
          <h2 className="mt-4 font-bold text-2xl">{question}</h2>
          <div className="mt-6">
            <div className="flex justify-between font-bold text-sm">
              <span>Live participation</span>
              <span>
                {voters} / {viewers} voted
              </span>
            </div>
            <div className="mt-2 h-3 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-blue-600" style={{ width: `${(voters / viewers) * 100}%` }} />
            </div>
          </div>
          <button className="mt-7 rounded-full bg-slate-950 px-5 py-3 font-bold text-white" onClick={() => setStatus("closed")} type="button">
            Close poll
          </button>
          {overAudienceLimit && (
            <Link className="ml-3 inline-block rounded-full border border-blue-700 px-5 py-3 font-bold text-blue-700 no-underline" to="/my-subscription">
              Upgrade plan
            </Link>
          )}
        </section>
      )}
      {status === "closed" && (
        <section className="mt-7 max-w-3xl rounded-2xl border border-slate-200 bg-white p-5 sm:p-7">
          <span className="rounded-full bg-slate-100 px-2.5 py-1 font-bold text-slate-700 text-xs">CLOSED</span>
          <h2 className="mt-4 font-bold text-2xl">{question}</h2>
          <div className="mt-6 space-y-4">
            {[
              { label: options[0], percentage: 48 },
              { label: options[1], percentage: 34 },
              { label: options[2], percentage: 18 },
            ].map(({ label, percentage }) => (
              <div className="rounded-xl border border-slate-100 p-4" key={label}>
                <div className="flex justify-between text-sm">
                  <span>{label}</span>
                  <strong>{percentage}%</strong>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-blue-600" style={{ width: `${percentage}%` }} />
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

type LiveVoterStep = "register" | "waiting" | "quota" | "voting" | "thanks";

const getLiveVoterStep = ({ value }: { value: string | null }): LiveVoterStep => {
  if (value === "waiting" || value === "quota" || value === "voting" || value === "thanks") return value;
  return "register";
};

const LiveVoter = () => {
  const { search } = useLocation();
  const [step, setStep] = React.useState<LiveVoterStep>(() => getLiveVoterStep({ value: new URLSearchParams(search).get("state") }));
  const [choice, setChoice] = React.useState("");
  if (step === "register") {
    return (
      <main className="mx-auto min-h-[calc(100vh-58px)] max-w-[480px] bg-white px-5 py-8">
        <FiSmartphone className="text-3xl text-blue-700" />
        <h1 className="mt-5 font-bold text-3xl">Join Elena Rossi's live poll</h1>
        <p className="mt-2 text-slate-600">Provide details to confirm eligibility.</p>
        <form
          className="mt-6 grid gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            setStep("waiting");
          }}
        >
          <SelectField label="Gender" options={["Woman", "Man"]} />
          <Field label="Birth date" type="date" />
          <Field label="Gross annual income" type="number" />
          <Field label="City" />
          <Field label="Country" />
          <button className="rounded-full bg-blue-700 px-5 py-3 font-bold text-white" type="submit">
            Continue
          </button>
        </form>
      </main>
    );
  }
  if (step === "waiting") {
    return (
      <main className="mx-auto flex min-h-[calc(100vh-58px)] max-w-[480px] flex-col items-center justify-center bg-white px-5 text-center">
        <svg aria-label="Waiting for the poll to open" className="size-28 animate-pulse text-blue-600" viewBox="0 0 100 100">
          <circle cx="50" cy="50" fill="none" r="38" stroke="currentColor" strokeWidth="8" />
          <path d="M50 25v27l18 11" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="8" />
        </svg>
        <h1 className="mt-6 font-bold text-3xl">Waiting for the poll</h1>
        <p className="mt-2 text-slate-600">The creator will open it soon.</p>
        <button className="mt-6 font-bold text-blue-700" onClick={() => setStep("voting")} type="button">
          Poll is open
        </button>
      </main>
    );
  }
  if (step === "quota") {
    return (
      <main className="mx-auto flex min-h-screen max-w-[480px] flex-col items-center justify-center bg-white px-5 text-center">
        <FiUsers className="size-16 text-amber-600" />
        <h1 className="mt-5 font-bold text-3xl">Audience limit reached</h1>
        <p className="mt-2 font-semibold text-amber-700">Waiting the creator to increase the poll audience...</p>
      </main>
    );
  }
  if (step === "thanks")
    return (
      <main className="mx-auto flex min-h-[calc(100vh-58px)] max-w-[480px] flex-col items-center justify-center bg-white px-5 text-center">
        <FiCheck className="size-16 text-emerald-600" />
        <h1 className="mt-5 font-bold text-3xl">Thank you</h1>
        <p className="mt-2 text-slate-600">Your vote was recorded.</p>
      </main>
    );
  return (
    <main className="mx-auto min-h-[calc(100vh-58px)] max-w-[480px] bg-white px-5 py-8">
      <p className="font-bold text-blue-700 text-sm tracking-wider">LIVE POLL</p>
      <h1 className="mt-2 font-bold text-3xl">Which policy should open the forum?</h1>
      <div className="mt-7 space-y-3">
        {["Housing access", "Local transport", "Climate action"].map((option) => (
          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 p-4 has-checked:border-blue-600 has-checked:bg-blue-50" key={option}>
            <input checked={choice === option} name="live-vote" onChange={() => setChoice(option)} type="radio" />
            {option}
          </label>
        ))}
      </div>
      <button
        className="mt-7 w-full rounded-full bg-blue-700 px-5 py-3 font-bold text-white disabled:bg-slate-300"
        disabled={!choice}
        onClick={() => setStep("thanks")}
        type="button"
      >
        Submit vote
      </button>
    </main>
  );
};

const Groups = () => {
  const [groupTab, setGroupTab] = React.useState<"joined" | "managed">("joined");
  const visibleGroups = groups.filter((group) => (groupTab === "managed" ? group.owner : !group.owner && group.activeMember));
  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-7">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-bold text-blue-700 text-sm tracking-wider">ORGANISATIONS</p>
          <h1 className="mt-1 font-bold text-3xl lg:text-5xl">Your groups</h1>
        </div>
        <Link className="inline-flex items-center gap-2 rounded-full bg-blue-700 px-4 py-3 font-bold text-white no-underline" to="/my-groups/new">
          <FiPlus /> Create group
        </Link>
      </div>
      <section className="mt-7 rounded-2xl border border-slate-200 bg-white p-5 sm:p-7">
        <div className="flex border-slate-200 border-b">
          <button
            className={`px-4 py-2 font-bold text-sm ${groupTab === "joined" ? "border-blue-600 border-b-2 text-blue-700" : "text-slate-500"}`}
            onClick={() => setGroupTab("joined")}
            type="button"
          >
            Groups you belong to
          </button>
          <button
            className={`px-4 py-2 font-bold text-sm ${groupTab === "managed" ? "border-blue-600 border-b-2 text-blue-700" : "text-slate-500"}`}
            onClick={() => setGroupTab("managed")}
            type="button"
          >
            Groups you manage
          </button>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {visibleGroups.map((group) => (
            <article className="rounded-xl border border-slate-200 p-5" key={group.id}>
              <h2 className="font-bold text-lg">{group.name}</h2>
              <p className="mt-1 text-slate-600 text-sm">{group.description}</p>
              <p className="mt-4 font-semibold text-sm">
                {group.members} / {group.limit} members
              </p>
            </article>
          ))}
        </div>
        <div className="mt-8 text-center">
          <p className="text-slate-600 text-sm">Upgrade to create and manage private groups.</p>
          <Link className="mt-3 inline-block rounded-full bg-blue-700 px-4 py-2 font-bold text-sm text-white no-underline" to="/plans">
            Upgrade plan
          </Link>
        </div>
      </section>
    </main>
  );
};
const GroupNew = () => (
  <main className="mx-auto max-w-3xl px-4 py-8 sm:px-7">
    <Link className="font-bold text-slate-500 text-sm" to="/my-groups">
      ← Back to groups
    </Link>
    <h1 className="mt-5 font-bold text-3xl lg:text-5xl">Create group</h1>
    <form className="mt-7 space-y-6 rounded-2xl border border-slate-200 bg-white p-5 sm:p-7">
      <Field label="Group name" placeholder="e.g. Northstar Strategy" />
      <Field label="Description" placeholder="Purpose and audience" textarea />
      <label className="block font-semibold text-sm">
        Group image
        <div className="mt-1.5 flex items-center gap-3 rounded-xl border border-slate-300 border-dashed px-3 py-5 text-slate-500">
          <FiImage /> Upload image
        </div>
      </label>
      <Field label="Member emails" placeholder="ana@example.com&#10;luca@example.com" textarea />
      <label className="flex items-center gap-2 font-semibold text-sm">
        <input defaultChecked type="checkbox" /> Send invitation email
      </label>
      <button className="w-full rounded-full bg-blue-700 px-5 py-3 font-bold text-white" type="submit">
        Create private group
      </button>
    </form>
  </main>
);
const GroupDetail = () => {
  const { id } = useParams();
  const group = groupFor(id) ?? groups[0];
  const statusClass = (status: InvitationStatus) =>
    status === "Accepted" ? "bg-emerald-50 text-emerald-700" : status === "Rejected" ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700";
  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-7">
      <Link className="font-bold text-slate-500 text-sm" to="/my-groups">
        ← Back to groups
      </Link>
      <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-bold text-blue-700 text-sm tracking-wider">PRIVATE GROUP</p>
          <h1 className="mt-1 font-bold text-3xl lg:text-5xl">{group.name}</h1>
        </div>
        <span className="rounded-full bg-blue-50 px-3 py-1.5 font-bold text-blue-800 text-sm">
          {group.members} / {group.limit} members
        </span>
      </div>
      <section className="mt-7 grid gap-6 lg:grid-cols-[.8fr_1.2fr]">
        <form className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="font-bold text-xl">Group settings</h2>
          <Field label="Group name" placeholder={group.name} />
          <Field label="Description" placeholder={group.description} textarea />
          <button className="rounded-full bg-blue-700 px-4 py-2.5 font-bold text-white" type="submit">
            Save changes
          </button>
        </form>
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-xl">Invitations</h2>
            <button className="rounded-full border border-slate-300 px-3 py-1.5 font-bold text-sm" type="button">
              Invite members
            </button>
          </div>
          <div className="mt-4 divide-y divide-slate-100">
            {invitations.map((invitation) => (
              <div className="flex items-center justify-between gap-3 py-3 text-sm" key={invitation.email}>
                <span>{invitation.email}</span>
                <span className={`rounded-full px-2.5 py-1 font-bold text-xs ${statusClass(invitation.status)}`}>{invitation.status}</span>
              </div>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
};
const Register = () => {
  const navigate = useNavigate();
  return (
    <main className="mx-auto max-w-xl px-4 py-8 sm:px-7">
      <h1 className="font-bold text-3xl lg:text-5xl">Join voto</h1>
      <form
        className="mt-7 grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 sm:grid-cols-2"
        onSubmit={(event) => {
          event.preventDefault();
          localStorage.setItem(registrationStorageKey, "true");
          navigate("/my-profile");
        }}
      >
        <Field label="First name" />
        <Field label="Last name" />
        <Field label="Birth date" type="date" />
        <SelectField label="Gender" options={["Select gender", "Woman", "Man"]} />
        <Field label="City" />
        <Field label="Country" />
        <Field label="Gross annual income" type="number" />
        <Field label="Email" type="email" />
        <div className="sm:col-span-2">
          <Field label="Password" type="password" />
        </div>
        <button className="rounded-full bg-blue-700 px-5 py-3 font-bold text-white sm:col-span-2" type="submit">
          Create account
        </button>
      </form>
    </main>
  );
};

type PlanName = "Free" | "Small" | "Big" | "Unlimited";
type ProfilePlan = { price: string; groupLimit: string; liveLimit: string };

const profilePlans: Record<PlanName, ProfilePlan> = {
  Free: { price: "$0/mo", groupLimit: "No private groups", liveLimit: "100 live users" },
  Small: { price: "$9/mo", groupLimit: "100 members per group", liveLimit: "1,000 live users" },
  Big: { price: "$90/mo", groupLimit: "1,000 members per group", liveLimit: "10,000 live users" },
  Unlimited: { price: "$900/mo", groupLimit: "Unlimited group members", liveLimit: "Unlimited live users" },
};

const Profile = () => {
  const [plan, setPlan] = React.useState<PlanName>("Free");
  const currentPlan = profilePlans[plan];
  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-7">
      <h1 className="font-bold text-3xl lg:text-5xl">Profile</h1>
      <section className="mt-7 rounded-2xl border border-slate-200 bg-white p-5 sm:p-7">
        <h2 className="font-bold text-xl">Your information</h2>
        <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-slate-500">First name</dt>
            <dd className="font-bold">Elena</dd>
          </div>
          <div>
            <dt className="text-slate-500">Last name</dt>
            <dd className="font-bold">Rossi</dd>
          </div>
          <div>
            <dt className="text-slate-500">Birth date</dt>
            <dd className="font-bold">14 May 1992</dd>
          </div>
          <div>
            <dt className="text-slate-500">Gender</dt>
            <dd className="font-bold">Woman</dd>
          </div>
          <div>
            <dt className="text-slate-500">Gross annual income</dt>
            <dd className="font-bold">€38,000</dd>
          </div>
          <div>
            <dt className="text-slate-500">City and country</dt>
            <dd className="font-bold">Milan, Italy</dd>
          </div>
          <div>
            <dt className="text-slate-500">Email</dt>
            <dd className="font-bold">elena.rossi@example.com</dd>
          </div>
        </dl>
      </section>
      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 sm:p-7">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-bold text-xl">Your plan</h2>
            <h2 className="mt-1 font-bold text-2xl">{plan}</h2>
            <p className="mt-1 text-slate-500 text-sm">Valid until 28 September 2026</p>
          </div>
          <strong className="text-2xl">{currentPlan.price}</strong>
        </div>
        <div className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
          <p className="rounded-xl bg-slate-100 p-3">{currentPlan.groupLimit}</p>
          <p className="rounded-xl bg-slate-100 p-3">{currentPlan.liveLimit}</p>
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          {(Object.keys(profilePlans) as PlanName[]).map((planName) => (
            <button
              className="rounded-full border border-slate-300 px-4 py-2 font-bold text-sm disabled:border-blue-600 disabled:bg-blue-50 disabled:text-blue-800"
              disabled={planName === plan}
              key={planName}
              onClick={() => setPlan(planName)}
              type="button"
            >
              {planName === plan ? "Current plan" : `Switch to ${planName}`}
            </button>
          ))}
        </div>
      </section>
      <p className="mt-5 text-slate-600 text-sm">
        Public creator link:{" "}
        <Link className="font-bold text-blue-700" to="/u/1">
          voto.io/u/1
        </Link>
      </p>
    </main>
  );
};

const MyPolls = () => {
  const [pollTab, setPollTab] = React.useState<"created" | "voted">("created");
  const visiblePolls =
    pollTab === "created"
      ? polls.filter((poll) => poll.id === "board-priorities" || poll.id === "city-green")
      : polls.filter((poll) => poll.id === "night-buses" || poll.id === "school-meals");
  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-7">
      <h1 className="font-bold text-3xl lg:text-5xl">Your polls</h1>
      <div className="mt-7 flex border-slate-200 border-b">
        <button
          className={`px-4 py-2 font-bold text-sm ${pollTab === "created" ? "border-blue-600 border-b-2 text-blue-700" : "text-slate-500"}`}
          onClick={() => setPollTab("created")}
          type="button"
        >
          Polls you created
        </button>
        <button
          className={`px-4 py-2 font-bold text-sm ${pollTab === "voted" ? "border-blue-600 border-b-2 text-blue-700" : "text-slate-500"}`}
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
      </div>
    </main>
  );
};

const Settings = () => (
  <main className="mx-auto max-w-xl px-4 py-8 sm:px-7">
    <h1 className="font-bold text-3xl lg:text-5xl">Settings</h1>
    <form className="mt-7 space-y-6 rounded-2xl border border-slate-200 bg-white p-5 sm:p-7">
      <section>
        <h2 className="font-bold text-xl">Email</h2>
        <Field label="Email" placeholder="elena.rossi@example.com" type="email" />
        <button className="mt-4 rounded-full bg-blue-700 px-4 py-2 font-bold text-sm text-white" type="submit">
          Change email
        </button>
      </section>
      <section className="border-slate-200 border-t pt-6">
        <h2 className="font-bold text-xl">Password</h2>
        <Field label="Current password" type="password" />
        <div className="mt-4">
          <Field label="New password" type="password" />
        </div>
        <button className="mt-4 rounded-full bg-blue-700 px-4 py-2 font-bold text-sm text-white" type="submit">
          Change password
        </button>
      </section>
    </form>
  </main>
);

const Creator = () => {
  const [pollTab, setPollTab] = React.useState<"open" | "closed">("open");
  const visiblePolls = polls.filter((poll) => (pollTab === "open" ? memberCanAccess(poll) && poll.id !== "partner-review" : poll.id === "school-meals"));
  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-7">
      <p className="font-bold text-blue-700 text-sm tracking-wider">CREATOR</p>
      <h1 className="mt-1 font-bold text-3xl lg:text-5xl">Elena R.</h1>
      <div className="mt-7 flex border-slate-200 border-b">
        <button
          className={`px-4 py-2 font-bold text-sm ${pollTab === "open" ? "border-blue-600 border-b-2 text-blue-700" : "text-slate-500"}`}
          onClick={() => setPollTab("open")}
          type="button"
        >
          Open polls
        </button>
        <button
          className={`px-4 py-2 font-bold text-sm ${pollTab === "closed" ? "border-blue-600 border-b-2 text-blue-700" : "text-slate-500"}`}
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

export const Home = () => {
  const path = useLocation().pathname;
  const isLivePoll = path.startsWith("/live/");
  const isLiveVoter = path.endsWith("/join") && isLivePoll;
  let page = <Landing />;
  if (path.endsWith("/results")) page = <ResultsPage />;
  else if (path === "/poll/new") page = <CreatePoll />;
  else if (path.startsWith("/poll/")) page = <PollDetail />;
  else if (path === "/polls") page = <PollList />;
  else if (path === "/groups") page = <Groups />;
  else if (path === "/group/new") page = <GroupNew />;
  else if (path.startsWith("/group/")) page = <GroupDetail />;
  else if (path === "/register") page = <Register />;
  else if (path === "/profile") page = <Profile />;
  else if (path === "/my-polls") page = <MyPolls />;
  else if (path === "/settings") page = <Settings />;
  else if (path.startsWith("/creator/")) page = <Creator />;
  else if (isLiveVoter) page = <LiveVoter />;
  else if (path.startsWith("/live/")) page = <LivePoll />;
  return (
    <>
      {!isLivePoll && <Header />}
      {page}
    </>
  );
};
