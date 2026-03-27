function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">EXPLORER</div>

      <div className="sidebar-section">
        <div className="sidebar-section-title">ITECIFY</div>

        <div className="empty-explorer">
          <p>No files or folders yet.</p>
          <span>Create a file or run a command to populate the workspace.</span>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;