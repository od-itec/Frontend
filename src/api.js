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

export async function syncWorkspace() {
  const res = await fetch(`${API_BASE}/workspace/sync`, {
    method: "POST",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Failed to sync workspace");
  return res.json();
}

export async function detectProjects() {
  const res = await fetch(`${API_BASE}/workspace/detect-projects`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Failed to detect projects");
  return res.json();
}

// --- Deploy API ---

export async function buildProject(projectPath, imageName) {
  const res = await fetch(`${API_BASE}/deploy/build`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ project_path: projectPath, image_name: imageName }),
  });
  if (!res.ok) throw new Error("Failed to start build");
  return res.json();
}

export async function runContainer(imageName, containerName, port = 8080, env = {}) {
  const res = await fetch(`${API_BASE}/deploy/run`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({
      image_name: imageName,
      container_name: containerName,
      port,
      env,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to run container");
  }
  return res.json();
}

export async function stopContainer(containerName) {
  const res = await fetch(`${API_BASE}/deploy/stop`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ container_name: containerName }),
  });
  if (!res.ok) throw new Error("Failed to stop container");
  return res.json();
}

export async function getDeployStatus() {
  const res = await fetch(`${API_BASE}/deploy/status`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Failed to get deploy status");
  return res.json();
}

export async function getContainerLogs(containerName, tail = 200) {
  const res = await fetch(`${API_BASE}/deploy/logs/${containerName}?tail=${tail}`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Failed to get logs");
  return res.json();
}
