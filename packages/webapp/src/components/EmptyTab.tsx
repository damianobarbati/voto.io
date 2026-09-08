import { FiUsers } from "react-icons/fi";
import { LocalizedLink as Link } from "#webapp/components/LocalizedLink.tsx";

type EmptyTabProps = { action: string; actionTo: string; message: string };

export const EmptyTab = ({ action, actionTo, message }: EmptyTabProps) => (
  <div className="col-span-full rounded-app border border-slate-200 border-dashed bg-slate-50 px-5 py-10 text-center">
    <FiUsers className="mx-auto size-6 text-slate-400" />
    <p className="mt-3 font-semibold text-slate-700">{message}</p>
    <Link className="mt-4 inline-block rounded-app bg-blue-700 px-4 py-2 font-bold text-white no-underline" to={actionTo}>
      {action}
    </Link>
  </div>
);
