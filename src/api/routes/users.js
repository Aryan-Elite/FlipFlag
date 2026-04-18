import { Router } from "express";
import { requireAuth } from "../middlewares/auth.js";
import { getDashboardStats } from "../../db/queries.js";

const router = Router();

router.get("/users/me", requireAuth, (req, res) => {
  const { id, name, email, emailVerified, createdAt } = req.user;
  res.json({ id, name, email, emailVerified, createdAt });
});

router.get("/users/dashboard-stats", requireAuth, async (req, res) => {
  const stats = await getDashboardStats(req.user.id);
  res.json(stats);
});

export default router;
