import { useEffect, useRef } from "react";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import { WebLinksAddon } from "@xterm/addon-web-links";
import "@xterm/xterm/css/xterm.css";
import { getToken } from "../api";

/**
 * Real interactive terminal backed by a WebSocket connection
 * to a K8s pod exec PTY.
 *
 * Props:
 *   podType  – "frontend" | "backend"
 *   isOpen   – whether the panel is currently visible (used to trigger fit)
 */
function TerminalPanel({ podType = "frontend", isOpen = true }) {
  const containerRef = useRef(null);
  const termRef = useRef(null);
  const fitRef = useRef(null);
  const wsRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Create terminal
    const term = new Terminal({
      cursorBlink: true,
      fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', Menlo, monospace",
      fontSize: 13,
      theme: {
        background: "#0f172a",
        foreground: "#d4d4d4",
        cursor: "#38bdf8",
        selectionBackground: "rgba(37, 99, 235, 0.45)",
      },
    });

    const fitAddon = new FitAddon();
    const webLinksAddon = new WebLinksAddon();
    term.loadAddon(fitAddon);
    term.loadAddon(webLinksAddon);

    term.open(containerRef.current);
    fitAddon.fit();

    termRef.current = term;
    fitRef.current = fitAddon;

    // Connect WebSocket
    const token = getToken();
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/api/ws/terminal?token=${encodeURIComponent(token)}&pod_type=${encodeURIComponent(podType)}`;

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      term.writeln("\x1b[32mConnected to workspace terminal.\x1b[0m\r");
      // Send initial resize
      const dims = fitAddon.proposeDimensions();
      if (dims) {
        ws.send(JSON.stringify({ type: "resize", cols: dims.cols, rows: dims.rows }));
      }
    };

    ws.onmessage = (event) => {
      term.write(event.data);
    };

    ws.onclose = (event) => {
      term.writeln(`\r\n\x1b[31mDisconnected (code ${event.code}).\x1b[0m`);
    };

    ws.onerror = () => {
      term.writeln("\r\n\x1b[31mWebSocket error.\x1b[0m");
    };

    // Forward user keystrokes to the pod
    term.onData((data) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(data);
      }
    });

    // Handle terminal resize
    const resizeObserver = new ResizeObserver(() => {
      fitAddon.fit();
      const dims = fitAddon.proposeDimensions();
      if (dims && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: "resize", cols: dims.cols, rows: dims.rows }));
      }
    });
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      ws.close();
      term.dispose();
    };
  }, [podType]);

  // Re-fit when panel visibility changes
  useEffect(() => {
    if (isOpen && fitRef.current) {
      // Small delay to let CSS transition finish
      const timer = setTimeout(() => fitRef.current.fit(), 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  return (
    <section className="terminal-panel" style={{ height: "100%", overflow: "hidden" }}>
      <div ref={containerRef} style={{ width: "100%", height: "100%" }} />
    </section>
  );
}

export default TerminalPanel;