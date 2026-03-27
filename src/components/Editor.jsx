import { useEffect, useMemo, useRef } from "react";
import hljs from "highlight.js";
import "highlight.js/styles/github-dark.css";

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function getHighlightLanguage(fileName) {
  const lower = (fileName || "").toLowerCase();

  if (lower.endsWith(".js") || lower.endsWith(".jsx")) return "javascript";
  if (lower.endsWith(".ts") || lower.endsWith(".tsx")) return "typescript";
  if (lower.endsWith(".py")) return "python";
  if (lower.endsWith(".java")) return "java";
  if (lower.endsWith(".rs")) return "rust";
  if (lower.endsWith(".css")) return "css";
  if (lower.endsWith(".html")) return "xml";
  if (lower.endsWith(".json")) return "json";
  if (lower.endsWith(".c") || lower.endsWith(".h")) return "c";

  if (
    lower.endsWith(".cc") ||
    lower.endsWith(".cpp") ||
    lower.endsWith(".cxx") ||
    lower.endsWith(".hpp") ||
    lower.endsWith(".hh") ||
    lower.endsWith(".hxx")
  ) {
    return "cpp";
  }

  return "plaintext";
}

function Editor({ activeFile, updateActiveFile }) {
  const textareaRef = useRef(null);
  const highlightedRef = useRef(null);
  const highlightScrollRef = useRef(null);
  const lineNumbersRef = useRef(null);
  const lastLoggedCodeRef = useRef("");

  const code = activeFile?.content ?? "";
  const language = useMemo(
    () => getHighlightLanguage(activeFile?.name),
    [activeFile?.name]
  );

  const lineNumbers = useMemo(() => {
    const count = Math.max(1, code.split("\n").length);
    return Array.from({ length: count }, (_, index) => index + 1);
  }, [code]);

  useEffect(() => {
    if (!highlightedRef.current) return;

    const safeCode = code.length > 0 ? code : " ";
    const escapedCode = escapeHtml(safeCode);

    if (language === "plaintext") {
      highlightedRef.current.innerHTML = escapedCode;
      return;
    }

    try {
      const result = hljs.highlight(safeCode, {
        language,
        ignoreIllegals: true,
      });
      highlightedRef.current.innerHTML = result.value;
    } catch {
      highlightedRef.current.innerHTML = escapedCode;
    }
  }, [code, language]);

  useEffect(() => {
    const interval = setInterval(() => {
      if(!activeFile) return;

      if(code != lastLoggedCodeRef.current) {
        console.log("[Editor change]", {
          fileName: activeFile.name,
          language: activeFile.language,
          content: code,
        });

        lastLoggedCodeRef.current = code;
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [code, activeFile]);

  const handleChange = (e) => {
    if (!activeFile) return;

    updateActiveFile((prev) => ({
      ...prev,
      content: e.target.value,
    }));
  };

  const handleScroll = () => {
    if (!textareaRef.current || !highlightScrollRef.current || !lineNumbersRef.current) {
      return;
    }

    const { scrollTop, scrollLeft } = textareaRef.current;

    highlightScrollRef.current.scrollTop = scrollTop;
    highlightScrollRef.current.scrollLeft = scrollLeft;
    lineNumbersRef.current.scrollTop = scrollTop;
  };

  const setValueAndSelection = (nextValue, nextStart, nextEnd = nextStart) => {
    updateActiveFile((prev) => ({
      ...prev,
      content: nextValue,
    }));

    requestAnimationFrame(() => {
      if (!textareaRef.current) return;
      textareaRef.current.selectionStart = nextStart;
      textareaRef.current.selectionEnd = nextEnd;
    });
  };

  const handleKeyDown = (e) => {
    if (!activeFile) return;

    const textarea = e.target;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    if (e.key === "Tab" && !e.shiftKey) {
      e.preventDefault();

      const nextValue = code.slice(0, start) + "    " + code.slice(end);
      setValueAndSelection(nextValue, start + 4);
      return;
    }

    if (e.key === "Tab" && e.shiftKey) {
      e.preventDefault();

      if (start !== end) {
        const selectionStartLineStart = code.lastIndexOf("\n", start - 1) + 1;
        const selectionEndLineEnd =
          code.indexOf("\n", end) === -1 ? code.length : code.indexOf("\n", end);

        const selectedBlock = code.slice(selectionStartLineStart, selectionEndLineEnd);
        const lines = selectedBlock.split("\n");

        let removedTotal = 0;

        const updatedLines = lines.map((line) => {
          if (line.startsWith("    ")) {
            removedTotal += 4;
            return line.slice(4);
          }

          if (line.startsWith("\t")) {
            removedTotal += 1;
            return line.slice(1);
          }

          return line;
        });

        const updatedBlock = updatedLines.join("\n");
        const nextValue =
          code.slice(0, selectionStartLineStart) +
          updatedBlock +
          code.slice(selectionEndLineEnd);

        const firstLineRemoved =
          lines[0].startsWith("    ") ? 4 : lines[0].startsWith("\t") ? 1 : 0;

        const nextStart = Math.max(selectionStartLineStart, start - firstLineRemoved);
        const nextEnd = Math.max(nextStart, end - removedTotal);

        setValueAndSelection(nextValue, nextStart, nextEnd);
        return;
      }

      const lineStart = code.lastIndexOf("\n", start - 1) + 1;
      const beforeCursor = code.slice(lineStart, start);

      if (beforeCursor.startsWith("    ")) {
        const removeCount = Math.min(4, start - lineStart);
        const nextValue = code.slice(0, lineStart) + code.slice(lineStart + 4);
        setValueAndSelection(nextValue, start - removeCount);
        return;
      }

      if (beforeCursor.startsWith("\t")) {
        const nextValue = code.slice(0, lineStart) + code.slice(lineStart + 1);
        setValueAndSelection(nextValue, Math.max(lineStart, start - 1));
      }

      return;
    }

    if (e.key === "Enter") {
      e.preventDefault();

      const lineStart = code.lastIndexOf("\n", start - 1) + 1;
      const currentLine = code.slice(lineStart, start);
      const indentMatch = currentLine.match(/^[\t ]*/);
      const currentIndent = indentMatch ? indentMatch[0] : "";

      const nextValue =
        code.slice(0, start) +
        "\n" +
        currentIndent +
        code.slice(end);

      const nextCursor = start + 1 + currentIndent.length;
      setValueAndSelection(nextValue, nextCursor);
    }
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
        <div className="line-numbers" ref={lineNumbersRef} aria-hidden="true">
          {lineNumbers.map((line) => (
            <div key={line} className="line-number">
              {line}
            </div>
          ))}
        </div>

        <div className="editor-wrapper">
          <div className="highlight-scroll-layer" ref={highlightScrollRef} aria-hidden="true">
            <pre className="highlight-layer">
              <code ref={highlightedRef} className={`language-${language}`} />
            </pre>
          </div>

          <textarea
            ref={textareaRef}
            className="code-editor code-editor-overlay"
            value={code}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onScroll={handleScroll}
            placeholder={
              activeFile
                ? "Start typing here..."
                : "Create or select a file to start editing..."
            }
            spellCheck={false}
            disabled={!activeFile}
          />
        </div>
      </div>

      <div className="status-bar">
        <span>{activeFile?.language || "Plain Text"}</span>
        <span>UTF-8</span>
        <span>{activeFile ? "Editing" : "Idle"}</span>
        <span>Spaces: 4</span>
      </div>
    </section>
  );
}

export default Editor;