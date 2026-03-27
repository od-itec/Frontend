function Editor() {
  return (
    <section className="editor-panel">
      <div className="tabs-bar">
        <div className="tab active">untitled</div>
      </div>

      <div className="editor-wrapper">
        <textarea
          className="code-editor"
          placeholder="Start typing here..."
          spellCheck={false}
        />
      </div>
    </section>
  );
}

export default Editor;