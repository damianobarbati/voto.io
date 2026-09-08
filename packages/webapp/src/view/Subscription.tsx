import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import { LocalizedLink as Link } from "#webapp/components/LocalizedLink.tsx";
import { profilePlans } from "#webapp/components/PurchasePlans.tsx";
import { formatUsd } from "#webapp/i18n.ts";
import { planFromSearch } from "#webapp/lib/plans.ts";

export const Subscription = () => {
  const { i18n: translationI18n, t } = useTranslation();
  const locale = translationI18n.resolvedLanguage ?? translationI18n.language;
  const plan = planFromSearch(useLocation().search) ?? "Free";
  const currentPlan = profilePlans[plan];
  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-7">
      <h1 className="font-bold">Subscription</h1>
      <section className="mt-7 rounded-app border border-app-border bg-app-surface p-5 sm:p-7">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-bold">Current plan</h2>
            <p className="mt-1 font-bold">{plan}</p>
            <p className="mt-1 text-app-text-muted">{plan === "Free" ? "Valid forever" : "Valid until 28 September 2026"}</p>
          </div>
          <strong>
            {formatUsd({ amount: currentPlan.price, locale })}
            {t("ui.perMonth")}
          </strong>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <p className="rounded-app bg-app-subtle p-3">
            {currentPlan.groupLimit === "none"
              ? t("ui.noPrivateGroups")
              : currentPlan.groupLimit === "unlimited"
                ? t("ui.unlimitedGroupMembers")
                : t("ui.membersPerGroup", { count: new Intl.NumberFormat(locale).format(currentPlan.groupLimit) })}
          </p>
          <p className="rounded-app bg-app-subtle p-3">
            {currentPlan.liveLimit === "unlimited" ? t("ui.unlimitedLiveUsers") : t("ui.liveUsers", { count: new Intl.NumberFormat(locale).format(currentPlan.liveLimit) })}
          </p>
        </div>
        <Link className="mt-5 inline-block rounded-app bg-app-primary px-4 py-2 font-bold text-app-inverse no-underline" to="/plans">
          Change plan
        </Link>
      </section>
      <section className="mt-6 rounded-app border border-app-border bg-app-surface p-5 sm:p-7">
        <h2 className="font-bold">Payments</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-150 text-left">
            <thead className="border-app-border border-b text-app-text-muted">
              <tr>
                <th className="pr-4 pb-3">Date</th>
                <th className="pr-4 pb-3">Method</th>
                <th className="pr-4 pb-3">Plan</th>
                <th className="pr-4 pb-3">Amount</th>
                <th className="pb-3">Invoice</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="py-4 pr-4">15 July 2026</td>
                <td className="py-4 pr-4">Credit card</td>
                <td className="py-4 pr-4">Small</td>
                <td className="py-4 pr-4">$9</td>
                <td className="py-4">
                  <button className="font-bold text-app-primary" type="button">
                    Download invoice
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
};
