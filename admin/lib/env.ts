import { z } from "zod";

// Define the shape of required environment variables.
// Edit this schema to match the variables your app actually requires.
const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().min(1).describe("Database connection string"),
  NEXT_PUBLIC_CORE_URL: z.string().url().optional(),
  NEXT_PUBLIC_PM_URL: z.string().url().optional(),
  NEXT_PUBLIC_BASE_URL: z.string().url().optional(),
  PORT: z.preprocess((val: number | string | undefined) => {
    if (typeof val === "string" && val.length) return Number(val);
    if (typeof val === "number") return val;
    return undefined;
  }, z.number().optional()),
});

type Env = z.infer<typeof envSchema>;

const _safe = envSchema.safeParse(process.env);

if (!_safe.success) {
  // Print a helpful, readable error then throw to fail fast on startup.
  // Use JSON stringify for any unknown structure.
  // `format()` returns a nested record with messages.
  // Log to console for dev visibility, then throw.
  // Keep messages short for production safety.
  // eslint-disable-next-line no-console
  console.error("Environment validation failed:", _safe.error.format());
  throw new Error("Invalid or missing environment variables. See server logs for details.");
}

export const env: Env = _safe.data;

export default env;
