import { useEffect, useRef } from "react";

function Sidebar({
  files,
  activeFileId,
  renamingFileId,
  onCreateFile,
  onSelectFile,
  onRenameDraftFile,
  onConfirmDraftFile,
  onCancelDraftFile,
  onStartRenamingFile,
  onRenameFileChange,
  onConfirmRenameFile,
  onCancelRenameFile,
}) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header-row">
        <div className="sidebar-header">EXPLORER</div>
      </div>

      <div className="sidebar-actions-row">
        <button
          className="icon-button"
          onClick={onCreateFile}
          title="New File"
          aria-label="Create new file"
        >
          +
        </button>
      </div>

      {files.length === 0 ? (
        <div className="empty-explorer">
          <p>No files or folders yet.</p>
          <span>Create a file or run a command to populate the workspace.</span>
        </div>
      ) : (
        <div className="file-list">
          {files.map((file) => {
            if (file.isDraft) {
              return (
                <DraftFileItem
                  key={file.id}
                  file={file}
                  onRenameDraftFile={onRenameDraftFile}
                  onConfirmDraftFile={onConfirmDraftFile}
                  onCancelDraftFile={onCancelDraftFile}
                />
              );
            }

            if (file.id === renamingFileId) {
              return (
                <RenameFileItem
                  key={file.id}
                  file={file}
                  onRenameFileChange={onRenameFileChange}
                  onConfirmRenameFile={onConfirmRenameFile}
                  onCancelRenameFile={onCancelRenameFile}
                />
              );
            }

            return (
              <button
                key={file.id}
                className={`file-item ${file.id === activeFileId ? "active" : ""}`}
                onClick={() => onSelectFile(file.id)}
                onDoubleClick={() => onStartRenamingFile(file.id)}
              >
                <span className="file-item-icon">📄</span>
                <span className="file-item-name">{file.name}</span>
              </button>
            );
          })}
        </div>
      )}
    </aside>
  );
}

function DraftFileItem({
  file,
  onRenameDraftFile,
  onConfirmDraftFile,
  onCancelDraftFile,
}) {
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onConfirmDraftFile(file.id);
    }

    if (e.key === "Escape") {
      e.preventDefault();
      onCancelDraftFile(file.id);
    }
  };

  return (
    <div className="file-item draft">
      <span className="file-item-icon">📄</span>

      <input
        ref={inputRef}
        className="file-item-input"
        value={file.name}
        onChange={(e) => onRenameDraftFile(file.id, e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => onConfirmDraftFile(file.id)}
        placeholder="untitled.txt"
      />
    </div>
  );
}

function RenameFileItem({
  file,
  onRenameFileChange,
  onConfirmRenameFile,
  onCancelRenameFile,
}) {
  const inputRef = useRef(null);
  const previousNameRef = useRef(file.name);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onConfirmRenameFile(file.id);
    }

    if (e.key === "Escape") {
      e.preventDefault();
      onCancelRenameFile(file.id, previousNameRef.current);
    }
  };

  return (
    <div className="file-item draft active">
      <span className="file-item-icon">📄</span>

      <input
        ref={inputRef}
        className="file-item-input"
        value={file.name}
        onChange={(e) => onRenameFileChange(file.id, e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => onConfirmRenameFile(file.id)}
      />
    </div>
  );
}

export default Sidebar;