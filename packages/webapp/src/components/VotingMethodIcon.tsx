import { FiCheckSquare, FiDisc, FiList } from "react-icons/fi";
import type { VotingMethod } from "#webapp/lib/polls.ts";

type VotingMethodIconProps = { votingMethod: VotingMethod };

export const VotingMethodIcon = ({ votingMethod }: VotingMethodIconProps) => {
  const label = votingMethod;
  return (
    <details className="group relative shrink-0">
      <summary aria-label={label} className="list-none rounded-app p-1 text-blue-700 hover:bg-blue-50 [&::-webkit-details-marker]:hidden">
        {votingMethod === "One choice" && <FiDisc aria-hidden="true" />}
        {votingMethod === "Multiple choice" && <FiCheckSquare aria-hidden="true" />}
        {votingMethod === "Ranked choice" && <FiList aria-hidden="true" />}
      </summary>
      <span className="absolute top-full right-0 z-10 mt-1 hidden w-max max-w-40 rounded-app bg-slate-950 px-2 py-1 text-center font-semibold text-white shadow-lg group-open:block md:group-hover:block md:group-open:hidden">
        {label}
      </span>
    </details>
  );
};
