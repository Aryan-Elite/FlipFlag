import { Router } from "express";
import usersRouter from "./users.js";
import projectsRouter from "./projects.js";
import environmentsRouter from "./environments.js";
import flagsRouter from "./flags.js";
import rulesRouter from "./rules.js";

const router = Router();

router.use(usersRouter);
router.use(projectsRouter);
router.use(environmentsRouter);
router.use(flagsRouter);
router.use(rulesRouter);

export default router;
