import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import useSWRMutation from "swr/mutation";
import { type UserLoginRequest, UserLoginRequestSchema, type UserLoginResponse, UserLoginResponseSchema } from "types/User.ts";
import { apiUrl } from "#webapp/env.ts";
import { useLocalizedNavigate as useNavigate } from "#webapp/hooks/useLocalizedNavigate.ts";
import { getUser, registrationStorageKey } from "#webapp/lib/auth.ts";
import { jwtStorageKey, store } from "#webapp/store.ts";

export const Login = () => {
  const navigate = useNavigate();
  const setUser = store.getState().setUser;
  const form = useForm<UserLoginRequest>({ resolver: zodResolver(UserLoginRequestSchema) });
  const { error, isMutating, trigger } = useSWRMutation(`${apiUrl}/login`, async (url: string, { arg }: { arg: UserLoginRequest }): Promise<UserLoginResponse> => {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(arg),
    });
    if (!response.ok) throw new Error("Invalid email or password");
    const body = await response.json();
    return UserLoginResponseSchema.parse(body);
  });

  const login = async (values: UserLoginRequest) => {
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
    <main className="mx-auto max-w-md px-4 py-8 sm:px-7">
      <h1 className="font-bold">Log in</h1>
      <form className="mt-7 space-y-5 rounded-app border border-app-border bg-app-surface p-5" onSubmit={form.handleSubmit(login)}>
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
        <label className="block font-semibold">
          Password
          <input
            autoComplete="current-password"
            className="mt-1.5 w-full rounded-app border border-app-border bg-app-surface px-3 py-2.5 font-normal"
            type="password"
            {...form.register("password")}
          />
          {form.formState.errors.password && <span className="mt-1 block font-normal text-app-danger">{form.formState.errors.password.message}</span>}
        </label>
        {error && <p className="text-app-danger">Invalid email or password</p>}
        <button
          className="rounded-app bg-app-primary px-5 py-3 font-bold text-app-inverse disabled:cursor-not-allowed disabled:bg-app-disabled"
          disabled={isMutating}
          type="submit"
        >
          Log in
        </button>
      </form>
    </main>
  );
};
