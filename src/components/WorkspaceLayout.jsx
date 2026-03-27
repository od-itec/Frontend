import { useMemo, useState } from "react";
import Sidebar from "./Sidebar";
import Editor from "./Editor";
import "./WorkspaceLayout.css";

function WorkspaceLayout() {
  const [files, setFiles] = useState([]);
  const [activeFileId, setActiveFileId] = useState(null);
  const [draftFileId, setDraftFileId] = useState(null);
  const [renamingFileId, setRenamingFileId] = useState(null);

  const activeFile = useMemo(() => {
    return files.find((file) => file.id === activeFileId) ?? null;
  }, [files, activeFileId]);

  const handleCreateFile = () => {
    const newFile = {
      id: crypto.randomUUID(),
      name: "",
      content: "",
      language: "Plain Text",
      isDraft: true,
    };

    setFiles((prev) => [...prev, newFile]);
    setActiveFileId(newFile.id);
    setDraftFileId(newFile.id);
  };

  const handleSelectFile = (fileId) => {
    setActiveFileId(fileId);
  };

  const handleRenameDraftFile = (fileId, nextName) => {
    setFiles((prev) =>
      prev.map((file) =>
        file.id === fileId ? { ...file, name: nextName } : file
      )
    );
  };

  const handleConfirmDraftFile = (fileId) => {
    setFiles((prev) =>
      prev.map((file) => {
        if (file.id !== fileId) return file;

        const trimmedName = file.name.trim();
        const finalName = trimmedName || "untitled.txt";

        return {
          ...file,
          name: finalName,
          isDraft: false,
          language: inferLanguageFromFileName(finalName),
        };
      })
    );

    setDraftFileId((prev) => (prev === fileId ? null : prev));
  };

  const handleCancelDraftFile = (fileId) => {
    setFiles((prev) => prev.filter((file) => file.id !== fileId));
    setActiveFileId((prev) => (prev === fileId ? null : prev));
    setDraftFileId((prev) => (prev === fileId ? null : prev));
  };

  const handleStartRenamingFile = (fileId) => {
    setRenamingFileId(fileId);
  };

  const handleRenameFileChange = (fileId, nextName) => {
    setFiles((prev) =>
      prev.map((file) =>
        file.id === fileId ? { ...file, name: nextName } : file
      )
    );
  };

  const handleConfirmRenameFile = (fileId) => {
    setFiles((prev) =>
      prev.map((file) => {
        if (file.id !== fileId) return file;

        const trimmedName = file.name.trim();
        const finalName = trimmedName || "untitled.txt";

        return {
          ...file,
          name: finalName,
          language: inferLanguageFromFileName(finalName),
        };
      })
    );

    setRenamingFileId((prev) => (prev === fileId ? null : prev));
  };

  const handleCancelRenameFile = (fileId, previousName) => {
    setFiles((prev) =>
      prev.map((file) =>
        file.id === fileId
          ? {
              ...file,
              name: previousName,
              language: inferLanguageFromFileName(previousName),
            }
          : file
      )
    );

    setRenamingFileId((prev) => (prev === fileId ? null : prev));
  };

  const handleUpdateActiveFile = (updater) => {
    setFiles((prev) =>
      prev.map((file) => {
        if (file.id !== activeFileId) return file;
        return typeof updater === "function" ? updater(file) : { ...file, ...updater };
      })
    );
  };

  return (
    <div className="workspace-shell">
      <Sidebar
        files={files}
        activeFileId={activeFileId}
        draftFileId={draftFileId}
        renamingFileId={renamingFileId}
        onCreateFile={handleCreateFile}
        onSelectFile={handleSelectFile}
        onRenameDraftFile={handleRenameDraftFile}
        onConfirmDraftFile={handleConfirmDraftFile}
        onCancelDraftFile={handleCancelDraftFile}
        onStartRenamingFile={handleStartRenamingFile}
        onRenameFileChange={handleRenameFileChange}
        onConfirmRenameFile={handleConfirmRenameFile}
        onCancelRenameFile={handleCancelRenameFile}
      />

      <Editor
        activeFile={activeFile}
        updateActiveFile={handleUpdateActiveFile}
      />
    </div>
  );
}

function inferLanguageFromFileName(fileName) {
  const lower = fileName.toLowerCase();

  if (lower.endsWith(".js") || lower.endsWith(".jsx")) return "JavaScript";
  if (lower.endsWith(".ts") || lower.endsWith(".tsx")) return "TypeScript";
  if (lower.endsWith(".py")) return "Python";
  if (lower.endsWith(".java")) return "Java";
  if (lower.endsWith(".rs")) return "Rust";
  if (lower.endsWith(".css")) return "CSS";
  if (lower.endsWith(".html")) return "HTML";
  if (lower.endsWith(".json")) return "JSON";
  if (lower.endsWith(".c") || lower.endsWith(".h")) return "C";
  if (
    lower.endsWith(".cc") ||
    lower.endsWith(".cpp") ||
    lower.endsWith(".cxx") ||
    lower.endsWith(".hpp") ||
    lower.endsWith(".hh") ||
    lower.endsWith(".hxx")
  ) {
    return "C++";
  }

  return "Plain Text";
}

export default WorkspaceLayout;