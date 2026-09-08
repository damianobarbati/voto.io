import { useTranslation } from "react-i18next";
import { LocalizedLink as Link } from "#webapp/components/LocalizedLink.tsx";
import { formatDate } from "#webapp/i18n.ts";
import { store } from "#webapp/store.ts";

export const Profile = () => {
  const { i18n: translationI18n } = useTranslation();
  const locale = translationI18n.resolvedLanguage ?? translationI18n.language;
  const user = store.getState().user;
  const firstName = user?.first_name ?? user?.name ?? "Elena";
  const lastName = user?.last_name ?? "Rossi";
  const birthDate = user
    ? new Intl.DateTimeFormat(locale, { day: "numeric", month: "long", year: "numeric" }).format(new Date(user.birth_date))
    : formatDate({ date: "1992-05-14", locale });
  const gender = user?.gender === "f" ? "Woman" : user?.gender === "m" ? "Man" : "Not specified";
  const income = user?.income === null || user?.income === undefined ? "Not specified" : new Intl.NumberFormat(locale, { style: "currency", currency: "EUR" }).format(user.income);
  const cityAndCountry = user?.city && user.country ? `${user.city}, ${user.country}` : "Milan, Italy";
  const email = user?.email ?? "elena.rossi@example.com";
  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-7">
      <h1 className="font-bold">Profile</h1>
      <section className="mt-7 rounded-app border border-slate-200 bg-white p-5 sm:p-7">
        <h2 className="font-bold">Your information</h2>
        <dl className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-slate-500">First name</dt>
            <dd className="font-bold">{firstName}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Last name</dt>
            <dd className="font-bold">{lastName}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Birth date</dt>
            <dd className="font-bold">{birthDate}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Gender</dt>
            <dd className="font-bold">{gender}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Gross annual income</dt>
            <dd className="font-bold">{income}</dd>
          </div>
          <div>
            <dt className="text-slate-500">City and country</dt>
            <dd className="font-bold">{cityAndCountry}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Email</dt>
            <dd className="font-bold">{email}</dd>
          </div>
        </dl>
      </section>
      <p className="mt-5 text-slate-600">
        Public creator link:{" "}
        <Link className="font-bold text-blue-700" to="/u/1">
          voto.io/u/1
        </Link>
      </p>
    </main>
  );
};
