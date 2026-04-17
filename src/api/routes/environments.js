import { Router } from "express";
import { requireAuth } from "../middlewares/auth.js";
import { getFlagsByEnvironmentId, createFlag } from "../../db/queries.js";
import { pool } from "../../db/client.js";

const router = Router();

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
router.post("/environments/:id/flags", requireAuth, async (req, res) => {
  const env = await getOwnedEnvironment(req.params.id, req.user.id);
  if (!env) return res.status(404).json({ message: "Environment not found" });

  const { key, name, description, tags } = req.body;
  if (!key || !key.trim()) return res.status(400).json({ message: "Flag key is required" });

  const parsedTags = Array.isArray(tags) ? tags : [];

  try {
    const flag = await createFlag(env.project_id, key.trim(), name?.trim() || key.trim(), description?.trim() || null, parsedTags);
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

export default router;
