import { FiImage } from "react-icons/fi";
import { LocalizedLink as Link } from "#webapp/components/LocalizedLink.tsx";
import { Field } from "#webapp/ui/Field.tsx";

export const GroupNew = () => (
  <main className="mx-auto max-w-3xl px-4 py-8 sm:px-7">
    <Link className="font-bold text-app-text-muted" to="/my-groups">
      ← Back to groups
    </Link>
    <h1 className="mt-5 font-bold">Create group</h1>
    <form className="mt-7 space-y-6 rounded-app border border-app-border bg-app-surface p-5 sm:p-7">
      <Field label="Group name" placeholder="e.g. Northstar Strategy" />
      <Field label="Description" placeholder="Purpose and audience" textarea />
      <label className="block font-semibold">
        Group image
        <div className="mt-1.5 flex items-center gap-3 rounded-app border border-app-border border-dashed px-3 py-5 text-app-text-muted">
          <FiImage /> Upload image
        </div>
      </label>
      <Field label="Member emails" placeholder="ana@example.com&#10;luca@example.com" textarea />
      <label className="flex items-center gap-2 font-semibold">
        <input defaultChecked type="checkbox" /> Send invitation email
      </label>
      <button className="w-full rounded-app bg-app-primary px-5 py-3 font-bold text-app-inverse" type="submit">
        Create private group
      </button>
    </form>
  </main>
);
