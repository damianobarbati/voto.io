import { FiLock } from "react-icons/fi";
import { LocalizedLink as Link } from "#webapp/components/LocalizedLink.tsx";
import type { Group } from "#webapp/lib/groups.ts";

type AccessDeniedProps = { group: Group };

export const AccessDenied = ({ group }: AccessDeniedProps) => (
  <main className="mx-auto max-w-xl px-4 py-20 text-center">
    <div className="mx-auto flex size-14 items-center justify-center rounded-app bg-red-50 text-red-700">
      <FiLock className="size-6" />
    </div>
    <h1 className="mt-5 font-bold">Access denied</h1>
    <p className="mt-3 text-slate-600">This poll is restricted to members of {group.name}.</p>
    <Link className="mt-7 inline-block rounded-app bg-blue-700 px-5 py-3 font-bold text-white no-underline" to="/my-groups">
      View your groups
    </Link>
  </main>
);
