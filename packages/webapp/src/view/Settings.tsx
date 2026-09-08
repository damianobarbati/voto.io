import { Field } from "#webapp/ui/Field.tsx";

export const Settings = () => (
  <main className="mx-auto max-w-xl px-4 py-8 sm:px-7">
    <h1 className="font-bold">Settings</h1>
    <form className="mt-7 space-y-6 rounded-app border border-slate-200 bg-white p-5 sm:p-7">
      <section>
        <h2 className="font-bold">Email</h2>
        <Field label="Email" placeholder="elena.rossi@example.com" type="email" />
        <button className="mt-4 rounded-app bg-blue-700 px-4 py-2 font-bold text-white" type="submit">
          Change email
        </button>
      </section>
      <section className="border-slate-200 border-t pt-6">
        <h2 className="font-bold">Password</h2>
        <Field label="Current password" type="password" />
        <div className="mt-4">
          <Field label="New password" type="password" />
        </div>
        <button className="mt-4 rounded-app bg-blue-700 px-4 py-2 font-bold text-white" type="submit">
          Change password
        </button>
      </section>
    </form>
  </main>
);
