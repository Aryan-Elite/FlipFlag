import { Router } from "express";
import { requireAuth } from '../middlewares/auth.js';

const router = Router();

router.get("/users/me", requireAuth, (req, res) => {
    res.status(501).json({ message: "Not implemented yet" });                               
  });

export default router;
