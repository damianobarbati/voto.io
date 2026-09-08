import { useParams } from "react-router-dom";
import { LocalizedLink as Link } from "#webapp/components/LocalizedLink.tsx";
import { groupFor, groups } from "#webapp/lib/groups.ts";
import { Field } from "#webapp/ui/Field.tsx";

type InvitationStatus = "Pending" | "Accepted" | "Rejected";

const invitations: { email: string; status: InvitationStatus }[] = [
  { email: "ana.rossi@example.com", status: "Accepted" },
  { email: "luca.bianchi@example.com", status: "Pending" },
  { email: "marco.verdi@example.com", status: "Rejected" },
  { email: "sofia.gallo@example.com", status: "Accepted" },
];

export const GroupDetail = () => {
  const { id } = useParams();
  const group = groupFor(id) ?? groups[0];
  const statusClass = (status: InvitationStatus) =>
    status === "Accepted" ? "bg-app-success-subtle text-app-success" : status === "Rejected" ? "bg-app-danger-subtle text-app-danger" : "bg-app-warning-subtle text-app-warning";
  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-7">
      <Link className="font-bold text-app-text-muted" to="/my-groups">
        ← Back to groups
      </Link>
      <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-bold text-app-primary tracking-wider">PRIVATE GROUP</p>
          <h1 className="mt-1 font-bold">{group.name}</h1>
        </div>
        <span className="rounded-app bg-app-info px-3 py-1.5 font-bold text-app-text">
          {group.members} / {group.limit} members
        </span>
      </div>
      <section className="mt-7 grid gap-6 lg:grid-cols-[.8fr_1.2fr]">
        <form className="space-y-4 rounded-app border border-app-border bg-app-surface p-5">
          <h2 className="font-bold">Group settings</h2>
          <Field label="Group name" placeholder={group.name} />
          <Field label="Description" placeholder={group.description} textarea />
          <button className="rounded-app bg-app-primary px-4 py-2.5 font-bold text-app-inverse" type="submit">
            Save changes
          </button>
        </form>
        <section className="rounded-app border border-app-border bg-app-surface p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-bold">Invitations</h2>
            <button className="rounded-app border border-app-border px-3 py-1.5 font-bold" type="button">
              Invite members
            </button>
          </div>
          <div className="mt-4 divide-y divide-slate-100">
            {invitations.map((invitation) => (
              <div className="flex items-center justify-between gap-3 py-3" key={invitation.email}>
                <span>{invitation.email}</span>
                <span className={`rounded-app px-2.5 py-1 font-bold ${statusClass(invitation.status)}`}>{invitation.status}</span>
              </div>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
};
