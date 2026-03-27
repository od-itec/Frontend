import { useEffect, useRef } from "react";

function Sidebar({
  items,
  activeFileId,
  renamingItemId,
  onCreateFile,
  onCreateFolder,
  onSelectFile,
  onToggleFolder,
  onRenameDraftItem,
  onConfirmDraftItem,
  onCancelDraftItem,
  onStartRenamingItem,
  onRenameItemChange,
  onConfirmRenameItem,
  onCancelRenameItem,
}) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header-row">
        <div className="sidebar-header">EXPLORER</div>
      </div>

      <div className="sidebar-actions-row">
        <button
          className="icon-button"
          onClick={() => onCreateFile(null)}
          title="New File"
          aria-label="Create new file"
        >
          +
        </button>

        <button
          className="icon-button folder-create-button"
          onClick={() => onCreateFolder(null)}
          title="New Folder"
          aria-label="Create new folder"
        >
          <span className="folder-icon small" aria-hidden="true"/>
        </button>
      </div>

      {items.length === 0 ? (
        <div className="empty-explorer">
          <p>No files or folders yet.</p>
          <span>Create a file or folder to populate the workspace.</span>
        </div>
      ) : (
        <div className="file-list">
          {items.map((item) => (
            <TreeItem
              key={item.id}
              item={item}
              level={0}
              activeFileId={activeFileId}
              renamingItemId={renamingItemId}
              onCreateFile={onCreateFile}
              onCreateFolder={onCreateFolder}
              onSelectFile={onSelectFile}
              onToggleFolder={onToggleFolder}
              onRenameDraftItem={onRenameDraftItem}
              onConfirmDraftItem={onConfirmDraftItem}
              onCancelDraftItem={onCancelDraftItem}
              onStartRenamingItem={onStartRenamingItem}
              onRenameItemChange={onRenameItemChange}
              onConfirmRenameItem={onConfirmRenameItem}
              onCancelRenameItem={onCancelRenameItem}
            />
          ))}
        </div>
      )}
    </aside>
  );
}

function TreeItem(props) {
  const {
    item,
    level,
    activeFileId,
    renamingItemId,
    onCreateFile,
    onCreateFolder,
    onSelectFile,
    onToggleFolder,
    onRenameDraftItem,
    onConfirmDraftItem,
    onCancelDraftItem,
    onStartRenamingItem,
    onRenameItemChange,
    onConfirmRenameItem,
    onCancelRenameItem,
  } = props;

  if (item.isDraft) {
    return (
      <DraftItem
        item={item}
        level={level}
        onRenameDraftItem={onRenameDraftItem}
        onConfirmDraftItem={onConfirmDraftItem}
        onCancelDraftItem={onCancelDraftItem}
      />
    );
  }

  if (item.id === renamingItemId) {
    return (
      <RenameItem
        item={item}
        level={level}
        onRenameItemChange={onRenameItemChange}
        onConfirmRenameItem={onConfirmRenameItem}
        onCancelRenameItem={onCancelRenameItem}
      />
    );
  }

  if (item.type === "folder") {
    return (
      <>
        <div
          className="tree-item folder-item"
          style={{ paddingLeft: `${16 + level * 16}px` }}
        >
          <button
            className="folder-main"
            onClick={() => onToggleFolder(item.id)}
            onDoubleClick={() => onStartRenamingItem(item.id)}
          >
            <span className="folder-chevron">{item.isExpanded ? "▾" : "▸"}</span>
            <span className="folder-icon" aria-hidden="true" />
            <span className="file-item-name">{item.name}</span>
          </button>

          <div className="tree-item-actions">
            <button
              className="mini-action"
              title="New file"
              onClick={() => onCreateFile(item.id)}
            >
              +
            </button>
            <button
              className="icon-button folder-create-button"
              onClick={() => onCreateFolder(item.id)}
              title="New Folder"
              aria-label="Create new folder"
            >
              <span className="folder-icon small" aria-hidden="true"/>
            </button>
          </div>
        </div>

        {item.isExpanded &&
          item.children.map((child) => (
            <TreeItem
              key={child.id}
              {...props}
              item={child}
              level={level + 1}
            />
          ))}
      </>
    );
  }

  return (
    <button
      className={`file-item ${item.id === activeFileId ? "active" : ""}`}
      style={{ paddingLeft: `${16 + level * 16}px` }}
      onClick={() => onSelectFile(item.id)}
      onDoubleClick={() => onStartRenamingItem(item.id)}
    >
      <span className="file-item-icon">📄</span>
      <span className="file-item-name">{item.name}</span>
    </button>
  );
}

function DraftItem({ item, level, onRenameDraftItem, onConfirmDraftItem, onCancelDraftItem }) {
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onConfirmDraftItem(item.id);
    }

    if (e.key === "Escape") {
      e.preventDefault();
      onCancelDraftItem(item.id);
    }
  };

  return (
    <div
      className="file-item draft"
      style={{ paddingLeft: `${16 + level * 16}px` }}
    >
      {item.type === "folder" ? (
        <span className="folder-icon" aria-hidden="true" />
      ) : (
        <span className="file-item-icon">📄</span>
      )}
      <input
        ref={inputRef}
        className="file-item-input"
        value={item.name}
        onChange={(e) => onRenameDraftItem(item.id, e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => onConfirmDraftItem(item.id)}
        placeholder={item.type === "folder" ? "new-folder" : "untitled.txt"}
      />
    </div>
  );
}

function RenameItem({ item, level, onRenameItemChange, onConfirmRenameItem, onCancelRenameItem }) {
  const inputRef = useRef(null);
  const previousNameRef = useRef(item.name);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onConfirmRenameItem(item.id);
    }

    if (e.key === "Escape") {
      e.preventDefault();
      onCancelRenameItem(item.id, previousNameRef.current);
    }
  };

  return (
    <div
      className="file-item draft active"
      style={{ paddingLeft: `${16 + level * 16}px` }}
    >
      <span className="folder-icon" aria-hidden="true" />
      <input
        ref={inputRef}
        className="file-item-input"
        value={item.name}
        onChange={(e) => onRenameItemChange(item.id, e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => onConfirmRenameItem(item.id)}
      />
    </div>
  );
}

export default Sidebar;