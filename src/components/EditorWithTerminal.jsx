import { useState } from "react";
import Editor from "./Editor";
import TerminalPanel from "./TerminalPanel";

function EditorWithTerminal({ activeFile, updateActiveFile }) {
  const [isTerminalOpen, setIsTerminalOpen] = useState(true);

  return (
    <div className="editor-stack">
      <div className="editor-main">
        <Editor activeFile={activeFile} updateActiveFile={updateActiveFile} />
      </div>

      <div className={`bottom-panel ${isTerminalOpen ? "open" : "closed"}`}>
        <div className="bottom-panel-tabs">
          <button
            className={`bottom-panel-tab ${isTerminalOpen ? "active" : ""}`}
            onClick={() => setIsTerminalOpen((prev) => !prev)}
            title="Toggle terminal"
            aria-label="Toggle terminal"
          >
            <span className="terminal-tab-icon">&gt;_</span>
          </button>
        </div>

        {isTerminalOpen && <TerminalPanel />}
      </div>
    </div>
  );
}

export default EditorWithTerminal;