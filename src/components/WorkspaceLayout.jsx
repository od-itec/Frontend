import Sidebar from "./Sidebar";
import Editor from "./Editor";
import "./WorkspaceLayout.css";

function WorkspaceLayout() {
  return (
    <div className="workspace-shell">
      <Sidebar />
      <Editor />
    </div>
  );
}

export default WorkspaceLayout;