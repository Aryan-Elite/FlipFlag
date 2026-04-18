import { Router } from "express";
import { getFlagsForSdkKey } from "../../db/queries.js";

const router = Router();

// ─── Bucketing ────────────────────────────────────────────────────────────────
// Turns (flagKey + userId) into a stable number 0–99.
// Same user + same flag always lands in the same bucket → no flicker.

function getBucket(flagKey, userId) {
  let hash = 2166136261; // FNV offset basis
  const str = flagKey + userId;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = (hash * 16777619) >>> 0; // keep 32-bit unsigned
  }
  return hash % 100;
}

// ─── Evaluation ───────────────────────────────────────────────────────────────

function evaluateFlag(flag, userContext) {
  const { userId, attributes = {} } = userContext;

  // Kill switch — flag is globally off
  if (!flag.is_active) return false;

  // Evaluate rules top-to-bottom (already sorted by priority ASC from DB)
  for (const rule of flag.rules) {
    const userValue = attributes[rule.field_name];

    // Condition check: does user's attribute match this rule's values?
    if (!rule.values.includes(userValue)) continue; // no match → try next rule

    // Rule matched — now check rollout
    if (rule.rollout_percent !== null) {
      if (!userId) continue; // can't hash without userId → passthrough
      if (getBucket(flag.key, userId) < rule.rollout_percent) return rule.serve; // selected → STOP
      continue; // not selected → passthrough to next rule
    }

    // No rollout → all matched users get serve value immediately
    return rule.serve;
  }

  // No rules matched → fall back to flag's default_rollout
  if (flag.default_rollout > 0) {
    if (!userId) return false;
    return getBucket(flag.key, userId) < flag.default_rollout;
  }

  return false;
}

// ─── Route ────────────────────────────────────────────────────────────────────

router.post("/sdk/flags", async (req, res) => {
  const sdkKey = req.headers["x-sdk-key"];
  if (!sdkKey) return res.status(401).json({ error: "Missing X-SDK-Key header" });

  const { userContext = {} } = req.body;

  const flags = await getFlagsForSdkKey(sdkKey);
  if (!flags.length) return res.status(404).json({ error: "Invalid SDK key or no flags found" });

  const result = {};
  for (const flag of flags) {
    result[flag.key] = evaluateFlag(flag, userContext);
  }

  res.json({ flags: result });
});

export default router;
