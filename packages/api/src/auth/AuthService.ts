import { createHmac } from "node:crypto";
import { HTTPException } from "hono/http-exception";
import { type User, type UserLoginRequest, type UserLoginResponse, UserLoginResponseSchema, type UserRow } from "types/User.ts";
import { verifyPassword } from "#api/auth/password.ts";
import ENV from "#api/env.ts";
import UserRepository from "#api/user/UserRepository.ts";

const INVALID_CREDENTIALS_ERROR = "Invalid email or password";

const toUser = ({ password_hash: _passwordHash, ...user }: UserRow): User => user;

const createToken = ({ id }: User): string => {
  const encodedHeader = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const encodedPayload = Buffer.from(JSON.stringify({ sub: id, iat: Math.floor(Date.now() / 1000) })).toString("base64url");
  const signature = createHmac("sha256", ENV.JWT_SECRET).update(`${encodedHeader}.${encodedPayload}`).digest("base64url");
  return `${encodedHeader}.${encodedPayload}.${signature}`;
};

export default class AuthService {
  static async login({ email, password }: UserLoginRequest): Promise<UserLoginResponse> {
    const userRow = await UserRepository.findBy({ email });
    if (!userRow || !(await verifyPassword({ password, passwordHash: userRow.password_hash }))) {
      throw new HTTPException(401, { message: INVALID_CREDENTIALS_ERROR });
    }

    const user = toUser(userRow);
    return UserLoginResponseSchema.parse({ user, token: createToken(user) });
  }
}
