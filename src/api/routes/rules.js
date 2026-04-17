import { Router } from "express";
import { requireAuth } from "../middlewares/auth.js";
import { getFlagWithConfig, createRule, updateRule, deleteRule } from "../../db/queries.js";
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

// POST /api/flags/:id/environments/:envId/rules
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

// PATCH /api/rules/:id
router.patch("/rules/:id", requireAuth, async (req, res) => {
  const { isActive, serve, rolloutPercent } = req.body;
  const rule = await updateRule(req.params.id, { isActive, serve, rolloutPercent });
  if (!rule) return res.status(404).json({ message: "Rule not found" });
  res.json(rule);
});

// DELETE /api/rules/:id
router.delete("/rules/:id", requireAuth, async (req, res) => {
  const deleted = await deleteRule(req.params.id);
  if (!deleted) return res.status(404).json({ message: "Rule not found" });
  res.status(204).send();
});

export default router;
