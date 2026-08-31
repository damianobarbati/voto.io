import { HTTPException } from "hono/http-exception";
import { UserLoginRequestSchema, type UserLoginResponse } from "types/User.ts";
import AuthService from "#api/auth/AuthService.ts";

const INVALID_LOGIN_REQUEST_ERROR = "Invalid login request";

export default class UserController {
  static async login({ body }: { body: unknown }): Promise<UserLoginResponse> {
    const parsedBody = UserLoginRequestSchema.safeParse(body);
    if (!parsedBody.success) throw new HTTPException(400, { message: INVALID_LOGIN_REQUEST_ERROR });
    return await AuthService.login(parsedBody.data);
  }
}
