import { pool } from "./client.js";

// ── User queries ──────────────────────────────────────────────

export async function getUserById(id) {
  const { rows } = await pool.query(
    `SELECT id, name, email, "createdAt" FROM "user" WHERE id = $1`,
    [id]
  );
  return rows[0] ?? null;
}

export async function getUserByEmail(email) {
  const { rows } = await pool.query(
    `SELECT id, name, email, "createdAt" FROM "user" WHERE email = $1`,
    [email]
  );
  return rows[0] ?? null;
}

// ── Project queries ───────────────────────────────────────────

export async function getProjectsByUserId(userId) {
  const { rows } = await pool.query(
    `SELECT id, name, created_at FROM projects WHERE user_id = $1 ORDER BY created_at DESC`,
    [userId]
  );
  return rows;
}

export async function getProjectById(id, userId) {
  const { rows } = await pool.query(
    `SELECT id, name, created_at FROM projects WHERE id = $1 AND user_id = $2`,
    [id, userId]
  );
  return rows[0] ?? null;
}

export async function createProject(userId, name) {
  const { rows } = await pool.query(
    `INSERT INTO projects (user_id, name) VALUES ($1, $2) RETURNING id, name, created_at`,
    [userId, name]
  );
  return rows[0];
}

export async function deleteProject(id, userId) {
  const { rowCount } = await pool.query(
    `DELETE FROM projects WHERE id = $1 AND user_id = $2`,
    [id, userId]
  );
  return rowCount > 0;
}

// ── Environment queries ───────────────────────────────────────

export async function getEnvironmentsByProjectId(projectId) {
  const { rows } = await pool.query(
    `SELECT id, name, sdk_key, created_at FROM environments WHERE project_id = $1 ORDER BY created_at ASC`,
    [projectId]
  );
  return rows;
}

// ── Flag queries ──────────────────────────────────────────────

export async function getFlagsByEnvironmentId(environmentId) {
  const { rows } = await pool.query(
    `SELECT id, key, name, is_active, default_rollout, created_at
     FROM flags WHERE environment_id = $1 ORDER BY created_at DESC`,
    [environmentId]
  );
  return rows;
}

export async function getFlagById(id) {
  const { rows } = await pool.query(
    `SELECT id, key, name, is_active, default_rollout, created_at FROM flags WHERE id = $1`,
    [id]
  );
  return rows[0] ?? null;
}
