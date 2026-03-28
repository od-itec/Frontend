import { useState } from "react";

function TerminalPanel() {
  const [lines, setLines] = useState([]);
  const [command, setCommand] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    const trimmed = command.trim();
    if (!trimmed) return;

    const nextLines = [...lines, `$ ${trimmed}`];

    if (trimmed === "clear") {
      setLines([]);
      setCommand("");
      return;
    }

    if (trimmed.startsWith("echo ")) {
      nextLines.push(trimmed.slice(5));
    } else if (trimmed === "pwd") {
      nextLines.push("/workspace");
    } else if (trimmed === "help") {
      nextLines.push("Available commands: help, clear, echo, pwd");
    } else {
      nextLines.push(`Command not found: ${trimmed}`);
    }

    setLines(nextLines);
    setCommand("");
  };

  return (
    <section className="terminal-panel">
      <div className="terminal-output">
        {lines.map((line, index) => (
          <div key={`${line}-${index}`} className="terminal-line">
            {line}
          </div>
        ))}
      </div>

      <form className="terminal-input-row" onSubmit={handleSubmit}>
        <span className="terminal-prompt">$</span>
        <input
          className="terminal-input"
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          placeholder="Type a command..."
          spellCheck={false}
        />
      </form>
    </section>
  );
}

export default TerminalPanel;