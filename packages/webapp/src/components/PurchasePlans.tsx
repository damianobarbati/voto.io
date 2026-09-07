import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { formatUsd } from "#webapp/i18n.ts";

export type PlanName = "Free" | "Small" | "Big" | "Unlimited";
export type ProfilePlan = { price: number; groupLimit: number | "none" | "unlimited"; liveLimit: number | "unlimited" };

export const profilePlans: Record<PlanName, ProfilePlan> = {
  Free: { price: 0, groupLimit: "none", liveLimit: 100 },
  Small: { price: 9, groupLimit: 100, liveLimit: 1000 },
  Big: { price: 90, groupLimit: 1000, liveLimit: 10000 },
  Unlimited: { price: 900, groupLimit: "unlimited", liveLimit: "unlimited" },
};

type PurchasePlansProps = { className?: string };

export const PurchasePlans = ({ className = "" }: PurchasePlansProps) => {
  const { i18n, t } = useTranslation();
  const locale = i18n.resolvedLanguage ?? i18n.language;
  const formatLimit = (limit: ProfilePlan["groupLimit"], kind: "group" | "live") => {
    if (limit === "none") return t("ui.noPrivateGroups");
    if (limit === "unlimited") return t(kind === "group" ? "ui.unlimitedGroupMembers" : "ui.unlimitedLiveUsers");
    return t(kind === "group" ? "ui.membersPerGroup" : "ui.liveUsers", { count: new Intl.NumberFormat(locale).format(limit) });
  };
  return (
    <div className={`grid gap-4 md:grid-cols-3 ${className}`}>
      {(["Small", "Big", "Unlimited"] as PlanName[]).map((planName) => {
        const plan = profilePlans[planName];
        return (
          <article className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" key={planName}>
            <h3 className="font-bold text-2xl">{planName}</h3>
            <p className="mt-2 font-bold text-xl">
              {formatUsd({ amount: plan.price, locale })}
              {t("ui.perMonth")}
            </p>
            <p className="mt-5 text-slate-600 text-sm">{formatLimit(plan.groupLimit, "group")}</p>
            <p className="mt-2 text-slate-600 text-sm">{formatLimit(plan.liveLimit, "live")}</p>
            <Link
              className="mt-6 inline-block rounded-full bg-blue-700 px-4 py-2 text-center font-bold text-sm text-white no-underline hover:bg-blue-600"
              to={`/checkout?plan=${planName.toLowerCase()}`}
            >
              {t("ui.selectPlan")}
            </Link>
          </article>
        );
      })}
    </div>
  );
};
