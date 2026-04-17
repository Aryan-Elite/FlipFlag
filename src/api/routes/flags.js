import { Router } from "express";
import { requireAuth } from "../middlewares/auth.js";
import {
  getFlagWithConfig,
  updateFlag,
  updateFlagConfig,
  toggleFlag,
  deleteFlag,
  getRulesByFlagConfigId,
} from "../../db/queries.js";
import { pool } from "../../db/client.js";

const router = Router();

async function getOwnedFlag(flagId, userId) {
  const { rows } = await pool.query(
    `SELECT f.id, f.project_id FROM flags f
     JOIN projects p ON p.id = f.project_id
     WHERE f.id = $1 AND p.user_id = $2`,
    [flagId, userId]
  );
  return rows[0] ?? null;
}

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

// PATCH /api/flags/:id/environments/:envId/toggle
router.patch("/flags/:id/environments/:envId/toggle", requireAuth, async (req, res) => {
  const owned = await getOwnedFlag(req.params.id, req.user.id);
  if (!owned) return res.status(404).json({ message: "Flag not found" });

  const result = await toggleFlag(req.params.id, req.params.envId);
  if (!result) return res.status(404).json({ message: "Flag config not found" });
  res.json(result);
});

// DELETE /api/flags/:id — deletes flag from entire project (all envs)
router.delete("/flags/:id", requireAuth, async (req, res) => {
  const owned = await getOwnedFlag(req.params.id, req.user.id);
  if (!owned) return res.status(404).json({ message: "Flag not found" });

  await deleteFlag(req.params.id);
  res.status(204).send();
});

export default router;
