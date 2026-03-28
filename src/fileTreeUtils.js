/**
 * Flatten a nested item tree into a flat array with parent_id and position.
 * Each item gets { file_id, parent_id, type, name, content, language, is_expanded, position }.
 */
export function flattenTree(items, parentId = null) {
  const result = [];
  items.forEach((item, index) => {
    result.push({
      file_id: item.id,
      parent_id: parentId,
      type: item.type,
      name: item.name,
      content: item.content || "",
      language: item.language || "",
      is_expanded: item.isExpanded || false,
      position: index,
    });
    if (item.type === "folder" && item.children) {
      result.push(...flattenTree(item.children, item.id));
    }
  });
  return result;
}

/**
 * Rebuild a nested item tree from a flat array (as returned by the API).
 * Each flat item has { file_id, parent_id, type, name, content, language, is_expanded, position }.
 */
export function buildTree(flatList) {
  const map = new Map();
  const roots = [];

  // Create node objects
  for (const item of flatList) {
    const node = {
      id: item.file_id,
      type: item.type,
      name: item.name,
    };
    if (item.type === "file") {
      node.content = item.content || "";
      node.language = item.language || "Plain Text";
    } else {
      node.isExpanded = item.is_expanded || false;
      node.children = [];
    }
    map.set(item.file_id, { node, position: item.position, parentId: item.parent_id });
  }

  // Build parent-child relationships
  for (const { node, position, parentId } of map.values()) {
    if (parentId && map.has(parentId)) {
      map.get(parentId).node.children.push({ node, position });
    } else {
      roots.push({ node, position });
    }
  }

  // Sort children by position and unwrap
  const sortAndUnwrap = (entries) =>
    entries
      .sort((a, b) => a.position - b.position)
      .map(({ node }) => {
        if (node.children) {
          node.children = sortAndUnwrap(node.children);
        }
        return node;
      });

  return sortAndUnwrap(roots);
}
