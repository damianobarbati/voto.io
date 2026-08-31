import { Hono, type MiddlewareHandler } from "hono";
import { registerRoute } from "nano-fw/docs/index.ts";
import { z } from "zod";
import AuthService from "#api/auth/AuthService.ts";

const loggerMiddleware: MiddlewareHandler = async (c, next) => {
  console.log(`[${c.req.method}] ${c.req.url}`);
  await next();
};

const authMiddleware: MiddlewareHandler = async (c, next) => {
  const token = c.req.header("Authorization");
  if (!token) return c.json({ error: "Unauthorized" }, 401);
  await next();
};

export const router = new Hono();

// POST /auth/login
// curl localhost:8080/login -H "Content-Type: application/json" -d '{"email":"john.doe@gmail.com","password":"Password123!"}'
registerRoute(router, {
  method: "get",
  path: "/login",
  requestSchema: z.any(),
  responseSchema: z.any(),
  meta: { section: "Users", description: "Login with credentials." },
  middlewares: [loggerMiddleware],
  handler: (params) => AuthService.login(params),
});
