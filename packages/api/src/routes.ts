import { Hono, type MiddlewareHandler } from "hono";
import { HTTPException } from "hono/http-exception";
import { streamSSE } from "hono/streaming";
import { registerRoute } from "nano-fw/docs/index.ts";
import {
  LivePollAttendeeRequestSchema,
  LivePollAttendeeSchema,
  LivePollCreateRequestSchema,
  PollCreateRequestSchema,
  PollListRequestSchema,
  PollResultsSchema,
  PollSchema,
  PollVoteRequestSchema,
} from "types/Poll.ts";
import {
  UserEmailUpdateRequestSchema,
  UserLoginRequestSchema,
  UserLoginResponseSchema,
  UserMeRequestSchema,
  UserPasswordUpdateRequestSchema,
  UserRegisterRequestSchema,
  UserSchema,
} from "types/User.ts";
import { z } from "zod";
import AuthService from "#api/auth/AuthService.ts";
import PollService from "#api/poll/PollService.ts";

const authMiddleware: MiddlewareHandler = async (c, next) => {
  const authorization = c.req.header("Authorization");
  if (!authorization) return c.json({ error: "Unauthorized" }, 401);
  c.set("auth_params", { authorization });
  await next();
};

export const router = new Hono();

const PingRequestSchema = z.record(z.string(), z.unknown());
const UserEmailUpdateBodySchema = UserEmailUpdateRequestSchema.omit({ authorization: true });
const UserPasswordUpdateBodySchema = UserPasswordUpdateRequestSchema.omit({ authorization: true });

registerRoute(router, {
  method: "post",
  path: "/ping",
  requestSchema: PingRequestSchema,
  responseSchema: PingRequestSchema,
  meta: { section: "System", description: "Echo a JSON payload." },
  middlewares: [],
  handler: (params) => {
    const result = params;
    return result;
  },
});

registerRoute(router, {
  method: "put",
  path: "/me/email",
  requestSchema: UserEmailUpdateBodySchema,
  responseSchema: UserSchema,
  meta: { section: "Users", description: "Change email.", visibility: "private" },
  middlewares: [],
  handler: (params, context) => AuthService.changeEmail({ ...params, authorization: context.req.header("Authorization") ?? "" }),
});
registerRoute(router, {
  method: "put",
  path: "/me/password",
  requestSchema: UserPasswordUpdateBodySchema,
  responseSchema: z.null(),
  meta: { section: "Users", description: "Change password.", visibility: "private" },
  middlewares: [],
  handler: async (params, context) => {
    await AuthService.changePassword({ ...params, authorization: context.req.header("Authorization") ?? "" });
    return null;
  },
});

registerRoute(router, {
  method: "get",
  path: "/polls",
  requestSchema: PollListRequestSchema,
  responseSchema: PollSchema.array(),
  meta: { section: "Polls", description: "List polls." },
  middlewares: [],
  handler: () => PollService.list(),
});

const PollIdRequestSchema = z.object({ id: z.string().min(1) }).strict();

registerRoute(router, {
  method: "get",
  path: "/polls/:id",
  requestSchema: PollIdRequestSchema,
  responseSchema: PollSchema,
  meta: { section: "Polls", description: "Get poll." },
  middlewares: [],
  handler: ({ id }) => PollService.get({ pollId: id }),
});

registerRoute(router, {
  method: "post",
  path: "/polls",
  requestSchema: PollCreateRequestSchema,
  responseSchema: PollSchema,
  meta: { section: "Polls", description: "Create a poll.", visibility: "private" },
  middlewares: [],
  handler: async (params, context) => {
    const authorization = context.req.header("Authorization");
    if (!authorization) throw new HTTPException(401, { message: "Unauthorized" });
    const user = await AuthService.me({ authorization });
    const result = await PollService.create({ creatorId: user.id, poll: params });
    return result;
  },
});

const PollVoteRouteRequestSchema = PollVoteRequestSchema.extend({ id: z.string().min(1) }).strict();
const LivePollVoteRequestSchema = PollVoteRequestSchema.extend({ id: z.string().min(1) }).strict();

registerRoute(router, {
  method: "post",
  path: "/polls/:id/votes",
  requestSchema: PollVoteRouteRequestSchema,
  responseSchema: z.null(),
  meta: { section: "Polls", description: "Submit a poll ballot.", visibility: "private" },
  middlewares: [],
  handler: async ({ id, ...ballot }, context) => {
    const authorization = context.req.header("Authorization");
    if (!authorization) throw new HTTPException(401, { message: "Unauthorized" });
    const user = await AuthService.me({ authorization });
    await PollService.vote({ pollId: id, userId: user.id, ballot });
    return null;
  },
});

registerRoute(router, {
  method: "post",
  path: "/live-polls",
  requestSchema: LivePollCreateRequestSchema,
  responseSchema: PollSchema,
  meta: { section: "Live polls", description: "Create live poll.", visibility: "private" },
  middlewares: [],
  handler: async (params, context) => {
    const authorization = context.req.header("Authorization");
    if (!authorization) throw new HTTPException(401, { message: "Unauthorized" });
    const user = await AuthService.me({ authorization });
    return await PollService.createLive({ creatorId: user.id, poll: params });
  },
});
registerRoute(router, {
  method: "post",
  path: "/live-polls/:id/open",
  requestSchema: PollIdRequestSchema,
  responseSchema: PollSchema,
  meta: { section: "Live polls", description: "Open live poll.", visibility: "private" },
  middlewares: [],
  handler: async ({ id }, context) => {
    const authorization = context.req.header("Authorization");
    if (!authorization) throw new HTTPException(401, { message: "Unauthorized" });
    const user = await AuthService.me({ authorization });
    return await PollService.openLive({ creatorId: user.id, pollId: id });
  },
});
registerRoute(router, {
  method: "post",
  path: "/live-polls/:id/attendees",
  requestSchema: LivePollAttendeeRequestSchema.extend({ id: z.string().min(1) }).strict(),
  responseSchema: LivePollAttendeeSchema,
  meta: { section: "Live polls", description: "Join live poll." },
  middlewares: [],
  handler: ({ id, token }) => PollService.joinLive({ pollId: id, token }),
});
registerRoute(router, {
  method: "post",
  path: "/live-polls/:id/votes",
  requestSchema: LivePollVoteRequestSchema,
  responseSchema: z.null(),
  meta: { section: "Live polls", description: "Vote in live poll." },
  middlewares: [],
  handler: async ({ id, ...ballot }, context) => {
    const attendeeToken = context.req.header("x-live-attendee-token");
    if (!attendeeToken) throw new HTTPException(401, { message: "Unauthorized" });
    await PollService.voteLive({ pollId: id, attendeeToken, ballot });
    return null;
  },
});
router.get("/live-polls/:id/events", async (context) => {
  const poll = await PollService.get({ pollId: context.req.param("id") });
  return streamSSE(context, async (stream) => {
    await stream.writeSSE({ event: "poll", data: JSON.stringify(poll) });
    await stream.sleep(60_000);
  });
});

registerRoute(router, {
  method: "get",
  path: "/polls/:id/results",
  requestSchema: PollIdRequestSchema,
  responseSchema: PollResultsSchema,
  meta: { section: "Polls", description: "Get poll results." },
  middlewares: [],
  handler: (params) => PollService.results({ pollId: params.id }),
});

registerRoute(router, {
  method: "post",
  path: "/register",
  requestSchema: UserRegisterRequestSchema,
  responseSchema: UserLoginResponseSchema,
  meta: { section: "Users", description: "Register a user." },
  middlewares: [],
  handler: (params) => AuthService.register(params),
});

// curl localhost:8080/login -H "Content-Type: application/json" -d '{"email":"john.doe@gmail.com","password":"Password123!"}'
registerRoute(router, {
  method: "post",
  path: "/login",
  requestSchema: UserLoginRequestSchema,
  responseSchema: UserLoginResponseSchema,
  meta: { section: "Users", description: "Login with credentials." },
  middlewares: [],
  handler: (params) => AuthService.login(params),
});

// curl localhost:8080/me -H "Content-Type: application/json" -d '{"token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwYXQybzV0czEiLCJpYXQiOjE3ODgxODI0ODl9.Omr7E6Lk0TJmbmv3R99QPqVUAv8XJ_2IfcreU5n-i5w"}'
registerRoute(router, {
  method: "get",
  path: "/me",
  requestSchema: UserMeRequestSchema,
  responseSchema: UserSchema,
  meta: { section: "Users", description: "Get the authenticated user." },
  middlewares: [authMiddleware],
  handler: (params) => AuthService.me(params),
});
