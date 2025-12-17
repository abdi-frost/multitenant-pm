import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";
import { nextCookies } from "better-auth/next-js";

export const auth = betterAuth({

  advanced: {
    defaultCookieAttributes: {
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    }
  },

  database: drizzleAdapter(db, {
    provider: "pg",
  }),

  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
  },

  session: {
    // we’ll adjust this later if needed
    // expiresIn: 10, // 10 seconds for testing
    expiresIn: 60 * 60 * 24 * 7, // 7 days
  },

  user: {
    // we will heavily customize user roles later
    modelName: "users",
    additionalFields: {
      role: {
        type: "string",
        input: false
      },
      approved: {
        type: "boolean",
        input: false
      },
      tenantId: {
        type: "string",
        input: false
      },
      metadata: {
        type: "json",
        input: false
      }
    }
  },

  // Trusted Origns
  trustedOrigins: [
    process.env.CORE_API_URL || "http://localhost:3000",
    process.env.PM_APP_URL || "http://localhost:3001",
    process.env.ADMIN_APP_URL || "http://localhost:3002",
  ],

  plugins: [nextCookies()]
});

export type Session = typeof auth.$Infer.Session 