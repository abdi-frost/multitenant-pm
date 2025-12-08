import { z } from "zod";

// Define the shape of required environment variables.
const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  NEXT_PUBLIC_CORE_URL: z.string().url(),
  NEXT_PUBLIC_PM_URL: z.string().url(),
});

type Env = z.infer<typeof envSchema>;

const _safe = envSchema.safeParse(process.env);

if (!_safe.success) {
  console.error("Environment validation failed:", _safe.error.format());
  throw new Error("Invalid or missing environment variables. See server logs for details.");
}

export const env: Env = _safe.data;

export default env;
