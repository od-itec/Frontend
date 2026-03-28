import { useState } from "react";
import Editor from "./Editor";
import TerminalPanel from "./TerminalPanel";

function EditorWithTerminal({ activeFile, updateActiveFile }) {
  const [isTerminalOpen, setIsTerminalOpen] = useState(true);
  const [activePodType, setActivePodType] = useState("frontend");

  return (
    <div className={`editor-stack ${isTerminalOpen ? "terminal-open" : "terminal-closed"}`}>
      <div className="editor-main">
        <Editor activeFile={activeFile} updateActiveFile={updateActiveFile} />
      </div>

      <div className={`bottom-panel ${isTerminalOpen ? "open" : "closed"}`}>
        <div className="bottom-panel-tabs">
          <button
            className={`bottom-panel-tab ${isTerminalOpen && activePodType === "frontend" ? "active" : ""}`}
            onClick={() => {
              setActivePodType("frontend");
              setIsTerminalOpen(true);
            }}
            title="Frontend terminal"
            aria-label="Frontend terminal"
          >
            <span className="terminal-tab-icon">&gt;_ FE</span>
          </button>
          <button
            className={`bottom-panel-tab ${isTerminalOpen && activePodType === "backend" ? "active" : ""}`}
            onClick={() => {
              setActivePodType("backend");
              setIsTerminalOpen(true);
            }}
            title="Backend terminal"
            aria-label="Backend terminal"
          >
            <span className="terminal-tab-icon">&gt;_ BE</span>
          </button>
          <button
            className={`bottom-panel-tab`}
            onClick={() => setIsTerminalOpen((prev) => !prev)}
            title="Toggle terminal"
            aria-label="Toggle terminal"
          >
            <span className="terminal-tab-icon">{isTerminalOpen ? "▼" : "▲"}</span>
          </button>
        </div>

        {isTerminalOpen && (
          <TerminalPanel
            key={activePodType}
            podType={activePodType}
            isOpen={isTerminalOpen}
          />
        )}
      </div>
    </div>
  );
}

export default EditorWithTerminal;