import { FiUsers } from "react-icons/fi";
import { LocalizedLink as Link } from "#webapp/components/LocalizedLink.tsx";

type EmptyTabProps = { action: string; actionTo: string; message: string };

export const EmptyTab = ({ action, actionTo, message }: EmptyTabProps) => (
  <div className="col-span-full rounded-app border border-app-border border-dashed bg-app-subtle px-5 py-10 text-center">
    <FiUsers className="mx-auto size-6 text-app-text-muted" />
    <p className="mt-3 font-semibold text-app-text-muted">{message}</p>
    <Link className="mt-4 inline-block rounded-app bg-app-primary px-4 py-2 font-bold text-app-inverse no-underline" to={actionTo}>
      {action}
    </Link>
  </div>
);
