import { type PlanName, profilePlans } from "#webapp/components/PurchasePlans.tsx";

export const planFromSearch = (search: string) => {
  const plan = new URLSearchParams(search).get("plan");
  return (Object.keys(profilePlans) as PlanName[]).find((planName) => planName.toLowerCase() === plan);
};
