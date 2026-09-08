import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import useSWRMutation from "swr/mutation";
import { type UserLoginResponse, UserLoginResponseSchema, type UserRegisterRequest, UserRegisterRequestSchema } from "types/User.ts";
import { LocalizedLink as Link } from "#webapp/components/LocalizedLink.tsx";
import { apiUrl } from "#webapp/env.ts";
import { useLocalizedNavigate as useNavigate } from "#webapp/hooks/useLocalizedNavigate.ts";
import { i18n } from "#webapp/i18n.ts";
import { getUser, registrationStorageKey } from "#webapp/lib/auth.ts";
import { jwtStorageKey, store } from "#webapp/store.ts";

export const Register = () => {
  const navigate = useNavigate();
  const setUser = store.getState().setUser;
  const form = useForm<UserRegisterRequest>({
    defaultValues: { language: (i18n.resolvedLanguage ?? "en") as UserRegisterRequest["language"] },
    resolver: zodResolver(UserRegisterRequestSchema),
  });
  const { error, isMutating, trigger } = useSWRMutation(`${apiUrl}/register`, async (url: string, { arg }: { arg: UserRegisterRequest }): Promise<UserLoginResponse> => {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(arg),
    });
    if (!response.ok) throw new Error("Unable to create account");
    const body = await response.json();
    return UserLoginResponseSchema.parse(body);
  });

  const registerUser = async (values: UserRegisterRequest) => {
    try {
      const token = await trigger(values);
      const user = await getUser({ token });
      setUser(user);
      localStorage.setItem(jwtStorageKey, token);
      localStorage.setItem(registrationStorageKey, "true");
      navigate("/my-profile");
    } catch {}
  };

  return (
    <main className="mx-auto max-w-xl px-4 py-8 sm:px-7">
      <h1 className="font-bold">Join voto</h1>
      <form className="mt-7 grid gap-4 rounded-app border border-app-border bg-app-surface p-5 sm:grid-cols-2" onSubmit={form.handleSubmit(registerUser)}>
        <label className="block font-semibold">
          First name
          <input className="mt-1.5 w-full rounded-app border border-app-border bg-app-surface px-3 py-2.5 font-normal" {...form.register("first_name")} />
          {form.formState.errors.first_name && <span className="mt-1 block font-normal text-app-danger">{form.formState.errors.first_name.message}</span>}
        </label>
        <label className="block font-semibold">
          Last name
          <input className="mt-1.5 w-full rounded-app border border-app-border bg-app-surface px-3 py-2.5 font-normal" {...form.register("last_name")} />
          {form.formState.errors.last_name && <span className="mt-1 block font-normal text-app-danger">{form.formState.errors.last_name.message}</span>}
        </label>
        <label className="block font-semibold">
          Birth date
          <input className="mt-1.5 w-full rounded-app border border-app-border bg-app-surface px-3 py-2.5 font-normal" type="date" {...form.register("birth_date")} />
          {form.formState.errors.birth_date && <span className="mt-1 block font-normal text-app-danger">{form.formState.errors.birth_date.message}</span>}
        </label>
        <label className="block font-semibold">
          Gender
          <select className="mt-1.5 w-full rounded-app border border-app-border bg-app-surface px-3 py-2.5 font-normal" {...form.register("gender")}>
            <option value="">Select gender</option>
            <option value="f">Woman</option>
            <option value="m">Man</option>
          </select>
          {form.formState.errors.gender && <span className="mt-1 block font-normal text-app-danger">{form.formState.errors.gender.message}</span>}
        </label>
        <label className="block font-semibold">
          City
          <input className="mt-1.5 w-full rounded-app border border-app-border bg-app-surface px-3 py-2.5 font-normal" {...form.register("city")} />
          {form.formState.errors.city && <span className="mt-1 block font-normal text-app-danger">{form.formState.errors.city.message}</span>}
        </label>
        <label className="block font-semibold">
          Country
          <input className="mt-1.5 w-full rounded-app border border-app-border bg-app-surface px-3 py-2.5 font-normal" maxLength={2} {...form.register("country")} />
          {form.formState.errors.country && <span className="mt-1 block font-normal text-app-danger">{form.formState.errors.country.message}</span>}
        </label>
        <label className="block font-semibold">
          Gross annual income
          <input
            className="mt-1.5 w-full rounded-app border border-app-border bg-app-surface px-3 py-2.5 font-normal"
            min="0"
            type="number"
            {...form.register("income", { valueAsNumber: true })}
          />
          {form.formState.errors.income && <span className="mt-1 block font-normal text-app-danger">{form.formState.errors.income.message}</span>}
        </label>
        <label className="block font-semibold">
          Email
          <input
            autoComplete="email"
            className="mt-1.5 w-full rounded-app border border-app-border bg-app-surface px-3 py-2.5 font-normal"
            type="email"
            {...form.register("email")}
          />
          {form.formState.errors.email && <span className="mt-1 block font-normal text-app-danger">{form.formState.errors.email.message}</span>}
        </label>
        <label className="block font-semibold sm:col-span-2">
          Password
          <input
            autoComplete="new-password"
            className="mt-1.5 w-full rounded-app border border-app-border bg-app-surface px-3 py-2.5 font-normal"
            type="password"
            {...form.register("password")}
          />
          {form.formState.errors.password && <span className="mt-1 block font-normal text-app-danger">{form.formState.errors.password.message}</span>}
        </label>
        <input type="hidden" {...form.register("language")} />
        {error && <p className="text-app-danger sm:col-span-2">Unable to create account</p>}
        <button
          className="rounded-app bg-app-primary px-5 py-3 font-bold text-app-inverse disabled:cursor-not-allowed disabled:bg-app-disabled sm:col-span-2"
          disabled={isMutating}
          type="submit"
        >
          Create account
        </button>
        <p className="text-center text-app-text-muted sm:col-span-2">
          Already registered?{" "}
          <Link className="font-bold text-app-primary" to="/login">
            Log in
          </Link>
        </p>
      </form>
    </main>
  );
};
