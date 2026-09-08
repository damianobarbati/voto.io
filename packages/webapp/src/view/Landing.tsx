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
      <section className="bg-app-text px-6 py-12 text-app-inverse sm:px-7 sm:py-20">
        <div className="mx-auto grid max-w-6xl items-center gap-8 lg:grid-cols-2">
          <div>
            <p className="font-bold text-app-info tracking-wider">{t("landing.eyebrow")}</p>
            <h1 className="mt-3 max-w-3xl font-bold text-app-inverse tracking-tight">{t("landing.title")}</h1>
            <p className="mt-5 max-w-xl text-app-info">Create trusted public, private, and live polls. Set eligibility rules, collect votes, and share clear results.</p>
            <div className="mt-8 flex gap-3">
              <Link className="rounded-app bg-app-accent px-5 py-3 font-bold text-app-text no-underline hover:bg-app-info" to="/register">
                {t("landing.primary")}
              </Link>
              <Link className="rounded-app border border-app-text-muted px-5 py-3 font-bold text-app-inverse no-underline hover:border-app-inverse" to="/plans">
                {t("landing.plans")}
              </Link>
            </div>
            <p className="mt-4 text-app-text-muted">Start free. Upgrade when your decisions need more reach.</p>
          </div>
          <div className="rounded-app border border-app-accent/40 bg-app-text p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <p className="font-bold text-app-info tracking-wider">LIVE DECISION</p>
              <span className="rounded-app bg-app-accent px-2.5 py-1 font-bold text-app-text">OPEN</span>
            </div>
            <h2 className="mt-5 font-bold text-app-inverse">Which project should receive the next budget?</h2>
            <div className="mt-6 space-y-3">
              {["Plant 1,000 new trees", "Create community gardens", "Build a small urban forest"].map((option, index) => (
                <div className="rounded-app border border-app-text-muted bg-app-text px-4 py-3" key={option}>
                  <div className="flex items-center justify-between gap-4">
                    <span>{option}</span>
                    <strong className="text-app-info">{[56, 29, 15][index]}%</strong>
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-5 text-app-text-muted">1,248 verified votes · 72% turnout</p>
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
            <div className="rounded-app border border-app-border bg-app-surface p-4" key={title}>
              <p className="font-bold text-app-text">{title}</p>
              <p className="mt-1 text-app-text-muted">{description}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-7">
        <div className="max-w-2xl">
          <p className="font-bold text-app-primary tracking-wider">BUILT FOR PARTICIPATION</p>
          <h2 className="mt-2 font-bold">One place for every kind of decision.</h2>
          <p className="mt-3 text-app-text-muted">Choose the right voting format, reach the right people, and turn participation into a result that everyone can understand.</p>
        </div>
        <div className="mt-7 grid gap-4 md:grid-cols-3">
          <article className="rounded-app border border-app-border bg-app-surface p-5 shadow-sm">
            <FiUsers className="size-6 text-app-primary" />
            <h3 className="mt-4 font-bold">Public decisions</h3>
            <p className="mt-2 text-app-text-muted">Publish a question, invite your community, and keep every response easy to follow.</p>
          </article>
          <article className="rounded-app border border-app-border bg-app-surface p-5 shadow-sm">
            <FiLock className="size-6 text-app-primary" />
            <h3 className="mt-4 font-bold">Private organisation voting</h3>
            <p className="mt-2 text-app-text-muted">Limit participation to verified group members and apply the eligibility rules your decision needs.</p>
          </article>
          <article className="rounded-app border border-app-border bg-app-surface p-5 shadow-sm">
            <FiSmartphone className="size-6 text-app-primary" />
            <h3 className="mt-4 font-bold">Live voting</h3>
            <p className="mt-2 text-app-text-muted">Bring a room to a decision with quick, phone-first polls and visible turnout.</p>
          </article>
        </div>
      </section>
      <section className="bg-app-subtle px-4 py-12 sm:px-7">
        <div className="mx-auto max-w-6xl">
          <p className="font-bold text-app-primary tracking-wider">HOW IT WORKS</p>
          <h2 className="mt-2 font-bold">From question to decision in three steps.</h2>
          <div className="mt-7 grid gap-4 md:grid-cols-3">
            {[
              ["01", "Create", "Set the question, choices, and voting method."],
              ["02", "Reach the right voters", "Share publicly, invite a group, or set eligibility rules."],
              ["03", "Act on the result", "Follow turnout and share a clear final outcome."],
            ].map(([number, title, description]) => (
              <div className="rounded-app bg-app-surface p-5" key={number}>
                <p className="font-bold text-app-primary">{number}</p>
                <h3 className="mt-3 font-bold">{title}</h3>
                <p className="mt-2 text-app-text-muted">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-7">
        <div className="rounded-app bg-app-text p-6 text-app-inverse sm:p-10">
          <p className="font-bold text-app-info tracking-wider">DECISIONS PEOPLE CAN TRUST</p>
          <div className="mt-5 grid gap-5 md:grid-cols-3">
            <div>
              <FiCheck className="size-5 text-app-info" />
              <h3 className="mt-3 font-bold text-app-inverse">Eligibility rules</h3>
              <p className="mt-1 text-app-info">Target voters by group, location, and profile criteria.</p>
            </div>
            <div>
              <FiCheck className="size-5 text-app-info" />
              <h3 className="mt-3 font-bold text-app-inverse">Protected participation</h3>
              <p className="mt-1 text-app-info">Keep high-value decisions within the right community.</p>
            </div>
            <div>
              <FiBarChart2 className="size-5 text-app-info" />
              <h3 className="mt-3 font-bold text-app-inverse">Clear reporting</h3>
              <p className="mt-1 text-app-info">See turnout, votes, and outcomes without extra work.</p>
            </div>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-7">
        <h2 className="font-bold">{t("landing.whyTitle")}</h2>
        <p className="mt-4 max-w-4xl text-app-text-muted leading-7">{t("landing.whyDescription")}</p>
      </section>
      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-7">
        <div className="flex items-end justify-between">
          <h2 className="mt-1 font-bold">{t("landing.polls")}</h2>
          <Link className="font-bold text-app-primary" to="/poll/list">
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
          <p className="font-bold text-app-primary tracking-wider">{t("ui.plans")}</p>
          <h2 className="mt-1 font-bold">{t("ui.pricingTitle")}</h2>
          <p className="mt-3 text-app-text-muted">{t("ui.pricingDescription")}</p>
        </div>
        <PurchasePlans className="mt-7" />
      </section>
    </>
  );
};
