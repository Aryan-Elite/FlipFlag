import { Router } from "express";

const router = Router();

// ── User routes ───────────────────────────────────────────────
router.get("/users/me", (req, res) => {
  res.status(501).json({ message: "Not implemented yet" });
});

export default router;
