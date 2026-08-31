import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { HTTPException } from "hono/http-exception";
import { prettyJSON } from "hono/pretty-json";
import { trimTrailingSlash } from "hono/trailing-slash";
import { registerDocsRoute } from "nano-fw/docs/index.ts";
import { logger } from "#api/middleware/logger.ts";
import { transaction } from "#api/middleware/transaction.ts";
import { router } from "./routes.ts";

export const app = new Hono();
app.use(prettyJSON({ space: 2 }));
app.use(trimTrailingSlash());
app.use("*", cors({ origin: "http://localhost:3000" }));
app.use("*", transaction());
app.use("*", logger());

app.onError((error, c) => {
  c.error = error;
  if (error instanceof HTTPException) return error.getResponse();
  return c.text("Internal Server Error", 500);
});

// app routes
app.route("/", router);

// curl localhost:8080/healthcheck
app.get("/healthcheck", (ctx) => {
  const result = true;
  return ctx.json(result);
});

// serve api reference at /docs (markdowns in docs-assets)
const docsAssets = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../docs-assets");
registerDocsRoute(app, "/docs", docsAssets);

const is_main = import.meta.url === new URL(`file://${process.argv[1]}`).href;
if (is_main) serve({ fetch: app.fetch, port: 8080 }, () => console.log("Listening on 8080"));
