import z from "zod";

const pkg = import("../package.json", { with: { type: "json" } }) as unknown as { version: string };

const envSchema = z.object({
  NODE_ENV: z.enum(["test", "development", "production"]).default("development"),
  APP_BUILD: z.string().min(1), // git hash
  APP_VERSION: z.string().min(1).default(pkg.version), // package.json version
  APP_ENV: z.enum(["local", "development", "staging", "production"]),
  DEBUG: z.string().default(""),
  TZ: z.string().min(1),
  JWT_SECRET: z.string().min(1),
  DB_URI: z.string().min(1),
  CACHE_URI: z.string().min(1),
  CACHE_ENABLED: z.string().nullish().default("1").transform(Boolean),
});

const ENV = envSchema.parse(process.env);
export default ENV;
