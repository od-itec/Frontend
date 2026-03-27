function Sidebar({ files, activeFileId, onCreateFile, onSelectFile }) {
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
          {files.map((file) => (
            <button
              key={file.id}
              className={`file-item ${file.id === activeFileId ? "active" : ""}`}
              onClick={() => onSelectFile(file.id)}
            >
              <span className="file-item-icon">📄</span>
              <span className="file-item-name">{file.name}</span>
            </button>
          ))}
        </div>
      )}
    </aside>
  );
}

export default Sidebar;