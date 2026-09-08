import type { Poll } from "#webapp/lib/polls.ts";

export type Group = { id: string; name: string; description: string; members: number; limit: number | "Unlimited"; owner: boolean; activeMember: boolean };

export const groups: Group[] = [
  { id: "northstar", name: "Northstar Strategy", description: "Leadership and planning", members: 46, limit: 100, owner: true, activeMember: true },
  { id: "milan-labour", name: "Milan Labour Council", description: "Member decisions", members: 328, limit: 1000, owner: false, activeMember: true },
  { id: "vendors", name: "Partner Council", description: "Approved partner review", members: 86, limit: 100, owner: false, activeMember: false },
];

export const groupFor = (groupId: string | undefined) => groups.find((group) => group.id === groupId);

export const memberCanAccess = (poll: Poll) => !poll.groupId || groupFor(poll.groupId)?.activeMember === true;
