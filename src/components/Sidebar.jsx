import { useEffect, useMemo, useRef, useState } from "react";

function Sidebar({
  currentUser,
  items,
  activeFileId,
  renamingItemId,
  onCreateFile,
  onCreateFolder,
  onDeleteItem,
  onSelectFile,
  onToggleFolder,
  onRenameDraftItem,
  onConfirmDraftItem,
  onCancelDraftItem,
  onStartRenamingItem,
  onRenameItemChange,
  onConfirmRenameItem,
  onCancelRenameItem,
  onMoveItem,
  onImportItemsAtRoot,
  onImportItemsIntoFolder,
  onOpenFiles,
  onOpenFolder,
}) {
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("editor");
  const [inviteMessage, setInviteMessage] = useState("");
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  const inviteLink = useMemo(() => {
    if (typeof window === "undefined") return "";

    const tokenSeed = currentUser?.id || currentUser?.email || "guest";
    const encodedSeed = encodeURIComponent(String(tokenSeed));
    return `${window.location.origin}/workspace?invite=${encodedSeed}&role=${inviteRole}`;
  }, [currentUser?.id, currentUser?.email, inviteRole]);

  const handleCopyInviteLink = async () => {
    if (!inviteLink) return;

    try {
      await navigator.clipboard.writeText(inviteLink);
      setInviteMessage("Invite link copied.");
    } catch {
      setInviteMessage("Copy failed. Please copy manually.");
    }
  };

  const handleGenerateInvite = async () => {
    if (!inviteEmail.trim()) {
      setInviteMessage("Enter an email first.");
      return;
    }

    await handleCopyInviteLink();
  };

  const openInviteWindow = () => {
    setInviteMessage("");
    setIsInviteOpen(true);
  };

  const closeInviteWindow = () => {
    setIsInviteOpen(false);
  };

  const handleRootDragOver = (e) => {
    e.preventDefault();
  };

  const handleRootDrop = async (e) => {
    e.preventDefault();

    const draggedItemId = e.dataTransfer.getData("application/x-itec-item-id");
    if (draggedItemId) {
      onMoveItem(draggedItemId, null);
      return;
    }

    await onImportItemsAtRoot(e.dataTransfer);
  };

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
          className="icon-button"
          onClick={() => onCreateFolder(null)}
          title="New Folder"
          aria-label="Create new folder"
        >
          🗀
        </button>

        <button
          className="icon-button"
          onClick={onOpenFiles}
          title="Open Files"
          aria-label="Open files"
        >
          ⤴
        </button>

        <button
          className="icon-button"
          onClick={onOpenFolder}
          title="Open Folder"
          aria-label="Open folder"
        >
          ⛁
        </button>
      </div>

      <div
        className="explorer-dropzone"
        onDragOver={handleRootDragOver}
        onDrop={handleRootDrop}
      >
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
                onDeleteItem={onDeleteItem}
                onSelectFile={onSelectFile}
                onToggleFolder={onToggleFolder}
                onRenameDraftItem={onRenameDraftItem}
                onConfirmDraftItem={onConfirmDraftItem}
                onCancelDraftItem={onCancelDraftItem}
                onStartRenamingItem={onStartRenamingItem}
                onRenameItemChange={onRenameItemChange}
                onConfirmRenameItem={onConfirmRenameItem}
                onCancelRenameItem={onCancelRenameItem}
                onMoveItem={onMoveItem}
                onImportItemsIntoFolder={onImportItemsIntoFolder}
              />
            ))}
          </div>
        )}
      </div>

      <div className="sidebar-user-section">
        <div className="sidebar-user-chip" title={currentUser?.email || "Not signed in"}>
          <div className="sidebar-user-avatar">
            {(currentUser?.username || currentUser?.email || "U").slice(0, 1).toUpperCase()}
          </div>
          <div className="sidebar-user-meta">
            <div className="sidebar-user-name">
              @{currentUser?.username || currentUser?.email?.split("@")[0] || "user"}
            </div>
            <div className="sidebar-user-email">
              {currentUser?.email || "no-email"}
            </div>
          </div>
        </div>

        <button
          type="button"
          className="sidebar-open-invite"
          onClick={openInviteWindow}
        >
          Invite collaborator
        </button>

        {isInviteOpen ? (
          <div className="sidebar-invite-overlay" onClick={closeInviteWindow}>
            <div
              className="sidebar-invite-box"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sidebar-invite-top">
                <div className="sidebar-invite-title">Collaborate</div>
                <button
                  type="button"
                  className="sidebar-invite-close"
                  onClick={closeInviteWindow}
                  aria-label="Close invite window"
                >
                  ×
                </button>
              </div>
              <input
                type="email"
                className="sidebar-invite-input"
                placeholder="teammate@email.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
              <div className="sidebar-invite-row">
                <select
                  className="sidebar-invite-select"
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                >
                  <option value="viewer">Viewer</option>
                  <option value="editor">Editor</option>
                </select>
                <button
                  type="button"
                  className="sidebar-invite-button"
                  onClick={handleGenerateInvite}
                >
                  Invite
                </button>
              </div>
              <div className="sidebar-invite-link-row">
                <input
                  type="text"
                  className="sidebar-invite-link"
                  value={inviteLink}
                  readOnly
                />
                <button
                  type="button"
                  className="sidebar-invite-copy"
                  onClick={handleCopyInviteLink}
                  title="Copy invite link"
                  aria-label="Copy invite link"
                >
                  Copy
                </button>
              </div>
              <div className="sidebar-invite-note">UI demo only. Backend invite flow not wired yet.</div>
              {inviteMessage ? <div className="sidebar-invite-message">{inviteMessage}</div> : null}
            </div>
          </div>
        ) : null}
      </div>
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
    onDeleteItem,
    onSelectFile,
    onToggleFolder,
    onRenameDraftItem,
    onConfirmDraftItem,
    onCancelDraftItem,
    onStartRenamingItem,
    onRenameItemChange,
    onConfirmRenameItem,
    onCancelRenameItem,
    onMoveItem,
    onImportItemsIntoFolder,
  } = props;

  const handleDragStart = (e) => {
    e.stopPropagation();
    e.dataTransfer.setData("application/x-itec-item-id", item.id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleFolderDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleFolderDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const draggedItemId = e.dataTransfer.getData("application/x-itec-item-id");
    if (draggedItemId) {
      onMoveItem(draggedItemId, item.id);
      return;
    }

    await onImportItemsIntoFolder(item.id, e.dataTransfer);
  };

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
          draggable
          onDragStart={handleDragStart}
          onDragOver={handleFolderDragOver}
          onDrop={handleFolderDrop}
        >
          <button
            className="folder-main"
            onClick={() => onToggleFolder(item.id)}
            onDoubleClick={() => onStartRenamingItem(item.id)}
          >
            <span className="folder-chevron">{item.isExpanded ? "▾" : "▸"}</span>
            <span className="file-item-icon">🗀</span>
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
              className="mini-action"
              title="New folder"
              onClick={() => onCreateFolder(item.id)}
            >
              🗀
            </button>
            <button
              className="mini-action delete-action"
              title="Delete folder"
              onClick={() => onDeleteItem(item.id)}
            >
              ×
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
    <div
      className={`file-row ${item.id === activeFileId ? "active" : ""}`}
      style={{ paddingLeft: `${16 + level * 16}px` }}
      draggable
      onDragStart={handleDragStart}
    >
      <button
        className={`file-item ${item.id === activeFileId ? "active" : ""}`}
        onClick={() => onSelectFile(item.id)}
        onDoubleClick={() => onStartRenamingItem(item.id)}
      >
        <span className="file-item-icon">📄</span>
        <span className="file-item-name">{item.name}</span>
      </button>

      <div className="tree-item-actions visible-on-row-hover">
        <button
          className="mini-action delete-action"
          title="Delete file"
          onClick={() => onDeleteItem(item.id)}
        >
          ×
        </button>
      </div>
    </div>
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
      <span className="file-item-icon">{item.type === "folder" ? "🗀" : "📄"}</span>
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
      <span className="file-item-icon">{item.type === "folder" ? "🗀" : "📄"}</span>
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
