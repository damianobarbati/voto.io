import { Link } from "react-router-dom";

export type PlanName = "Free" | "Small" | "Big" | "Unlimited";
export type ProfilePlan = { price: string; groupLimit: string; liveLimit: string };

export const profilePlans: Record<PlanName, ProfilePlan> = {
  Free: { price: "$0/mo", groupLimit: "No private groups", liveLimit: "100 live users" },
  Small: { price: "$9/mo", groupLimit: "100 members per group", liveLimit: "1,000 live users" },
  Big: { price: "$90/mo", groupLimit: "1,000 members per group", liveLimit: "10,000 live users" },
  Unlimited: { price: "$900/mo", groupLimit: "Unlimited group members", liveLimit: "Unlimited live users" },
};

type PurchasePlansProps = { className?: string };

export const PurchasePlans = ({ className = "" }: PurchasePlansProps) => (
  <div className={`grid gap-4 md:grid-cols-3 ${className}`}>
    {(["Small", "Big", "Unlimited"] as PlanName[]).map((planName) => {
      const plan = profilePlans[planName];
      return (
        <article className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" key={planName}>
          <h3 className="font-bold text-2xl">{planName}</h3>
          <p className="mt-2 font-bold text-xl">{plan.price}</p>
          <p className="mt-5 text-slate-600 text-sm">{plan.groupLimit}</p>
          <p className="mt-2 text-slate-600 text-sm">{plan.liveLimit}</p>
          <Link
            className="mt-6 inline-block rounded-full bg-blue-700 px-4 py-2 text-center font-bold text-sm text-white no-underline hover:bg-blue-600"
            to={`/checkout?plan=${planName.toLowerCase()}`}
          >
            Select plan
          </Link>
        </article>
      );
    })}
  </div>
);
