import { Router } from "express";
import { randomBytes } from "crypto";
import { pool } from "../../db/client.js";
import { auth } from "../../lib/auth.js";

const router = Router();

// Called by better-auth after OAuth completes (via callbackURL)
// Reads the session cookie, generates a short-lived exchange token,
// and redirects to the frontend /auth/callback page with that token.
// This is needed for Firefox (Total Cookie Protection) — the session
// cookie set during the Google redirect is in the wrong partition.
// By redirecting here first and having the frontend exchange the token
// via XHR, the session cookie gets set in Amplify's partition.
router.get("/api/auth/google-done", async (req, res) => {
  const frontendURL = process.env.FRONTEND_URL || "http://localhost:3000";

  const session = await auth.api.getSession({
    headers: new Headers({ cookie: req.headers.cookie || "" }),
  });

  if (!session?.session) {
    return res.redirect(`${frontendURL}/login?error=no_session`);
  }

  const match = (req.headers.cookie || "").match(
    /__Secure-better-auth\.session_token=([^;]+)/
  );
  const sessionCookieValue = match ? decodeURIComponent(match[1]) : null;

  if (!sessionCookieValue) {
    return res.redirect(`${frontendURL}/login?error=no_session`);
  }

  const exchangeToken = randomBytes(32).toString("hex");
  const id = randomBytes(16).toString("hex");
  const expiresAt = new Date(Date.now() + 60 * 1000);

  await pool.query(
    `INSERT INTO verification (id, identifier, value, "expiresAt", "createdAt", "updatedAt")
     VALUES ($1, $2, $3, $4, NOW(), NOW())`,
    [id, `oauth_exchange_${exchangeToken}`, sessionCookieValue, expiresAt]
  );

  res.redirect(`${frontendURL}/auth/callback?token=${exchangeToken}`);
});

// Frontend calls this via XHR after landing on /auth/callback
// Sets the session cookie in the XHR response — now in Amplify's partition in Firefox
router.post("/api/auth/exchange", async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ error: "Missing token" });

  const { rows } = await pool.query(
    `SELECT value, "expiresAt" FROM verification WHERE identifier = $1`,
    [`oauth_exchange_${token}`]
  );

  if (!rows[0]) return res.status(400).json({ error: "Invalid token" });
  if (new Date(rows[0].expiresAt) < new Date()) {
    await pool.query(`DELETE FROM verification WHERE identifier = $1`, [
      `oauth_exchange_${token}`,
    ]);
    return res.status(400).json({ error: "Token expired" });
  }

  const sessionCookieValue = rows[0].value;

  await pool.query(`DELETE FROM verification WHERE identifier = $1`, [
    `oauth_exchange_${token}`,
  ]);

  res.setHeader(
    "Set-Cookie",
    `__Secure-better-auth.session_token=${encodeURIComponent(sessionCookieValue)}; Max-Age=604800; Path=/; HttpOnly; Secure; SameSite=None`
  );

  res.json({ success: true });
});

export default router;
