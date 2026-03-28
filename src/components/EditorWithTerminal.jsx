import { useState } from "react";
import Editor from "./Editor";
import TerminalPanel from "./TerminalPanel";
import DeployPanel from "./DeployPanel";

function EditorWithTerminal({ activeFile, updateActiveFile, theme }) {
  const [isTerminalOpen, setIsTerminalOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("terminal"); // "terminal" | "deploy"

  return (
    <div className={`editor-stack ${isTerminalOpen ? "terminal-open" : "terminal-closed"}`}>
      <div className="editor-main">
        <Editor activeFile={activeFile} updateActiveFile={updateActiveFile} />
      </div>

      <div className={`bottom-panel ${isTerminalOpen ? "open" : "closed"}`}>
        <div className="bottom-panel-tabs">
          <button
            className={`bottom-panel-tab ${isTerminalOpen && activeTab === "terminal" ? "active" : ""}`}
            onClick={() => {
              if (activeTab === "terminal" && isTerminalOpen) {
                setIsTerminalOpen(false);
              } else {
                setActiveTab("terminal");
                setIsTerminalOpen(true);
              }
            }}
            title="Terminal"
            aria-label="Toggle terminal"
          >
            <span className="terminal-tab-icon">&gt;_</span>
          </button>
          <button
            className={`bottom-panel-tab ${isTerminalOpen && activeTab === "deploy" ? "active" : ""}`}
            onClick={() => {
              if (activeTab === "deploy" && isTerminalOpen) {
                setIsTerminalOpen(false);
              } else {
                setActiveTab("deploy");
                setIsTerminalOpen(true);
              }
            }}
            title="Deploy"
            aria-label="Toggle deploy panel"
          >
            <span className="terminal-tab-icon">&#9654;</span>
          </button>
        </div>

        {isTerminalOpen && activeTab === "terminal" && <TerminalPanel theme={theme} />}
        {isTerminalOpen && activeTab === "deploy" && <DeployPanel theme={theme} />}
      </div>
    </div>
  );
}

export default EditorWithTerminal;