import { Router } from "express";
import authRouter from "./auth.js";
import usersRouter from "./users.js";
import projectsRouter from "./projects.js";
import environmentsRouter from "./environments.js";
import flagsRouter from "./flags.js";
import rulesRouter from "./rules.js";
import sdkRouter from "./sdk.js";

const router = Router();

router.use(authRouter);
router.use(usersRouter);
router.use(projectsRouter);
router.use(environmentsRouter);
router.use(flagsRouter);
router.use(rulesRouter);
router.use(sdkRouter);

export default router;
