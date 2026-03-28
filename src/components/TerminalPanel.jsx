import { useEffect, useRef, useCallback } from "react";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import { WebLinksAddon } from "@xterm/addon-web-links";
import "@xterm/xterm/css/xterm.css";
import { getToken } from "../api";

/**
 * TerminalPanel — real interactive shell via WebSocket → DinD container.
 *
 * Props:
 *   theme  – "sky" | "graphite" (controls xterm color scheme)
 */
function TerminalPanel({ theme = "graphite" }) {
  const containerRef = useRef(null);
  const termRef = useRef(null);
  const fitAddonRef = useRef(null);
  const wsRef = useRef(null);
  const sessionIdRef = useRef(crypto.randomUUID());

  const connect = useCallback(() => {
    const token = getToken();
    if (!token) return;

    const proto = window.location.protocol === "https:" ? "wss:" : "ws:";
    const host = window.location.host;
    const sessionId = sessionIdRef.current;
    const url = `${proto}//${host}/api/ws/terminal/${sessionId}?token=${encodeURIComponent(token)}`;

    const ws = new WebSocket(url);
    ws.binaryType = "arraybuffer";
    wsRef.current = ws;

    ws.onopen = () => {
      if (termRef.current) {
        termRef.current.clear();
        termRef.current.writeln("\x1b[32mConnected to workspace terminal.\x1b[0m\r\n");
      }
    };

    ws.onmessage = (event) => {
      if (!termRef.current) return;
      if (event.data instanceof ArrayBuffer) {
        termRef.current.write(new Uint8Array(event.data));
      } else {
        termRef.current.write(event.data);
      }
    };

    ws.onclose = (event) => {
      if (termRef.current) {
        termRef.current.writeln(
          `\r\n\x1b[33mDisconnected (code ${event.code}). Press Enter to reconnect.\x1b[0m`
        );
      }
    };

    ws.onerror = () => {
      if (termRef.current) {
        termRef.current.writeln("\r\n\x1b[31mWebSocket error.\x1b[0m");
      }
    };
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;

    const isDark = theme !== "sky";

    const term = new Terminal({
      cursorBlink: true,
      fontSize: 13,
      fontFamily: 'Consolas, "Courier New", monospace',
      theme: isDark
        ? {
            background: "#1e1e1e",
            foreground: "#d4d4d4",
            cursor: "#d4d4d4",
            selectionBackground: "#264f78",
          }
        : {
            background: "#ffffff",
            foreground: "#0f172a",
            cursor: "#0f172a",
            selectionBackground: "#b6d4fe",
          },
      convertEol: true,
      allowProposedApi: true,
    });

    const fitAddon = new FitAddon();
    const webLinksAddon = new WebLinksAddon();
    term.loadAddon(fitAddon);
    term.loadAddon(webLinksAddon);

    term.open(containerRef.current);
    fitAddon.fit();

    termRef.current = term;
    fitAddonRef.current = fitAddon;

    term.writeln("Connecting to workspace terminal…\r\n");

    // Send keystrokes to WebSocket
    term.onData((data) => {
      const ws = wsRef.current;
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(data);
      } else if (data === "\r") {
        // Enter pressed while disconnected — reconnect
        sessionIdRef.current = crypto.randomUUID();
        connect();
      }
    });

    // Handle binary data input (paste, etc.)
    term.onBinary((data) => {
      const ws = wsRef.current;
      if (ws && ws.readyState === WebSocket.OPEN) {
        const buf = new Uint8Array(data.length);
        for (let i = 0; i < data.length; i++) buf[i] = data.charCodeAt(i);
        ws.send(buf);
      }
    });

    // Resize handler
    const handleResize = () => {
      fitAddon.fit();
    };
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(containerRef.current);

    // Connect
    connect();

    return () => {
      resizeObserver.disconnect();
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      term.dispose();
      termRef.current = null;
    };
  }, [theme, connect]);

  return (
    <section className="terminal-panel">
      <div
        ref={containerRef}
        style={{ width: "100%", height: "100%", overflow: "hidden" }}
      />
    </section>
  );
}

export default TerminalPanel;