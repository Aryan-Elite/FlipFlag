import { betterAuth } from "better-auth";
import { PostgresDialect } from "kysely";
import { pool } from "../db/client.js";

export const auth = betterAuth({
  database: { dialect: new PostgresDialect({ pool }), type: "postgresql" },
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3001",
  secret: process.env.BETTER_AUTH_SECRET,
  trustedOrigins: [
    process.env.FRONTEND_URL || "http://localhost:3000",
  ],
  advanced: {
    disableCsrfCheck: process.env.NODE_ENV !== "production",
  },
  account: {
    skipStateCookieCheck: true,
  },
  emailAndPassword: { enabled: true },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    },
  },
});
