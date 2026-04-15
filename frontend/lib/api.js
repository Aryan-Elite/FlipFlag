const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    credentials: "include", // always send cookies for Better Auth session
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `Request failed: ${res.status}`);
  }

  // 204 No Content — nothing to parse
  if (res.status === 204) return null;

  return res.json();
}

// ── Projects ──────────────────────────────────────────────────

export function getProjects() {
  return request("/api/projects");
}

export function getProject(id) {
  return request(`/api/projects/${id}`);
}

export function createProject(name) {
  return request("/api/projects", {
    method: "POST",
    body: JSON.stringify({ name }),
  });
}

export function deleteProject(id) {
  return request(`/api/projects/${id}`, { method: "DELETE" });
}

// ── Environments ───────────────────────────────────────────────

export function getEnvironments(projectId) {
  return request(`/api/projects/${projectId}/environments`);
}

export function getEnvironment(envId) {
  return request(`/api/environments/${envId}`);
}

// ── Flags ──────────────────────────────────────────────────────

export function getFlags(envId) {
  return request(`/api/environments/${envId}/flags`);
}

export function createFlag(envId, key, name, description, tags) {
  return request(`/api/environments/${envId}/flags`, {
    method: "POST",
    body: JSON.stringify({ key, name, description, tags }),
  });
}

export function toggleFlag(flagId, envId) {
  return request(`/api/flags/${flagId}/environments/${envId}/toggle`, { method: "PATCH" });
}

export function getFlag(flagId, envId) {
  return request(`/api/flags/${flagId}/environments/${envId}`);
}

export function updateFlag(flagId, { name, description, tags }) {
  return request(`/api/flags/${flagId}`, {
    method: "PATCH",
    body: JSON.stringify({ name, description, tags }),
  });
}

export function updateFlagConfig(flagId, envId, { isActive, defaultRollout }) {
  return request(`/api/flags/${flagId}/environments/${envId}/config`, {
    method: "PATCH",
    body: JSON.stringify({ isActive, defaultRollout }),
  });
}

export function createRule(flagId, envId, rule) {
  return request(`/api/flags/${flagId}/environments/${envId}/rules`, {
    method: "POST",
    body: JSON.stringify(rule),
  });
}

export function updateRule(ruleId, updates) {
  return request(`/api/rules/${ruleId}`, {
    method: "PATCH",
    body: JSON.stringify(updates),
  });
}

export function deleteRule(ruleId) {
  return request(`/api/rules/${ruleId}`, { method: "DELETE" });
}

export function deleteFlag(flagId) {
  return request(`/api/flags/${flagId}`, { method: "DELETE" });
}
