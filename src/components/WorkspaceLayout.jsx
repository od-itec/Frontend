import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { logout } from "../api";
import Sidebar from "./Sidebar";
import Editor from "./Editor";
import "./WorkspaceLayout.css";
import EditorWithTerminal from "./EditorWithTerminal";

const THEME_STORAGE_KEY = "itec-theme";

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="workspace-theme-icon">
      <circle cx="12" cy="12" r="4.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M12 2.5v2.5M12 19v2.5M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M2.5 12H5M19 12h2.5M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="workspace-theme-icon">
      <path
        d="M20 14.4A8.8 8.8 0 1 1 9.6 4a7.1 7.1 0 0 0 10.4 10.4Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function WorkspaceLayout() {
  const navigate = useNavigate();
  const [theme, setTheme] = useState(() => {
    if (typeof window === "undefined") return "sky";
    return localStorage.getItem(THEME_STORAGE_KEY) || "sky";
  });
  const [items, setItems] = useState([]);
  const [activeFileId, setActiveFileId] = useState(null);
  const [draftItemId, setDraftItemId] = useState(null);
  const [renamingItemId, setRenamingItemId] = useState(null);

  const activeFile = useMemo(() => {
    return findItemById(items, activeFileId);
  }, [items, activeFileId]);

  useEffect(() => {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

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

  const handleDeleteItem = (itemId) => {
    setItems((prev) => removeItemById(prev, itemId));

    setActiveFileId((prev) => (containsItemId(items, itemId, prev) ? null : prev));
    setDraftItemId((prev) => (prev === itemId ? null : prev));
    setRenamingItemId((prev) => (prev === itemId ? null : prev));
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

  const handleOpenFiles = async () => {
  const input = document.createElement("input");
  input.type = "file";
  input.multiple = true;

  input.onchange = async (event) => {
    const selectedFiles = Array.from(event.target.files || []);
    const loadedItems = await filesToItems(selectedFiles);
    setItems((prev) => [...prev, ...loadedItems]);
  };

  input.click();
};

const handleOpenFolder = async () => {
  if ("showDirectoryPicker" in window) {
    try {
      const directoryHandle = await window.showDirectoryPicker();
      const loadedItems = await directoryHandleToItems(directoryHandle);
      setItems((prev) => [...prev, loadedItems]);
    } catch (error) {
      console.error("Open folder cancelled or failed:", error);
    }
    return;
  }

  const input = document.createElement("input");
  input.type = "file";
  input.multiple = true;
  input.webkitdirectory = true;

  input.onchange = async (event) => {
    const selectedFiles = Array.from(event.target.files || []);
    const loadedItems = await filesFromWebkitDirectory(selectedFiles);
    setItems((prev) => [...prev, ...loadedItems]);
  };

  input.click();
};

const handleMoveItem = (draggedItemId, targetFolderId = null) => {
  if (!draggedItemId) return;
  if (draggedItemId === targetFolderId) return;

  const draggedItem = findItemById(items, draggedItemId);
  if (!draggedItem) return;

  if (targetFolderId) {
    const targetFolder = findItemById(items, targetFolderId);
    if (!targetFolder || targetFolder.type !== "folder") return;

    if (draggedItem.type === "folder" && subtreeContainsId(draggedItem, targetFolderId)) {
      return;
    }
  }

  const { nextItems, removedItem } = removeItemAndReturn(items, draggedItemId);
  if (!removedItem) return;

  const inserted = insertItem(nextItems, targetFolderId, removedItem);
  setItems(inserted);
};

const handleImportItemsAtRoot = async (dataTransfer) => {
  const importedItems = await extractItemsFromDataTransfer(dataTransfer);
  if (importedItems.length > 0) {
    setItems((prev) => [...prev, ...importedItems]);
  }
};

const handleImportItemsIntoFolder = async (folderId, dataTransfer) => {
  const importedItems = await extractItemsFromDataTransfer(dataTransfer);
  if (importedItems.length === 0) return;

  setItems((prev) => {
    let next = prev;
    for (const item of importedItems) {
      next = insertItem(next, folderId, item);
    }
    return next;
  });
};

  return (
    <div className={`workspace-shell theme-${theme}`}>
      <div className="workspace-theme-toggle" role="group" aria-label="Theme switcher">
        <button
          type="button"
          className={`workspace-theme-option ${theme === "sky" ? "is-active" : ""}`}
          onClick={() => setTheme("sky")}
          aria-label="Switch to light theme"
          aria-pressed={theme === "sky"}
        >
          <SunIcon />
        </button>
        <button
          type="button"
          className={`workspace-theme-option ${theme === "graphite" ? "is-active" : ""}`}
          onClick={() => setTheme("graphite")}
          aria-label="Switch to dark theme"
          aria-pressed={theme === "graphite"}
        >
          <MoonIcon />
        </button>
        <button
          type="button"
          className="workspace-theme-option workspace-logout-btn"
          onClick={() => { logout(); navigate("/login"); }}
          aria-label="Log out"
          title="Log out"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" className="workspace-theme-icon">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            <polyline points="16 17 21 12 16 7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="21" y1="12" x2="9" y2="12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      <Sidebar
        items={items}
        activeFileId={activeFileId}
        draftItemId={draftItemId}
        renamingItemId={renamingItemId}
        onCreateFile={handleCreateFile}
        onCreateFolder={handleCreateFolder}
        onDeleteItem={handleDeleteItem}
        onSelectFile={handleSelectFile}
        onToggleFolder={handleToggleFolder}
        onRenameDraftItem={handleRenameDraftItem}
        onConfirmDraftItem={handleConfirmDraftItem}
        onCancelDraftItem={handleCancelDraftItem}
        onStartRenamingItem={handleStartRenamingItem}
        onRenameItemChange={handleRenameItemChange}
        onConfirmRenameItem={handleConfirmRenameItem}
        onCancelRenameItem={handleCancelRenameItem}
        onMoveItem={handleMoveItem}
        onImportItemsAtRoot={handleImportItemsAtRoot}
        onImportItemsIntoFolder={handleImportItemsIntoFolder}
        onOpenFiles={handleOpenFiles}
        onOpenFolder={handleOpenFolder}
      />

      <EditorWithTerminal
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

function containsItemId(items, deletedItemId, searchedId) {
  if (!searchedId) return false;

  const deletedItem = findItemById(items, deletedItemId);
  if (!deletedItem) return false;

  return subtreeContainsId(deletedItem, searchedId);
}

function subtreeContainsId(item, searchedId) {
  if (item.id === searchedId) return true;
  if (item.type !== "folder") return false;
  return item.children.some((child) => subtreeContainsId(child, searchedId));
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

function removeItemAndReturn(items, itemId) {
  let removedItem = null;

  const nextItems = items
    .filter((item) => {
      if (item.id === itemId) {
        removedItem = item;
        return false;
      }
      return true;
    })
    .map((item) => {
      if (item.type === "folder") {
        const result = removeItemAndReturn(item.children, itemId);

        if (result.removedItem) {
          removedItem = result.removedItem;
        }

        return {
          ...item,
          children: result.nextItems,
        };
      }

      return item;
    });

  return { nextItems, removedItem };
}

async function directoryHandleToItems(directoryHandle) {
  const folderItem = {
    id: crypto.randomUUID(),
    type: "folder",
    name: directoryHandle.name,
    isExpanded: true,
    children: [],
  };

  for await (const entry of directoryHandle.values()) {
    if (entry.kind === "file") {
      const file = await entry.getFile();
      const content = await file.text();

      folderItem.children.push({
        id: crypto.randomUUID(),
        type: "file",
        name: file.name,
        content,
        language: inferLanguageFromFileName(file.name),
      });
    }

    if (entry.kind === "directory") {
      const childFolder = await directoryHandleToItems(entry);
      folderItem.children.push(childFolder);
    }
  }

  return folderItem;
}

async function filesFromWebkitDirectory(fileList) {
  const root = [];

  for (const file of fileList) {
    const parts = (file.webkitRelativePath || file.name).split("/");
    const content = await file.text();

    insertResolvedWebkitFile(root, parts, file.name, content);
  }

  return root;
}

function insertResolvedWebkitFile(target, parts, fileName, content) {
  if (parts.length === 1) {
    target.push({
      id: crypto.randomUUID(),
      type: "file",
      name: fileName,
      content,
      language: inferLanguageFromFileName(fileName),
    });
    return;
  }

  const [folderName, ...rest] = parts;

  let folder = target.find(
    (item) => item.type === "folder" && item.name === folderName
  );

  if (!folder) {
    folder = {
      id: crypto.randomUUID(),
      type: "folder",
      name: folderName,
      isExpanded: true,
      children: [],
    };
    target.push(folder);
  }

  insertResolvedWebkitFile(folder.children, rest, fileName, content);
}

function loadFileContentLater(fileItem, file) {
  file.text().then((content) => {
    fileItem.content = content;
  });
}

async function extractItemsFromDataTransfer(dataTransfer) {
  const dtItems = Array.from(dataTransfer.items || []);
  const hasInternalDrag = dataTransfer.getData("application/x-itec-item-id");

  if (hasInternalDrag) {
    return [];
  }

  const entryItems = [];

  for (const item of dtItems) {
    if (item.kind !== "file") continue;

    const entry = item.webkitGetAsEntry?.();
    if (entry) {
      const built = await entryToItem(entry);
      if (built) entryItems.push(built);
    }
  }

  if (entryItems.length > 0) {
    return entryItems;
  }

  const files = Array.from(dataTransfer.files || []);
  return await filesToItems(files);
}

async function entryToItem(entry) {
  if (!entry) return null;

  if (entry.isFile) {
    const file = await getFileFromEntry(entry);
    const content = await file.text();

    return {
      id: crypto.randomUUID(),
      type: "file",
      name: file.name,
      content,
      language: inferLanguageFromFileName(file.name),
    };
  }

  if (entry.isDirectory) {
    const children = await readDirectoryEntries(entry);

    return {
      id: crypto.randomUUID(),
      type: "folder",
      name: entry.name,
      isExpanded: true,
      children,
    };
  }

  return null;
}

function getFileFromEntry(fileEntry) {
  return new Promise((resolve, reject) => {
    fileEntry.file(resolve, reject);
  });
}

async function readDirectoryEntries(directoryEntry) {
  const reader = directoryEntry.createReader();
  const allEntries = [];

  while (true) {
    const batch = await new Promise((resolve, reject) => {
      reader.readEntries(resolve, reject);
    });

    if (!batch.length) break;
    allEntries.push(...batch);
  }

  const children = [];
  for (const entry of allEntries) {
    const built = await entryToItem(entry);
    if (built) children.push(built);
  }

  return children;
}

async function filesToItems(fileList) {
  const items = [];

  for (const file of fileList) {
    const content = await file.text();

    items.push({
      id: crypto.randomUUID(),
      type: "file",
      name: file.name,
      content,
      language: inferLanguageFromFileName(file.name),
    });
  }

  return items;
}

export default WorkspaceLayout;
