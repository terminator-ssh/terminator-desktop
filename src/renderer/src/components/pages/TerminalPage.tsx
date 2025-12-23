import { useEffect, useRef, useState } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { WebglAddon } from '@xterm/addon-webgl';
import '@xterm/xterm/css/xterm.css';
import { Host, IPC } from '../../../../shared/types';

interface TerminalPageProps {
  connection: Host;
}

const TerminalPage = ({ connection }: TerminalPageProps) => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<Terminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const [status, setStatus] = useState('Disconnected');

  useEffect(() => {
    if (!terminalRef.current) return;

    // 1. Initialize Xterm
    const term = new Terminal({
      cursorBlink: true,
      fontSize: 14,
      fontFamily: 'Menlo, Monaco, "Courier New", monospace',
      theme: {
        background: '#16171b',
        foreground: '#ffffff',
      }
    });

    const fitAddon = new FitAddon();
    const webglAddon = new WebglAddon();

    term.loadAddon(fitAddon);
    try {
      term.loadAddon(webglAddon);
    } catch (e) {
      console.warn("WebGL addon failed to load", e);
    }

    term.open(terminalRef.current);
    fitAddon.fit();
    xtermRef.current = term;
    fitAddonRef.current = fitAddon;

    // 2. Handle Resize
    const handleResize = () => {
      fitAddon.fit();
      if(connection.id) {
        window.electron.ipcRenderer.send(IPC.SSH.RESIZE, {
          id: connection.id,
          cols: term.cols,
          rows: term.rows
        });
      }
    };
    window.addEventListener('resize', handleResize);

    // 3. Connect to SSH Backend
    setStatus('Connecting...');

    window.electron.ipcRenderer.invoke(IPC.SSH.CONNECT, connection)
      .then(() => {
        setStatus('Connected');
        term.writeln(`\r\nConnected to ${connection.host}\r\n`);
        handleResize();
      })
      .catch((err: any) => {
        setStatus('Error');
        term.writeln(`\r\nConnection failed: ${err.message}\r\n`);
      });

    // 4. Data Flow
    // Input
    term.onData((data) => {
      window.electron.ipcRenderer.send(IPC.SSH.INPUT, { id: connection.id, data });
    });

    // Output
    const removeListener = window.electron.ipcRenderer.on(IPC.SSH.DATA, (_, { id, data }) => {
      if (id === connection.id) {
        term.write(data);
      }
    });

    return () => {
      removeListener();
      window.electron.ipcRenderer.send(IPC.SSH.DISCONNECT, connection.id);
      window.removeEventListener('resize', handleResize);
      term.dispose();
    };
  }, [connection]);

  return (
    <div className="flex flex-col h-full w-full bg-[#16171b]">
      {/* Header Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#2b2d33] border-b border-gray-800 h-12">
        <div className="text-gray-200 text-sm font-medium">
          {connection.username}@{connection.host}
        </div>
        <div className={`text-xs px-2 py-1 rounded ${status === 'Connected' ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'}`}>
          {status}
        </div>
      </div>

      {/* Terminal Container */}
      <div className="flex-1 p-1 overflow-hidden relative">
        <div ref={terminalRef} className="absolute inset-0" />
      </div>
    </div>
  );
};

export default TerminalPage
