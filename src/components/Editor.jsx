import { useMemo } from "react";

function Editor({ activeFile, updateActiveFile }) {
  const code = activeFile?.content ?? "";

  const lineNumbers = useMemo(() => {
    const count = Math.max(1, code.split("\n").length);
    return Array.from({ length: count }, (_, index) => index + 1);
  }, [code]);

  const handleChange = (e) => {
    if (!activeFile) return;

    updateActiveFile((prev) => ({
      ...prev,
      content: e.target.value,
    }));
  };

  return (
    <section className="editor-panel">
      <div className="tabs-bar">
        <div className="tab active">
          <span className="tab-dot" />
          <span className="tab-name">{activeFile?.name || "No file selected"}</span>
        </div>
      </div>

      <div className="editor-area">
        <div className="line-numbers" aria-hidden="true">
          {lineNumbers.map((line) => (
            <div key={line} className="line-number">
              {line}
            </div>
          ))}
        </div>

        <div className="editor-wrapper">
          <textarea
            className="code-editor"
            value={code}
            onChange={handleChange}
            placeholder={activeFile ? "Start typing here..." : "Create or select a file to start editing..."}
            spellCheck={false}
            disabled={!activeFile}
          />
        </div>
      </div>

      <div className="status-bar">
        <span>{activeFile?.language || "Plain Text"}</span>
        <span>UTF-8</span>
        <span>{activeFile ? "Editing" : "Idle"}</span>
        <span>Spaces: 2</span>
      </div>
    </section>
  );
}

export default Editor;