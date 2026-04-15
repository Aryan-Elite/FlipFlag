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

export async function createEnvironment(projectId, name, sdkKey) {
  const { rows } = await pool.query(
    `INSERT INTO environments (project_id, name, sdk_key) VALUES ($1, $2, $3) RETURNING id, name, sdk_key, created_at`,
    [projectId, name, sdkKey]
  );
  return rows[0];
}

export async function getEnvironmentsByProjectId(projectId) {
  const { rows } = await pool.query(
    `SELECT id, name, sdk_key, created_at FROM environments WHERE project_id = $1 ORDER BY created_at ASC`,
    [projectId]
  );
  return rows;
}

export async function getEnvironmentById(id) {
  const { rows } = await pool.query(
    `SELECT id, name, sdk_key, created_at FROM environments WHERE id = $1`,
    [id]
  );
  return rows[0] ?? null;
}

// ── Flag queries ──────────────────────────────────────────────

// Creates a flag at the project level + auto-creates a flag_config for every environment in the project
export async function createFlag(projectId, key, name, description, tags) {
  const flag = (await pool.query(
    `INSERT INTO flags (project_id, key, name, description, tags)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, key, name, description, tags, created_at`,
    [projectId, key, name, description ?? null, tags ?? []]
  )).rows[0];

  // Auto-create a flag_config for every environment in the project
  await pool.query(
    `INSERT INTO flag_configs (flag_id, environment_id)
     SELECT $1, id FROM environments WHERE project_id = $2`,
    [flag.id, projectId]
  );

  return flag;
}

// Returns flags with their per-environment config for the given environment
export async function getFlagsByEnvironmentId(environmentId) {
  const { rows } = await pool.query(
    `SELECT f.id, f.key, f.name, f.description, f.tags, f.created_at,
            fc.id AS config_id, fc.is_active, fc.default_rollout
     FROM flags f
     JOIN flag_configs fc ON fc.flag_id = f.id
     WHERE fc.environment_id = $1
     ORDER BY f.created_at DESC`,
    [environmentId]
  );
  return rows;
}

// Toggles is_active for a specific flag+environment combination
export async function toggleFlag(flagId, environmentId) {
  const { rows } = await pool.query(
    `UPDATE flag_configs SET is_active = NOT is_active
     WHERE flag_id = $1 AND environment_id = $2
     RETURNING id, is_active`,
    [flagId, environmentId]
  );
  return rows[0] ?? null;
}

// Deletes the flag entirely (flag_configs + targeting_rules cascade)
export async function deleteFlag(flagId) {
  const { rowCount } = await pool.query(
    `DELETE FROM flags WHERE id = $1`, [flagId]
  );
  return rowCount > 0;
}

export async function getFlagWithConfig(flagId, environmentId) {
  const { rows } = await pool.query(
    `SELECT f.id, f.key, f.name, f.description, f.tags, f.created_at,
            fc.id AS config_id, fc.is_active, fc.default_rollout
     FROM flags f
     JOIN flag_configs fc ON fc.flag_id = f.id
     WHERE f.id = $1 AND fc.environment_id = $2`,
    [flagId, environmentId]
  );
  return rows[0] ?? null;
}

export async function updateFlag(flagId, { name, description, tags }) {
  const { rows } = await pool.query(
    `UPDATE flags SET name = $2, description = $3, tags = $4
     WHERE id = $1
     RETURNING id, key, name, description, tags`,
    [flagId, name, description ?? null, tags ?? []]
  );
  return rows[0] ?? null;
}

export async function updateFlagConfig(flagId, environmentId, { isActive, defaultRollout }) {
  const { rows } = await pool.query(
    `UPDATE flag_configs SET is_active = $3, default_rollout = $4
     WHERE flag_id = $1 AND environment_id = $2
     RETURNING id, is_active, default_rollout`,
    [flagId, environmentId, isActive, defaultRollout]
  );
  return rows[0] ?? null;
}

export async function getRulesByFlagConfigId(flagConfigId) {
  const { rows } = await pool.query(
    `SELECT id, field_name, operator, values, serve, rollout_percent, priority, is_active, created_at
     FROM targeting_rules WHERE flag_config_id = $1 ORDER BY priority ASC, created_at ASC`,
    [flagConfigId]
  );
  return rows;
}

export async function createRule(flagConfigId, { fieldName, operator, values, serve, rolloutPercent, priority }) {
  const { rows } = await pool.query(
    `INSERT INTO targeting_rules (flag_config_id, field_name, operator, values, serve, rollout_percent, priority)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id, field_name, operator, values, serve, rollout_percent, priority, is_active, created_at`,
    [flagConfigId, fieldName, operator ?? 'in', values, serve ?? true, rolloutPercent ?? null, priority ?? 0]
  );
  return rows[0];
}

export async function updateRule(ruleId, { isActive, serve, rolloutPercent }) {
  const { rows } = await pool.query(
    `UPDATE targeting_rules SET is_active = $2, serve = $3, rollout_percent = $4
     WHERE id = $1
     RETURNING id, field_name, operator, values, serve, rollout_percent, priority, is_active`,
    [ruleId, isActive, serve, rolloutPercent ?? null]
  );
  return rows[0] ?? null;
}

export async function deleteRule(ruleId) {
  const { rowCount } = await pool.query(
    `DELETE FROM targeting_rules WHERE id = $1`, [ruleId]
  );
  return rowCount > 0;
}

export async function getFlagById(flagId, environmentId) {
  const { rows } = await pool.query(
    `SELECT f.id, f.key, f.name, f.created_at,
            fc.id AS config_id, fc.is_active, fc.default_rollout
     FROM flags f
     JOIN flag_configs fc ON fc.flag_id = f.id
     WHERE f.id = $1 AND fc.environment_id = $2`,
    [flagId, environmentId]
  );
  return rows[0] ?? null;
}
