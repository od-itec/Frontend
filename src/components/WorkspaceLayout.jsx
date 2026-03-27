import { useMemo, useState } from "react";
import Sidebar from "./Sidebar";
import Editor from "./Editor";
import "./WorkspaceLayout.css";

function WorkspaceLayout() {
  const [items, setItems] = useState([]);
  const [activeFileId, setActiveFileId] = useState(null);
  const [draftItemId, setDraftItemId] = useState(null);
  const [renamingItemId, setRenamingItemId] = useState(null);

  const activeFile = useMemo(() => {
    return findItemById(items, activeFileId);
  }, [items, activeFileId]);

  const handleCreateFile = (parentId = null) => {
    const newFile = {
      id: crypto.randomUUID(),
      type: "file",
      name: "",
      content: "",
      language: "Plain Text",
      isDraft: true,
    };

    setItems((prev) => insertItem(prev, parentId, newFile));
    setActiveFileId(newFile.id);
    setDraftItemId(newFile.id);
  };

  const handleCreateFolder = (parentId = null) => {
    const newFolder = {
      id: crypto.randomUUID(),
      type: "folder",
      name: "",
      isDraft: true,
      isExpanded: true,
      children: [],
    };

    setItems((prev) => insertItem(prev, parentId, newFolder));
    setDraftItemId(newFolder.id);
  };

  const handleSelectFile = (fileId) => {
    setActiveFileId(fileId);
  };

  const handleToggleFolder = (folderId) => {
    setItems((prev) =>
      updateItemById(prev, folderId, (item) => ({
        ...item,
        isExpanded: !item.isExpanded,
      }))
    );
  };

  const handleRenameDraftItem = (itemId, nextName) => {
    setItems((prev) =>
      updateItemById(prev, itemId, (item) => ({
        ...item,
        name: nextName,
      }))
    );
  };

  const handleConfirmDraftItem = (itemId) => {
    setItems((prev) =>
      updateItemById(prev, itemId, (item) => {
        const trimmedName = item.name.trim();
        const fallbackName = item.type === "folder" ? "new-folder" : "untitled.txt";
        const finalName = trimmedName || fallbackName;

        if (item.type === "folder") {
          return {
            ...item,
            name: finalName,
            isDraft: false,
          };
        }

        return {
          ...item,
          name: finalName,
          isDraft: false,
          language: inferLanguageFromFileName(finalName),
        };
      })
    );

    setDraftItemId((prev) => (prev === itemId ? null : prev));
  };

  const handleCancelDraftItem = (itemId) => {
    setItems((prev) => removeItemById(prev, itemId));
    setActiveFileId((prev) => (prev === itemId ? null : prev));
    setDraftItemId((prev) => (prev === itemId ? null : prev));
  };

  const handleStartRenamingItem = (itemId) => {
    setRenamingItemId(itemId);
  };

  const handleRenameItemChange = (itemId, nextName) => {
    setItems((prev) =>
      updateItemById(prev, itemId, (item) => ({
        ...item,
        name: nextName,
      }))
    );
  };

  const handleConfirmRenameItem = (itemId) => {
    setItems((prev) =>
      updateItemById(prev, itemId, (item) => {
        const trimmedName = item.name.trim();
        const fallbackName = item.type === "folder" ? "new-folder" : "untitled.txt";
        const finalName = trimmedName || fallbackName;

        if (item.type === "folder") {
          return {
            ...item,
            name: finalName,
          };
        }

        return {
          ...item,
          name: finalName,
          language: inferLanguageFromFileName(finalName),
        };
      })
    );

    setRenamingItemId((prev) => (prev === itemId ? null : prev));
  };

  const handleCancelRenameItem = (itemId, previousName) => {
    setItems((prev) =>
      updateItemById(prev, itemId, (item) => {
        if (item.type === "folder") {
          return {
            ...item,
            name: previousName,
          };
        }

        return {
          ...item,
          name: previousName,
          language: inferLanguageFromFileName(previousName),
        };
      })
    );

    setRenamingItemId((prev) => (prev === itemId ? null : prev));
  };

  const handleUpdateActiveFile = (updater) => {
    setItems((prev) =>
      updateItemById(prev, activeFileId, (item) =>
        typeof updater === "function" ? updater(item) : { ...item, ...updater }
      )
    );
  };

  return (
    <div className="workspace-shell">
      <Sidebar
        items={items}
        activeFileId={activeFileId}
        draftItemId={draftItemId}
        renamingItemId={renamingItemId}
        onCreateFile={handleCreateFile}
        onCreateFolder={handleCreateFolder}
        onSelectFile={handleSelectFile}
        onToggleFolder={handleToggleFolder}
        onRenameDraftItem={handleRenameDraftItem}
        onConfirmDraftItem={handleConfirmDraftItem}
        onCancelDraftItem={handleCancelDraftItem}
        onStartRenamingItem={handleStartRenamingItem}
        onRenameItemChange={handleRenameItemChange}
        onConfirmRenameItem={handleConfirmRenameItem}
        onCancelRenameItem={handleCancelRenameItem}
      />

      <Editor
        activeFile={activeFile?.type === "file" ? activeFile : null}
        updateActiveFile={handleUpdateActiveFile}
      />
    </div>
  );
}

function findItemById(items, id) {
  for (const item of items) {
    if (item.id === id) return item;
    if (item.type === "folder") {
      const found = findItemById(item.children, id);
      if (found) return found;
    }
  }
  return null;
}

function insertItem(items, parentId, newItem) {
  if (parentId === null) {
    return [...items, newItem];
  }

  return items.map((item) => {
    if (item.id === parentId && item.type === "folder") {
      return {
        ...item,
        isExpanded: true,
        children: [...item.children, newItem],
      };
    }

    if (item.type === "folder") {
      return {
        ...item,
        children: insertItem(item.children, parentId, newItem),
      };
    }

    return item;
  });
}

function updateItemById(items, itemId, updater) {
  return items.map((item) => {
    if (item.id === itemId) {
      return updater(item);
    }

    if (item.type === "folder") {
      return {
        ...item,
        children: updateItemById(item.children, itemId, updater),
      };
    }

    return item;
  });
}

function removeItemById(items, itemId) {
  return items
    .filter((item) => item.id !== itemId)
    .map((item) => {
      if (item.type === "folder") {
        return {
          ...item,
          children: removeItemById(item.children, itemId),
        };
      }

      return item;
    });
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