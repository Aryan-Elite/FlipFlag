import { Router } from "express";
import usersRouter from "./users.js";
import projectsRouter from "./projects.js";
import flagsRouter from "./flags.js";

const router = Router();

router.use(usersRouter);
router.use(projectsRouter);
router.use(flagsRouter);

export default router;
