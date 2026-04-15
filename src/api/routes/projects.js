import { Router } from "express";
import { randomUUID } from "crypto";
import { requireAuth } from "../middlewares/auth.js";
import {
  getProjectsByUserId,
  getProjectById,
  createProject,
  deleteProject,
  createEnvironment,
  getEnvironmentsByProjectId,
} from "../../db/queries.js";

const router = Router();

// GET /api/projects
// Returns all projects belonging to the logged-in user
router.get("/projects", requireAuth, async (req, res) => {
  const projects = await getProjectsByUserId(req.user.id);
  res.json(projects);
});

// POST /api/projects
// Creates a project + auto-creates Development and Production environments
router.post("/projects", requireAuth, async (req, res) => {
  const { name } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ message: "Project name is required" });
  }

  const project = await createProject(req.user.id, name.trim());

  // Auto-create Dev and Prod environments for every new project
  const [dev, prod] = await Promise.all([
    createEnvironment(project.id, "Development", `ff_dev_${randomUUID().slice(0, 8)}`),
    createEnvironment(project.id, "Production", `ff_prod_${randomUUID().slice(0, 8)}`),
  ]);

  res.status(201).json({ ...project, environments: [dev, prod] });
});

// GET /api/projects/:id
// Returns a single project — only if it belongs to the logged-in user
router.get("/projects/:id", requireAuth, async (req, res) => {
  const project = await getProjectById(req.params.id, req.user.id);

  if (!project) {
    return res.status(404).json({ message: "Project not found" });
  }

  res.json(project);
});

// GET /api/projects/:id/environments
router.get("/projects/:id/environments", requireAuth, async (req, res) => {
  const project = await getProjectById(req.params.id, req.user.id);
  if (!project) return res.status(404).json({ message: "Project not found" });

  const environments = await getEnvironmentsByProjectId(req.params.id);
  res.json(environments);
});

// DELETE /api/projects/:id
// Deletes a project — environments + flags cascade via FK
router.delete("/projects/:id", requireAuth, async (req, res) => {
  const deleted = await deleteProject(req.params.id, req.user.id);

  if (!deleted) {
    return res.status(404).json({ message: "Project not found" });
  }

  res.status(204).send();
});

export default router;
