const API_BASE = "/api";

export async function login(email, password) {
  const body = new URLSearchParams();
  body.append("username", email); // fastapi-users expects "username" field (holds email)
  body.append("password", password);

  const res = await fetch(`${API_BASE}/auth/jwt/login`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Login failed");
  }

  const data = await res.json();
  localStorage.setItem("access_token", data.access_token);
  return data;
}

export async function register(email, password, username) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, username }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail?.reason || err.detail || "Registration failed");
  }

  return res.json();
}

export async function fetchMe() {
  const token = localStorage.getItem("access_token");
  if (!token) throw new Error("Not authenticated");

  const res = await fetch(`${API_BASE}/users/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw new Error("Not authenticated");
  return res.json();
}

export function logout() {
  localStorage.removeItem("access_token");
}

export function getToken() {
  return localStorage.getItem("access_token");
}

function authHeaders() {
  return { Authorization: `Bearer ${getToken()}` };
}

// --- File API ---

export async function loadFiles() {
  const res = await fetch(`${API_BASE}/files`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Failed to load files");
  return res.json();
}

export async function saveTree(flatItems) {
  const res = await fetch(`${API_BASE}/files`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ items: flatItems }),
  });
  if (!res.ok) throw new Error("Failed to save files");
  return res.json();
}

export async function createFileApi(item) {
  const res = await fetch(`${API_BASE}/files`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(item),
  });
  if (!res.ok) throw new Error("Failed to create file");
  return res.json();
}

export async function updateFileApi(fileId, updates) {
  const res = await fetch(`${API_BASE}/files/${fileId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error("Failed to update file");
  return res.json();
}

export async function deleteFileApi(fileId) {
  const res = await fetch(`${API_BASE}/files/${fileId}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!res.ok && res.status !== 204) throw new Error("Failed to delete file");
}

// --- Workspace API ---

export async function startWorkspace() {
  const res = await fetch(`${API_BASE}/workspace/start`, {
    method: "POST",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Failed to start workspace");
  return res.json();
}

export async function stopWorkspace() {
  const res = await fetch(`${API_BASE}/workspace/stop`, {
    method: "POST",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Failed to stop workspace");
  return res.json();
}

export async function getWorkspaceStatus() {
  const res = await fetch(`${API_BASE}/workspace/status`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Failed to get workspace status");
  return res.json();
}

export async function syncWorkspace() {
  const res = await fetch(`${API_BASE}/workspace/sync`, {
    method: "POST",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Failed to sync workspace");
  return res.json();
}

// --- Deploy API ---

export async function triggerBuild(podType = "frontend") {
  const res = await fetch(`${API_BASE}/deploy/build`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ pod_type: podType }),
  });
  if (!res.ok) throw new Error("Failed to trigger build");
  return res.json();
}

export async function getBuildStatus(podType = "frontend") {
  const res = await fetch(`${API_BASE}/deploy/build/status?pod_type=${podType}`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Failed to get build status");
  return res.json();
}

export async function getBuildLogs(podType = "frontend") {
  const res = await fetch(`${API_BASE}/deploy/build/logs?pod_type=${podType}`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Failed to get build logs");
  return res.json();
}

export async function runDeploy(podType = "frontend") {
  const res = await fetch(`${API_BASE}/deploy/run`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ pod_type: podType }),
  });
  if (!res.ok) throw new Error("Failed to deploy");
  return res.json();
}

export async function getDeployStatus(podType = "frontend") {
  const res = await fetch(`${API_BASE}/deploy/status?pod_type=${podType}`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Failed to get deploy status");
  return res.json();
}
