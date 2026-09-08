import { useTranslation } from "react-i18next";
import { LocalizedLink as Link } from "#webapp/components/LocalizedLink.tsx";
import { formatUsd } from "#webapp/i18n.ts";

export type PlanName = "Free" | "Small" | "Big" | "Unlimited";
export type ProfilePlan = { countryScope: string; price: number; groupLimit: number | "none" | "unlimited"; liveLimit: number | "unlimited" };

export const profilePlans: Record<PlanName, ProfilePlan> = {
  Free: { price: 0, groupLimit: "none", liveLimit: 100, countryScope: "Polls limited to your country" },
  Small: { price: 9, groupLimit: 100, liveLimit: 1000, countryScope: "Polls limited to your country" },
  Big: { price: 90, groupLimit: 1000, liveLimit: 10000, countryScope: "Polls limited to your country" },
  Unlimited: { price: 900, groupLimit: "unlimited", liveLimit: "unlimited", countryScope: "Choose any country or worldwide polls" },
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
          <article className="flex flex-col rounded-app border border-app-border bg-app-surface p-5 shadow-sm" key={planName}>
            <h3 className="font-bold">{planName}</h3>
            <p className="mt-2 font-bold">
              {formatUsd({ amount: plan.price, locale })}
              {t("ui.perMonth")}
            </p>
            <p className="mt-5 text-app-text-muted">{formatLimit(plan.groupLimit, "group")}</p>
            <p className="mt-2 text-app-text-muted">{formatLimit(plan.liveLimit, "live")}</p>
            <p className="mt-2 text-app-text-muted">{plan.countryScope}</p>
            <Link
              className="mt-6 inline-block rounded-app bg-app-primary px-4 py-2 text-center font-bold text-app-inverse no-underline hover:bg-app-primary-hover"
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
