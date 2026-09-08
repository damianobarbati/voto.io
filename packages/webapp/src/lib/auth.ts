import { UserSchema } from "types/User.ts";
import { apiUrl } from "#webapp/env.ts";

export const registrationStorageKey = "voto.registered";

export const getUser = async ({ token }: { token: string }) => {
  const response = await fetch(`${apiUrl}/me`, { headers: { Authorization: `Bearer ${token}` } });
  if (!response.ok) throw new Error("Unable to retrieve the user");
  const body = await response.json();
  const result = UserSchema.parse(body);
  return result;
};
