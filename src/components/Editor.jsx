import { useEffect, useMemo, useRef, useState } from "react";
import MonacoEditor from "@monaco-editor/react";

const SNIPPETS_BY_LANGUAGE = {
  javascript: {
    fn: "function ${1:name}(${2:args}) {\n  $0\n}",
    if: "if (${1:condition}) {\n  $0\n}",
    for: "for (let ${1:i} = 0; ${1:i} < ${2:count}; ${1:i} += 1) {\n  $0\n}",
  },
  typescript: {
    fn: "function ${1:name}(${2:args}): ${3:void} {\n  $0\n}",
    if: "if (${1:condition}) {\n  $0\n}",
    for: "for (let ${1:i} = 0; ${1:i} < ${2:count}; ${1:i} += 1) {\n  $0\n}",
  },
  python: {
    def: "def ${1:name}(${2:args}):\n    $0",
    if: "if ${1:condition}:\n    $0",
    for: "for ${1:i} in range(${2:count}):\n    $0",
  },
  java: {
    main: "public static void main(String[] args) {\n    $0\n}",
    if: "if (${1:condition}) {\n    $0\n}",
    for: "for (int ${1:i} = 0; ${1:i} < ${2:count}; ${1:i}++) {\n    $0\n}",
  },
  rust: {
    fn: "fn ${1:name}(${2:args}) {\n    $0\n}",
    if: "if ${1:condition} {\n    $0\n}",
    for: "for ${1:i} in 0..${2:count} {\n    $0\n}",
  },
  c: {
    main: "int main(void) {\n    $0\n    return 0;\n}",
    if: "if (${1:condition}) {\n    $0\n}",
    for: "for (int ${1:i} = 0; ${1:i} < ${2:count}; ${1:i}++) {\n    $0\n}",
  },
  cpp: {
    main: "int main() {\n    $0\n    return 0;\n}",
    if: "if (${1:condition}) {\n    $0\n}",
    for: "for (int ${1:i} = 0; ${1:i} < ${2:count}; ++${1:i}) {\n    $0\n}",
  },
};

function getEditorLanguage(fileName, languageLabel) {
  const lower = (fileName || "").toLowerCase();
  const normalizedLabel = (languageLabel || "").trim().toLowerCase();

  if (lower.endsWith(".js") || lower.endsWith(".jsx")) return "javascript";
  if (lower.endsWith(".ts") || lower.endsWith(".tsx")) return "typescript";
  if (lower.endsWith(".py")) return "python";
  if (lower.endsWith(".java")) return "java";
  if (lower.endsWith(".rs")) return "rust";
  if (lower.endsWith(".css")) return "css";
  if (lower.endsWith(".html")) return "html";
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

  if (normalizedLabel === "javascript") return "javascript";
  if (normalizedLabel === "typescript") return "typescript";
  if (normalizedLabel === "python") return "python";
  if (normalizedLabel === "java") return "java";
  if (normalizedLabel === "rust") return "rust";
  if (normalizedLabel === "css") return "css";
  if (normalizedLabel === "html") return "html";
  if (normalizedLabel === "json") return "json";
  if (normalizedLabel === "c") return "c";
  if (normalizedLabel === "c++") return "cpp";

  return "plaintext";
}

function buildSnippetDoc(template) {
  return template.replace("$0", "").replace(/\$\{\d+:([^}]+)\}/g, "$1");
}

function defineWorkspaceThemes(monaco) {
  monaco.editor.defineTheme("itec-sky", {
    base: "vs",
    inherit: true,
    rules: [],
    colors: {
      "editor.background": "#ffffff",
      "editor.foreground": "#0f172a",
      "editor.lineHighlightBackground": "#ffffff",
      "editorLineNumber.foreground": "#94a3b8",
      "editorLineNumber.activeForeground": "#64748b",
      "editor.selectionBackground": "#93c5fd80",
      "editor.inactiveSelectionBackground": "#bfdbfe66",
      "editorCursor.foreground": "#0f172a",
      "editorSuggestWidget.background": "#ffffff",
      "editorSuggestWidget.border": "#dbeafe",
      "editorSuggestWidget.selectedBackground": "#dbeafe",
    },
  });

  monaco.editor.defineTheme("itec-graphite", {
    base: "vs-dark",
    inherit: true,
    rules: [],
    colors: {
      "editor.background": "#0f172a",
      "editor.foreground": "#d4d4d4",
      "editor.lineHighlightBackground": "#0f172a",
      "editorLineNumber.foreground": "#64748b",
      "editorLineNumber.activeForeground": "#cbd5e1",
      "editor.selectionBackground": "#2563eb73",
      "editor.inactiveSelectionBackground": "#33415566",
      "editorCursor.foreground": "#d4d4d4",
      "editorSuggestWidget.background": "#111827",
      "editorSuggestWidget.border": "#1f2937",
      "editorSuggestWidget.selectedBackground": "#334155",
      "editorWidget.background": "#111827",
      "editorWidget.border": "#1f2937",
      "widget.shadow": "#00000055",
      "quickInput.background": "#111827",
      "quickInput.foreground": "#d4d4d4",
      "quickInputTitle.background": "#0f172a",
      "quickInputList.focusBackground": "#334155",
      "quickInputList.focusForeground": "#eff6ff",
      "quickInputList.focusIconForeground": "#38bdf8",
      "pickerGroup.border": "#1f2937",
      "pickerGroup.foreground": "#9ca3af",
      "input.background": "#0f172a",
      "input.foreground": "#d4d4d4",
      "input.border": "#334155",
      "inputOption.activeBorder": "#38bdf8",
      "keybindingLabel.background": "#1f2937",
      "keybindingLabel.foreground": "#d4d4d4",
      "keybindingLabel.border": "#334155",
      "keybindingLabel.bottomBorder": "#334155",
    },
  });
}

function Editor({ activeFile, updateActiveFile }) {
  const providersRef = useRef([]);
  const [editorTheme, setEditorTheme] = useState("itec-sky");

  const code = activeFile?.content ?? "";
  const language = useMemo(
    () => getEditorLanguage(activeFile?.name, activeFile?.language),
    [activeFile?.name, activeFile?.language]
  );

  useEffect(() => {
    const workspaceShell = document.querySelector(".workspace-shell");
    if (!workspaceShell) return;

    const syncTheme = () => {
      setEditorTheme(
        workspaceShell.classList.contains("theme-graphite")
          ? "itec-graphite"
          : "itec-sky"
      );
    };

    syncTheme();
    const observer = new MutationObserver(syncTheme);
    observer.observe(workspaceShell, { attributes: true, attributeFilter: ["class"] });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    return () => {
      providersRef.current.forEach((provider) => provider.dispose());
      providersRef.current = [];
    };
  }, []);

  const registerSnippetProviders = (monaco) => {
    providersRef.current.forEach((provider) => provider.dispose());
    providersRef.current = [];

    const availableLanguages = new Set(monaco.languages.getLanguages().map((item) => item.id));

    Object.entries(SNIPPETS_BY_LANGUAGE).forEach(([languageId, snippets]) => {
      if (!availableLanguages.has(languageId)) return;

      const provider = monaco.languages.registerCompletionItemProvider(languageId, {
        provideCompletionItems(model, position) {
          const word = model.getWordUntilPosition(position);
          const prefix = word.word.toLowerCase();
          const range = {
            startLineNumber: position.lineNumber,
            endLineNumber: position.lineNumber,
            startColumn: word.startColumn,
            endColumn: word.endColumn,
          };

          const suggestions = Object.entries(snippets)
            .filter(([trigger]) => !prefix || trigger.toLowerCase().startsWith(prefix))
            .map(([trigger, template], index) => ({
              label: trigger,
              kind: monaco.languages.CompletionItemKind.Snippet,
              insertText: template,
              insertTextRules:
                monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: {
                value: `\`\`\`\n${buildSnippetDoc(template)}\n\`\`\``,
              },
              range,
              sortText: `0_${String(index).padStart(3, "0")}_${trigger}`,
            }));

          return { suggestions };
        },
      });

      providersRef.current.push(provider);
    });
  };

  const handleBeforeMount = (monaco) => {
    defineWorkspaceThemes(monaco);
    registerSnippetProviders(monaco);
  };

  const handleChange = (nextValue) => {
    if (!activeFile) return;

    updateActiveFile((prev) => ({
      ...prev,
      content: nextValue ?? "",
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
        <div className="monaco-host">
          <MonacoEditor
            height="100%"
            language={language}
            value={code}
            theme={editorTheme}
            onChange={handleChange}
            beforeMount={handleBeforeMount}
            options={{
              automaticLayout: true,
              minimap: { enabled: false },
              fontFamily: "Consolas, 'Courier New', monospace",
              fontSize: 14,
              lineHeight: 22,
              tabSize: 4,
              insertSpaces: true,
              wordWrap: "off",
              quickSuggestions: { other: true, comments: false, strings: true },
              suggestOnTriggerCharacters: true,
              acceptSuggestionOnEnter: "on",
              snippetSuggestions: "top",
              tabCompletion: "on",
              glyphMargin: false,
              folding: false,
              lineNumbersMinChars: 3,
              scrollBeyondLastLine: false,
              renderLineHighlight: "none",
              smoothScrolling: true,
            }}
          />
        </div>
      </div>

      <div className="status-bar">
        <span>{activeFile?.language || "Plain Text"}</span>
        <span>UTF-8</span>
        <span>{activeFile ? "Editing" : "Idle"}</span>
        <span>Spaces: 4</span>
        <span>
          {SNIPPETS_BY_LANGUAGE[language]
            ? "Autocomplete: VS Code style (Tab/Enter/Ctrl+Space)"
            : "Autocomplete: Monaco default"}
        </span>
      </div>
    </section>
  );
}

export default Editor;
