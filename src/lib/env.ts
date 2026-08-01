import { z } from "zod";

/**
 * Runtime environment validation. Import this anywhere you need env vars, it
 * fails fast with a readable error instead of surfacing `undefined` deep in a
 * request. Ingestion-only fields are optional so scripts can run with less.
 */
const schema = z.object({
  DATABASE_URL: z.string().url(),
  DIRECT_URL: z.string().url().optional(),

  AUTH_SECRET: z.string().min(1).optional(),
  AUTH_GITHUB_ID: z.string().optional(),
  AUTH_GITHUB_SECRET: z.string().optional(),

  GITHUB_TOKEN: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),

  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  console.error(
    "❌ Invalid environment variables:",
    parsed.error.flatten().fieldErrors,
  );
  throw new Error("Invalid environment variables, see .env.example");
}

export const env = parsed.data;
