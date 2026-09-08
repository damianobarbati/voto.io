import { FiLock } from "react-icons/fi";
import type { Group } from "#webapp/lib/groups.ts";

type LockBadgeProps = { group: Group };

export const LockBadge = ({ group }: LockBadgeProps) => (
  <span className="inline-flex items-center gap-1 rounded-app bg-blue-50 px-2.5 py-1 font-bold text-blue-800">
    <FiLock /> Exclusive to {group.name}
  </span>
);
