import React from "react";
import { FiCheck, FiX } from "react-icons/fi";
import { type PollCreateRequest, PollSchema } from "types/Poll.ts";
import { LocalizedLink as Link } from "#webapp/components/LocalizedLink.tsx";
import { apiUrl } from "#webapp/env.ts";
import { useLocalizedNavigate as useNavigate } from "#webapp/hooks/useLocalizedNavigate.ts";
import { groupFor, groups } from "#webapp/lib/groups.ts";
import type { VotingMethod } from "#webapp/lib/polls.ts";
import { jwtStorageKey, store } from "#webapp/store.ts";
import { Field } from "#webapp/ui/Field.tsx";
import { SelectField } from "#webapp/ui/SelectField.tsx";

const countryScopeOptions = ["Worldwide", "Australia (AU)", "Canada (CA)", "France (FR)", "Germany (DE)", "Italy (IT)", "Spain (ES)", "United Kingdom (GB)", "United States (US)"];

export const CreatePoll = () => {
  const navigate = useNavigate();
  const user = store.getState().user;
  const [options, setOptions] = React.useState(["", ""]);
  const [method, setMethod] = React.useState<VotingMethod>("One choice");
  const [groupId, setGroupId] = React.useState("Public");
  const [countryScope, setCountryScope] = React.useState("Worldwide");
  const [error, setError] = React.useState("");
  const automaticNoChoice = method !== "Ranked choice";
  const ownedGroups = groups.filter((group) => group.owner);
  const isUnlimited = user?.plan_id === "unlimited";
  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const token = localStorage.getItem(jwtStorageKey);
    if (!token) {
      navigate("/login");
      return;
    }
    const fields = new FormData(event.currentTarget);
    const country = countryScope.match(/\(([A-Z]{2})\)$/)?.[1];
    const poll: PollCreateRequest = {
      name: String(fields.get("name") ?? "").trim(),
      description: String(fields.get("description") ?? "").trim(),
      opens_at: new Date(String(fields.get("opens_at"))).toISOString(),
      closes_at: new Date(String(fields.get("closes_at"))).toISOString(),
      type: method === "One choice" ? "single_choice" : method === "Multiple choice" ? "multiple_choice" : "ranked_choice",
      ranked_method: method === "Ranked choice" ? "irv" : null,
      gender_restriction: fields.get("gender") === "Women" ? "f" : fields.get("gender") === "Men" ? "m" : null,
      age_min: null,
      age_max: null,
      gross_income_min: fields.get("income") ? Number(fields.get("income")) : null,
      gross_income_max: null,
      cities: String(fields.get("cities") ?? "")
        .split(",")
        .map((city) => city.trim())
        .filter(Boolean),
      countries: isUnlimited ? (country ? [country] : []) : user?.country ? [user.country] : [],
      group_id: groupId === "Public" ? null : groupId,
      is_live: false,
      options: options.map((option) => option.trim()).filter(Boolean),
    };
    const response = await fetch(`${apiUrl}/polls`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(poll),
    });
    if (!response.ok) {
      setError("Unable to publish poll");
      return;
    }
    const createdPoll = PollSchema.parse(await response.json());
    navigate(`/poll/${createdPoll.id}`);
  };
  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-7">
      <Link className="font-bold text-app-text-muted" to="/poll/list">
        ← Back to polls
      </Link>
      <h1 className="mt-5 font-bold">Create a poll</h1>
      <form className="mt-7 space-y-6 rounded-app border border-app-border bg-app-surface p-5 sm:p-7" onSubmit={submit}>
        <fieldset className="space-y-4">
          {/*<legend className="font-bold">Poll details</legend>*/}
          <Field label="Poll name" name="name" placeholder="e.g. Q4 strategic priorities" required />
          <Field label="Description" name="description" placeholder="Essential decision context" required textarea />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Opening date" name="opens_at" required type="datetime-local" />
            <Field label="Closing date" name="closes_at" required type="datetime-local" />
          </div>
        </fieldset>
        <fieldset>
          {/*<legend className="font-bold">Voting method</legend>*/}
          <SelectField
            label="Voting method"
            onChange={(event) => setMethod(event.target.value as VotingMethod)}
            options={["One choice", "Multiple choice", "Ranked choice"]}
            value={method}
          />
        </fieldset>
        <fieldset>
          {/*<legend className="font-bold">Voting options</legend>*/}
          <label className="block font-semibold">Options</label>
          <div className="mt-2 space-y-2">
            {options.map((option, index) => (
              <label className="flex gap-2" key={`option-${index}`}>
                <input
                  className="grow rounded-app border border-app-border px-3 py-2.5"
                  onChange={(event) => setOptions(options.map((value, optionIndex) => (optionIndex === index ? event.target.value : value)))}
                  placeholder={`Option ${index + 1}`}
                  value={option}
                />
                {options.length > 2 && (
                  <button
                    aria-label={`Remove option ${index + 1}`}
                    className="p-2 text-app-text-muted"
                    onClick={() => setOptions(options.filter((_, optionIndex) => optionIndex !== index))}
                    type="button"
                  >
                    <FiX />
                  </button>
                )}
              </label>
            ))}
          </div>
          {automaticNoChoice && (
            <div className="mt-2 flex items-center gap-2 rounded-app border border-app-info bg-app-info px-3 py-2.5 text-app-text">
              <FiCheck /> No suitable option. <span className="ml-auto font-bold">Automatic</span>
            </div>
          )}
          {options.length < 5 && (
            <button className="mt-3 font-bold text-app-primary" onClick={() => setOptions([...options, ""])} type="button">
              + Add option
            </button>
          )}
          <p className="mt-2 text-app-text-muted">One-choice and multiple-choice polls require at least two options.</p>
        </fieldset>
        <fieldset className="space-y-3">
          {/*<legend className="font-bold">Access control</legend>*/}
          <SelectField
            label="Who can view and vote"
            name="group"
            onChange={(event) => setGroupId(event.target.value === "Public" ? "Public" : (ownedGroups.find((group) => group.name === event.target.value)?.id ?? "Public"))}
            options={["Public", ...ownedGroups.map((group) => group.name)]}
            value={groupId === "Public" ? "Public" : groupFor(groupId)?.name}
          />
          <p className="text-app-text-muted">Private polls require an active group membership and all demographic requirements.</p>
        </fieldset>
        <fieldset>
          {/*<legend className="font-bold">Eligible voters</legend>*/}
          <div className="grid gap-3 sm:grid-cols-2">
            <SelectField label="Gender" name="gender" options={["Any gender", "Women", "Men"]} />
            <Field label="Minimum income" name="income" type="number" />
            <Field label="City or cities" name="cities" />
            {isUnlimited ? (
              <SelectField
                label="Country scope"
                name="country_scope"
                onChange={(event) => setCountryScope(event.target.value)}
                options={countryScopeOptions}
                value={countryScope}
              />
            ) : (
              <p className="self-end text-app-text-muted">Country: {user?.country ?? "Not specified"}</p>
            )}
          </div>
        </fieldset>
        {error && <p className="text-app-danger">{error}</p>}
        <button className="w-full rounded-app bg-app-primary px-5 py-3 font-bold text-app-inverse hover:bg-app-primary-hover" type="submit">
          Publish poll
        </button>
      </form>
    </main>
  );
};
