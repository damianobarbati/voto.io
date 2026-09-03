import { Hono, type MiddlewareHandler } from "hono";
import { HTTPException } from "hono/http-exception";
import { registerRoute } from "nano-fw/docs/index.ts";
import { PollCreateRequestSchema, PollListRequestSchema, PollResultsSchema, PollSchema, PollVoteRequestSchema } from "types/Poll.ts";
import { UserLoginRequestSchema, UserLoginResponseSchema, UserMeRequestSchema, UserRegisterRequestSchema, UserSchema } from "types/User.ts";
import { z } from "zod";
import AuthService from "#api/auth/AuthService.ts";
import PollService from "#api/poll/PollService.ts";

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

registerRoute(router, {
  method: "get",
  path: "/polls",
  requestSchema: PollListRequestSchema,
  responseSchema: PollSchema.array(),
  meta: { section: "Polls", description: "List polls." },
  middlewares: [loggerMiddleware],
  handler: () => PollService.list(),
});

registerRoute(router, {
  method: "post",
  path: "/polls",
  requestSchema: PollCreateRequestSchema,
  responseSchema: PollSchema,
  meta: { section: "Polls", description: "Create a poll.", visibility: "private" },
  middlewares: [loggerMiddleware],
  handler: async (params, context) => {
    const authorization = context.req.header("Authorization");
    if (!authorization) throw new HTTPException(401, { message: "Unauthorized" });
    const user = await AuthService.me({ authorization });
    const result = await PollService.create({ creatorId: user.id, poll: params });
    return result;
  },
});

const PollIdRequestSchema = z.object({ id: z.string().min(1) }).strict();
const PollVoteRouteRequestSchema = PollVoteRequestSchema.extend({ id: z.string().min(1) }).strict();

registerRoute(router, {
  method: "post",
  path: "/polls/:id/votes",
  requestSchema: PollVoteRouteRequestSchema,
  responseSchema: z.null(),
  meta: { section: "Polls", description: "Submit a poll ballot.", visibility: "private" },
  middlewares: [loggerMiddleware],
  handler: async ({ id, ...ballot }, context) => {
    const authorization = context.req.header("Authorization");
    if (!authorization) throw new HTTPException(401, { message: "Unauthorized" });
    const user = await AuthService.me({ authorization });
    await PollService.vote({ pollId: id, userId: user.id, ballot });
    return null;
  },
});

registerRoute(router, {
  method: "get",
  path: "/polls/:id/results",
  requestSchema: PollIdRequestSchema,
  responseSchema: PollResultsSchema,
  meta: { section: "Polls", description: "Get poll results." },
  middlewares: [loggerMiddleware],
  handler: (params) => PollService.results({ pollId: params.id }),
});

registerRoute(router, {
  method: "post",
  path: "/register",
  requestSchema: UserRegisterRequestSchema,
  responseSchema: UserLoginResponseSchema,
  meta: { section: "Users", description: "Register a user." },
  middlewares: [loggerMiddleware],
  handler: (params) => AuthService.register(params),
});

// curl localhost:8080/login -H "Content-Type: application/json" -d '{"email":"john.doe@gmail.com","password":"Password123!"}'
registerRoute(router, {
  method: "post",
  path: "/login",
  requestSchema: UserLoginRequestSchema,
  responseSchema: UserLoginResponseSchema,
  meta: { section: "Users", description: "Login with credentials." },
  middlewares: [loggerMiddleware],
  handler: (params) => AuthService.login(params),
});

// curl localhost:8080/me -H "Content-Type: application/json" -d '{"token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwYXQybzV0czEiLCJpYXQiOjE3ODgxODI0ODl9.Omr7E6Lk0TJmbmv3R99QPqVUAv8XJ_2IfcreU5n-i5w"}'
registerRoute(router, {
  method: "get",
  path: "/me",
  requestSchema: UserMeRequestSchema,
  responseSchema: UserSchema,
  meta: { section: "Users", description: "Get the authenticated user." },
  middlewares: [loggerMiddleware, authMiddleware],
  handler: (params) => AuthService.me(params),
});
