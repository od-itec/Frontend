import { useMemo, useState } from "react";
import Sidebar from "./Sidebar";
import Editor from "./Editor";
import "./WorkspaceLayout.css";

function WorkspaceLayout() {
  const [files, setFiles] = useState([]);
  const [activeFileId, setActiveFileId] = useState(null);

  const activeFile = useMemo(() => {
    return files.find((file) => file.id === activeFileId) ?? null;
  }, [files, activeFileId]);

  const handleCreateFile = () => {
    const nextIndex = files.length + 1;

    const newFile = {
      id: crypto.randomUUID(),
      name: `untitled-${nextIndex}.txt`,
      content: "",
      language: "Plain Text",
    };

    setFiles((prev) => [...prev, newFile]);
    setActiveFileId(newFile.id);
  };

  const handleSelectFile = (fileId) => {
    setActiveFileId(fileId);
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
        onCreateFile={handleCreateFile}
        onSelectFile={handleSelectFile}
      />

      <Editor
        activeFile={activeFile}
        updateActiveFile={handleUpdateActiveFile}
      />
    </div>
  );
}

export default WorkspaceLayout;