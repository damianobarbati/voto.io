import { Hono, type MiddlewareHandler } from "hono";
import { registerRoute } from "nano-fw/docs/index.ts";
import { UserLoginRequestSchema, UserLoginResponseSchema, UserMeRequestSchema, UserSchema } from "types/User.ts";
import AuthService from "#api/auth/AuthService.ts";

const loggerMiddleware: MiddlewareHandler = async (c, next) => {
  console.log(`[${c.req.method}] ${c.req.url}`);
  await next();
};

const authMiddleware: MiddlewareHandler = async (c, next) => {
  const authorization = c.req.header("Authorization");
  if (!authorization) return c.json({ error: "Unauthorized" }, 401);
  c.set("auth_params", { authorization });
  await next();
};

export const router = new Hono();

// curl localhost:8080/login -H "Content-Type: application/json" -d '{"email":"john.doe@gmail.com","password":"Password123!"}'
registerRoute(router, {
  method: "post",
  path: "/login",
  requestSchema: UserLoginRequestSchema,
  responseSchema: UserLoginResponseSchema,
  meta: { section: "Users", description: "Get the authenticated user." },
  middlewares: [loggerMiddleware],
  handler: (params) => AuthService.login(params),
});

// curl localhost:8080/me -H "Content-Type: application/json" -d '{"token":""}'
registerRoute(router, {
  method: "get",
  path: "/me",
  requestSchema: UserMeRequestSchema,
  responseSchema: UserSchema,
  meta: { section: "Users", description: "Get the authenticated user." },
  middlewares: [loggerMiddleware, authMiddleware],
  handler: (params) => AuthService.me(params),
});
