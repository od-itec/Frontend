import { useEffect, useState } from "react";
import WorkspaceLayout from "../components/WorkspaceLayout";
import { startWorkspace, stopWorkspace, getWorkspaceStatus } from "../api";

function WorkspacePage() {
  const [wsState, setWsState] = useState("starting"); // starting | ready | error
  const [wsError, setWsError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function boot() {
      try {
        await startWorkspace();
        if (!cancelled) setWsState("ready");
      } catch (err) {
        console.error("Workspace start failed:", err);
        if (!cancelled) {
          setWsState("error");
          setWsError(err.message);
        }
      }
    }

    boot();

    // Attempt graceful shutdown on page unload
    const handleUnload = () => {
      // fire-and-forget via sendBeacon (can't set auth headers, so use sync XHR as fallback)
      const token = localStorage.getItem("access_token");
      const xhr = new XMLHttpRequest();
      xhr.open("POST", "/api/workspace/stop", false);
      xhr.setRequestHeader("Authorization", `Bearer ${token}`);
      xhr.send();
    };
    window.addEventListener("beforeunload", handleUnload);

    return () => {
      cancelled = true;
      window.removeEventListener("beforeunload", handleUnload);
    };
  }, []);

  if (wsState === "starting") {
    return (
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        height: "100vh", background: "#0f172a", color: "#d4d4d4", fontSize: 16,
      }}>
        <div style={{ textAlign: "center" }}>
          <p>Starting workspace pods…</p>
          <p style={{ fontSize: 12, color: "#64748b", marginTop: 8 }}>
            Creating containers and syncing files
          </p>
        </div>
      </div>
    );
  }

  if (wsState === "error") {
    return (
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        height: "100vh", background: "#0f172a", color: "#ef4444", fontSize: 16,
      }}>
        <div style={{ textAlign: "center" }}>
          <p>Failed to start workspace</p>
          <p style={{ fontSize: 12, color: "#64748b", marginTop: 8 }}>{wsError}</p>
          <button
            onClick={() => { setWsState("starting"); setWsError(null); startWorkspace().then(() => setWsState("ready")).catch((e) => { setWsState("error"); setWsError(e.message); }); }}
            style={{ marginTop: 16, padding: "8px 20px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer" }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return <WorkspaceLayout />;
}

export default WorkspacePage;