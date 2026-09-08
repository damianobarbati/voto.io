import { useTranslation } from "react-i18next";
import { FiBarChart2, FiCheck, FiLock, FiSmartphone, FiUsers } from "react-icons/fi";
import { LocalizedLink as Link } from "#webapp/components/LocalizedLink.tsx";
import { PollCard } from "#webapp/components/PollCard.tsx";
import { PurchasePlans } from "#webapp/components/PurchasePlans.tsx";
import { usePolls } from "#webapp/hooks/usePolls.ts";
import { memberCanAccess } from "#webapp/lib/groups.ts";
import { Spinner } from "#webapp/ui/Spinner.tsx";

export const Landing = () => {
  const { t } = useTranslation();
  const { data: polls = [], isLoading } = usePolls();
  return (
    <>
      <section className="bg-app-text px-6 py-12 text-white sm:px-7 sm:py-20">
        <div className="mx-auto grid max-w-6xl items-center gap-8 lg:grid-cols-2">
          <div>
            <p className="font-bold text-blue-200 tracking-wider">{t("landing.eyebrow")}</p>
            <h1 className="mt-3 max-w-3xl font-bold text-white tracking-tight">{t("landing.title")}</h1>
            <p className="mt-5 max-w-xl text-slate-300">Create trusted public, private, and live polls. Set eligibility rules, collect votes, and share clear results.</p>
            <div className="mt-8 flex gap-3">
              <Link className="rounded-app bg-blue-500 px-5 py-3 font-bold text-white no-underline hover:bg-blue-400" to="/register">
                {t("landing.primary")}
              </Link>
              <Link className="rounded-app border border-slate-600 px-5 py-3 font-bold text-white no-underline hover:border-white" to="/plans">
                {t("landing.plans")}
              </Link>
            </div>
            <p className="mt-4 text-slate-400">Start free. Upgrade when your decisions need more reach.</p>
          </div>
          <div className="rounded-app border border-blue-400/40 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <p className="font-bold text-blue-200 tracking-wider">LIVE DECISION</p>
              <span className="rounded-app bg-blue-500 px-2.5 py-1 font-bold">OPEN</span>
            </div>
            <h2 className="mt-5 font-bold text-white">Which project should receive the next budget?</h2>
            <div className="mt-6 space-y-3">
              {["Plant 1,000 new trees", "Create community gardens", "Build a small urban forest"].map((option, index) => (
                <div className="rounded-app border border-slate-700 bg-slate-800 px-4 py-3" key={option}>
                  <div className="flex items-center justify-between gap-4">
                    <span>{option}</span>
                    <strong className="text-blue-200">{[56, 29, 15][index]}%</strong>
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-5 text-slate-400">1,248 verified votes · 72% turnout</p>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-7">
        <div className="grid gap-4 text-center sm:grid-cols-4">
          {[
            ["Public polls", "Invite anyone to take part"],
            ["Private groups", "Decide with verified members"],
            ["Live polls", "Make decisions in the room"],
            ["Clear results", "Track votes and turnout"],
          ].map(([title, description]) => (
            <div className="rounded-app border border-slate-200 bg-white p-4" key={title}>
              <p className="font-bold text-slate-900">{title}</p>
              <p className="mt-1 text-slate-600">{description}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-7">
        <div className="max-w-2xl">
          <p className="font-bold text-blue-700 tracking-wider">BUILT FOR PARTICIPATION</p>
          <h2 className="mt-2 font-bold">One place for every kind of decision.</h2>
          <p className="mt-3 text-slate-600">Choose the right voting format, reach the right people, and turn participation into a result that everyone can understand.</p>
        </div>
        <div className="mt-7 grid gap-4 md:grid-cols-3">
          <article className="rounded-app border border-slate-200 bg-white p-5 shadow-sm">
            <FiUsers className="size-6 text-blue-700" />
            <h3 className="mt-4 font-bold">Public decisions</h3>
            <p className="mt-2 text-slate-600">Publish a question, invite your community, and keep every response easy to follow.</p>
          </article>
          <article className="rounded-app border border-slate-200 bg-white p-5 shadow-sm">
            <FiLock className="size-6 text-blue-700" />
            <h3 className="mt-4 font-bold">Private organisation voting</h3>
            <p className="mt-2 text-slate-600">Limit participation to verified group members and apply the eligibility rules your decision needs.</p>
          </article>
          <article className="rounded-app border border-slate-200 bg-white p-5 shadow-sm">
            <FiSmartphone className="size-6 text-blue-700" />
            <h3 className="mt-4 font-bold">Live voting</h3>
            <p className="mt-2 text-slate-600">Bring a room to a decision with quick, phone-first polls and visible turnout.</p>
          </article>
        </div>
      </section>
      <section className="bg-slate-100 px-4 py-12 sm:px-7">
        <div className="mx-auto max-w-6xl">
          <p className="font-bold text-blue-700 tracking-wider">HOW IT WORKS</p>
          <h2 className="mt-2 font-bold">From question to decision in three steps.</h2>
          <div className="mt-7 grid gap-4 md:grid-cols-3">
            {[
              ["01", "Create", "Set the question, choices, and voting method."],
              ["02", "Reach the right voters", "Share publicly, invite a group, or set eligibility rules."],
              ["03", "Act on the result", "Follow turnout and share a clear final outcome."],
            ].map(([number, title, description]) => (
              <div className="rounded-app bg-white p-5" key={number}>
                <p className="font-bold text-blue-700">{number}</p>
                <h3 className="mt-3 font-bold">{title}</h3>
                <p className="mt-2 text-slate-600">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-7">
        <div className="rounded-app bg-slate-950 p-6 text-white sm:p-10">
          <p className="font-bold text-blue-200 tracking-wider">DECISIONS PEOPLE CAN TRUST</p>
          <div className="mt-5 grid gap-5 md:grid-cols-3">
            <div>
              <FiCheck className="size-5 text-blue-300" />
              <h3 className="mt-3 font-bold text-white">Eligibility rules</h3>
              <p className="mt-1 text-slate-300">Target voters by group, location, and profile criteria.</p>
            </div>
            <div>
              <FiCheck className="size-5 text-blue-300" />
              <h3 className="mt-3 font-bold text-white">Protected participation</h3>
              <p className="mt-1 text-slate-300">Keep high-value decisions within the right community.</p>
            </div>
            <div>
              <FiBarChart2 className="size-5 text-blue-300" />
              <h3 className="mt-3 font-bold text-white">Clear reporting</h3>
              <p className="mt-1 text-slate-300">See turnout, votes, and outcomes without extra work.</p>
            </div>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-7">
        <h2 className="font-bold">{t("landing.whyTitle")}</h2>
        <p className="mt-4 max-w-4xl text-slate-600 leading-7">{t("landing.whyDescription")}</p>
      </section>
      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-7">
        <div className="flex items-end justify-between">
          <h2 className="mt-1 font-bold">{t("landing.polls")}</h2>
          <Link className="font-bold text-blue-700" to="/poll/list">
            {t("landing.allPolls")}
          </Link>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {isLoading && <Spinner />}
          {[...polls]
            .filter(memberCanAccess)
            .sort((firstPoll, secondPoll) => secondPoll.votes - firstPoll.votes)
            .slice(0, 6)
            .map((poll) => (
              <PollCard key={poll.id} poll={poll} />
            ))}
        </div>
      </main>
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-7">
        <div className="max-w-2xl">
          <p className="font-bold text-blue-700 tracking-wider">{t("ui.plans")}</p>
          <h2 className="mt-1 font-bold">{t("ui.pricingTitle")}</h2>
          <p className="mt-3 text-slate-600">{t("ui.pricingDescription")}</p>
        </div>
        <PurchasePlans className="mt-7" />
      </section>
    </>
  );
};
