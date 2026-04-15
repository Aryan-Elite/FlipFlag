import { Router } from "express";
import { requireAuth } from "../middlewares/auth.js";
import {
  getFlagsByEnvironmentId,
  createFlag,
  toggleFlag,
  deleteFlag,
  getFlagWithConfig,
  updateFlag,
  updateFlagConfig,
  getRulesByFlagConfigId,
  createRule,
  updateRule,
  deleteRule,
} from "../../db/queries.js";
import { pool } from "../../db/client.js";

const router = Router();

// Helper: verify environment belongs to the logged-in user, returns env + project_id
async function getOwnedEnvironment(envId, userId) {
  const { rows } = await pool.query(
    `SELECT e.id, e.name, e.sdk_key, e.project_id
     FROM environments e
     JOIN projects p ON p.id = e.project_id
     WHERE e.id = $1 AND p.user_id = $2`,
    [envId, userId]
  );
  return rows[0] ?? null;
}

// Helper: verify flag belongs to the logged-in user
async function getOwnedFlag(flagId, userId) {
  const { rows } = await pool.query(
    `SELECT f.id, f.project_id FROM flags f
     JOIN projects p ON p.id = f.project_id
     WHERE f.id = $1 AND p.user_id = $2`,
    [flagId, userId]
  );
  return rows[0] ?? null;
}

// GET /api/environments/:id
router.get("/environments/:id", requireAuth, async (req, res) => {
  const env = await getOwnedEnvironment(req.params.id, req.user.id);
  if (!env) return res.status(404).json({ message: "Environment not found" });
  res.json(env);
});

// GET /api/environments/:id/flags
router.get("/environments/:id/flags", requireAuth, async (req, res) => {
  const env = await getOwnedEnvironment(req.params.id, req.user.id);
  if (!env) return res.status(404).json({ message: "Environment not found" });

  const flags = await getFlagsByEnvironmentId(req.params.id);
  res.json(flags);
});

// POST /api/environments/:id/flags
// Creates the flag at project level + auto-configs for all environments
router.post("/environments/:id/flags", requireAuth, async (req, res) => {
  const env = await getOwnedEnvironment(req.params.id, req.user.id);
  if (!env) return res.status(404).json({ message: "Environment not found" });

  const { key, name, description, tags } = req.body;
  if (!key || !key.trim()) return res.status(400).json({ message: "Flag key is required" });

  const parsedTags = Array.isArray(tags) ? tags : [];

  try {
    const flag = await createFlag(env.project_id, key.trim(), name?.trim() || key.trim(), description?.trim() || null, parsedTags);
    // Return the flag with its config for the current environment
    const { rows } = await pool.query(
      `SELECT f.id, f.key, f.name, f.created_at, fc.id AS config_id, fc.is_active, fc.default_rollout
       FROM flags f JOIN flag_configs fc ON fc.flag_id = f.id
       WHERE f.id = $1 AND fc.environment_id = $2`,
      [flag.id, req.params.id]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({ message: "A flag with this key already exists in this project" });
    }
    throw err;
  }
});

// GET /api/flags/:id/environments/:envId — flag + config + rules
router.get("/flags/:id/environments/:envId", requireAuth, async (req, res) => {
  const owned = await getOwnedFlag(req.params.id, req.user.id);
  if (!owned) return res.status(404).json({ message: "Flag not found" });

  const flag = await getFlagWithConfig(req.params.id, req.params.envId);
  if (!flag) return res.status(404).json({ message: "Flag config not found" });

  const rules = await getRulesByFlagConfigId(flag.config_id);
  res.json({ ...flag, rules });
});

// PATCH /api/flags/:id — update flag name/description/tags
router.patch("/flags/:id", requireAuth, async (req, res) => {
  const owned = await getOwnedFlag(req.params.id, req.user.id);
  if (!owned) return res.status(404).json({ message: "Flag not found" });

  const { name, description, tags } = req.body;
  const flag = await updateFlag(req.params.id, { name, description, tags });
  res.json(flag);
});

// PATCH /api/flags/:id/environments/:envId/config — update is_active + default_rollout
router.patch("/flags/:id/environments/:envId/config", requireAuth, async (req, res) => {
  const owned = await getOwnedFlag(req.params.id, req.user.id);
  if (!owned) return res.status(404).json({ message: "Flag not found" });

  const { isActive, defaultRollout } = req.body;
  const config = await updateFlagConfig(req.params.id, req.params.envId, { isActive, defaultRollout });
  if (!config) return res.status(404).json({ message: "Flag config not found" });
  res.json(config);
});

// POST /api/flags/:id/environments/:envId/rules — create targeting rule
router.post("/flags/:id/environments/:envId/rules", requireAuth, async (req, res) => {
  const owned = await getOwnedFlag(req.params.id, req.user.id);
  if (!owned) return res.status(404).json({ message: "Flag not found" });

  const flag = await getFlagWithConfig(req.params.id, req.params.envId);
  if (!flag) return res.status(404).json({ message: "Flag config not found" });

  const { fieldName, operator, values, serve, rolloutPercent, priority } = req.body;
  if (!fieldName || !values?.length) return res.status(400).json({ message: "fieldName and values are required" });

  const rule = await createRule(flag.config_id, { fieldName, operator, values, serve, rolloutPercent, priority });
  res.status(201).json(rule);
});

// PATCH /api/rules/:id — update rule
router.patch("/rules/:id", requireAuth, async (req, res) => {
  const { isActive, serve, rolloutPercent } = req.body;
  const rule = await updateRule(req.params.id, { isActive, serve, rolloutPercent });
  if (!rule) return res.status(404).json({ message: "Rule not found" });
  res.json(rule);
});

// DELETE /api/rules/:id — delete rule
router.delete("/rules/:id", requireAuth, async (req, res) => {
  const deleted = await deleteRule(req.params.id);
  if (!deleted) return res.status(404).json({ message: "Rule not found" });
  res.status(204).send();
});

// PATCH /api/flags/:id/environments/:envId/toggle
router.patch("/flags/:id/environments/:envId/toggle", requireAuth, async (req, res) => {
  const owned = await getOwnedFlag(req.params.id, req.user.id);
  if (!owned) return res.status(404).json({ message: "Flag not found" });

  const result = await toggleFlag(req.params.id, req.params.envId);
  if (!result) return res.status(404).json({ message: "Flag config not found" });
  res.json(result);
});

// DELETE /api/flags/:id  — deletes flag from entire project (all envs)
router.delete("/flags/:id", requireAuth, async (req, res) => {
  const owned = await getOwnedFlag(req.params.id, req.user.id);
  if (!owned) return res.status(404).json({ message: "Flag not found" });

  await deleteFlag(req.params.id);
  res.status(204).send();
});

export default router;
