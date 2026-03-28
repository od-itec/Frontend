import { useEffect, useRef, useState, useCallback } from "react";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import "@xterm/xterm/css/xterm.css";
import {
  syncWorkspace,
  detectProjects,
  buildProject,
  runContainer,
  stopContainer,
  getDeployStatus,
  getToken,
} from "../api";

/**
 * DeployPanel — build, run, and manage user containers.
 *
 * Props:
 *   theme – "sky" | "graphite"
 */
function DeployPanel({ theme = "graphite" }) {
  const [projects, setProjects] = useState([]);
  const [containers, setContainers] = useState([]);
  const [syncing, setSyncing] = useState(false);
  const [building, setBuilding] = useState(null); // image name currently building
  const [error, setError] = useState("");

  // Build output terminal
  const buildTermRef = useRef(null);
  const buildContainerRef = useRef(null);
  const fitAddonRef = useRef(null);

  // Initialize build output terminal
  useEffect(() => {
    if (!buildContainerRef.current) return;

    const isDark = theme !== "sky";
    const term = new Terminal({
      cursorBlink: false,
      fontSize: 12,
      fontFamily: 'Consolas, "Courier New", monospace',
      theme: isDark
        ? { background: "#1a1a1a", foreground: "#d4d4d4" }
        : { background: "#f8f8f8", foreground: "#0f172a" },
      disableStdin: true,
      convertEol: true,
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(buildContainerRef.current);
    fitAddon.fit();

    buildTermRef.current = term;
    fitAddonRef.current = fitAddon;

    const resizeObserver = new ResizeObserver(() => fitAddon.fit());
    resizeObserver.observe(buildContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      term.dispose();
    };
  }, [theme]);

  const refreshStatus = useCallback(async () => {
    try {
      const data = await getDeployStatus();
      setContainers(data.containers || []);
    } catch {
      // no active session
    }
  }, []);

  // Poll status
  useEffect(() => {
    refreshStatus();
    const interval = setInterval(refreshStatus, 5000);
    return () => clearInterval(interval);
  }, [refreshStatus]);

  const handleSync = async () => {
    setError("");
    setSyncing(true);
    try {
      await syncWorkspace();
      const detected = await detectProjects();
      setProjects(detected);
    } catch (err) {
      setError(`Sync failed: ${err.message}`);
    } finally {
      setSyncing(false);
    }
  };

  const handleBuild = async (project) => {
    setError("");
    const imageName = `user-${project.name}`;
    setBuilding(imageName);

    const term = buildTermRef.current;
    if (term) {
      term.clear();
      term.writeln(`\x1b[36m--- Building ${imageName} from ${project.path} ---\x1b[0m\r\n`);
    }

    try {
      const token = getToken();
      const proto = window.location.protocol === "https:" ? "wss:" : "ws:";
      const host = window.location.host;
      const url =
        `${proto}//${host}/api/deploy/ws/build` +
        `?token=${encodeURIComponent(token)}` +
        `&project_path=${encodeURIComponent(project.path)}` +
        `&image_name=${encodeURIComponent(imageName)}`;

      const ws = new WebSocket(url);

      ws.onmessage = (event) => {
        if (term) term.write(event.data);
      };

      ws.onclose = () => {
        setBuilding(null);
        refreshStatus();
        if (term) term.writeln("\r\n\x1b[36m--- Build stream closed ---\x1b[0m");
      };

      ws.onerror = () => {
        setBuilding(null);
        setError("Build WebSocket error");
      };
    } catch (err) {
      setBuilding(null);
      setError(`Build failed: ${err.message}`);
    }
  };

  const handleRun = async (imageName, projectName) => {
    setError("");
    try {
      await runContainer(imageName, `app-${projectName}`, 8080);
      await refreshStatus();
    } catch (err) {
      setError(`Run failed: ${err.message}`);
    }
  };

  const handleStop = async (containerName) => {
    setError("");
    try {
      await stopContainer(containerName);
      await refreshStatus();
    } catch (err) {
      setError(`Stop failed: ${err.message}`);
    }
  };

  const isDark = theme !== "sky";

  return (
    <section className="deploy-panel" style={{
      display: "flex",
      flexDirection: "column",
      height: "100%",
      overflow: "hidden",
      background: isDark ? "#1e1e1e" : "#ffffff",
      color: isDark ? "#d4d4d4" : "#0f172a",
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      fontSize: 13,
    }}>
      {/* Toolbar */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "8px 12px",
        borderBottom: `1px solid ${isDark ? "#2a2a2a" : "#dbeafe"}`,
      }}>
        <button
          onClick={handleSync}
          disabled={syncing}
          style={{
            padding: "4px 12px",
            borderRadius: 4,
            border: "none",
            background: isDark ? "#2563eb" : "#3b82f6",
            color: "#fff",
            cursor: syncing ? "not-allowed" : "pointer",
            fontSize: 12,
          }}
        >
          {syncing ? "Syncing…" : "Sync & Detect"}
        </button>

        <span style={{ fontSize: 11, color: isDark ? "#6f6f6f" : "#94a3b8" }}>
          {projects.length > 0
            ? `${projects.length} project(s) detected`
            : "Sync workspace to detect projects"}
        </span>
      </div>

      {error && (
        <div style={{
          padding: "6px 12px",
          background: isDark ? "#5a1d1d" : "#fee2e2",
          color: isDark ? "#fca5a5" : "#991b1b",
          fontSize: 12,
        }}>
          {error}
        </div>
      )}

      {/* Projects list */}
      <div style={{ flex: "0 0 auto", maxHeight: 160, overflow: "auto", padding: "8px 12px" }}>
        {projects.map((project) => {
          const imageName = `user-${project.name}`;
          const running = containers.find((c) => c.image === imageName && c.status === "running");

          return (
            <div key={project.path} style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "6px 0",
              borderBottom: `1px solid ${isDark ? "#333" : "#eee"}`,
            }}>
              <div>
                <strong>{project.name}</strong>
                <span style={{
                  marginLeft: 8,
                  fontSize: 11,
                  padding: "1px 6px",
                  borderRadius: 3,
                  background: isDark ? "#334155" : "#e0e7ff",
                  color: isDark ? "#94a3b8" : "#3730a3",
                }}>
                  {project.type}
                </span>
              </div>

              <div style={{ display: "flex", gap: 6 }}>
                <button
                  onClick={() => handleBuild(project)}
                  disabled={building !== null}
                  style={{
                    padding: "3px 10px",
                    borderRadius: 3,
                    border: "none",
                    background: isDark ? "#065f46" : "#d1fae5",
                    color: isDark ? "#6ee7b7" : "#065f46",
                    cursor: building ? "not-allowed" : "pointer",
                    fontSize: 11,
                  }}
                >
                  {building === imageName ? "Building…" : "Build"}
                </button>

                {running ? (
                  <>
                    <a
                      href={`${window.location.protocol}//${window.location.hostname}:${running.host_port}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        padding: "3px 10px",
                        borderRadius: 3,
                        background: isDark ? "#1e3a5f" : "#dbeafe",
                        color: isDark ? "#93c5fd" : "#1e40af",
                        textDecoration: "none",
                        fontSize: 11,
                      }}
                    >
                      Preview
                    </a>
                    <button
                      onClick={() => handleStop(running.name)}
                      style={{
                        padding: "3px 10px",
                        borderRadius: 3,
                        border: "none",
                        background: isDark ? "#5a1d1d" : "#fee2e2",
                        color: isDark ? "#fca5a5" : "#991b1b",
                        cursor: "pointer",
                        fontSize: 11,
                      }}
                    >
                      Stop
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => handleRun(imageName, project.name)}
                    style={{
                      padding: "3px 10px",
                      borderRadius: 3,
                      border: "none",
                      background: isDark ? "#1e3a5f" : "#dbeafe",
                      color: isDark ? "#93c5fd" : "#1e40af",
                      cursor: "pointer",
                      fontSize: 11,
                    }}
                  >
                    Run
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {/* Show orphan running containers not in projects list */}
        {containers
          .filter((c) => !projects.some((p) => c.image === `user-${p.name}`))
          .map((c) => (
            <div key={c.name} style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "6px 0",
              borderBottom: `1px solid ${isDark ? "#333" : "#eee"}`,
            }}>
              <div>
                <strong>{c.name}</strong>
                <span style={{
                  marginLeft: 8,
                  fontSize: 11,
                  color: c.status === "running" ? "#22c55e" : "#ef4444",
                }}>
                  {c.status}
                </span>
              </div>
              {c.status === "running" && (
                <div style={{ display: "flex", gap: 6 }}>
                  <a
                    href={`${window.location.protocol}//${window.location.hostname}:${c.host_port}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      padding: "3px 10px",
                      borderRadius: 3,
                      background: isDark ? "#1e3a5f" : "#dbeafe",
                      color: isDark ? "#93c5fd" : "#1e40af",
                      textDecoration: "none",
                      fontSize: 11,
                    }}
                  >
                    Preview
                  </a>
                  <button
                    onClick={() => handleStop(c.name)}
                    style={{
                      padding: "3px 10px",
                      borderRadius: 3,
                      border: "none",
                      background: isDark ? "#5a1d1d" : "#fee2e2",
                      color: isDark ? "#fca5a5" : "#991b1b",
                      cursor: "pointer",
                      fontSize: 11,
                    }}
                  >
                    Stop
                  </button>
                </div>
              )}
            </div>
          ))}
      </div>

      {/* Build output */}
      <div
        ref={buildContainerRef}
        style={{ flex: 1, minHeight: 0, overflow: "hidden" }}
      />
    </section>
  );
}

export default DeployPanel;
