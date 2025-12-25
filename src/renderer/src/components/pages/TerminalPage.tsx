import { useEffect, useRef, useState } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { WebglAddon } from '@xterm/addon-webgl';
import { XCircle } from 'lucide-react';
import '@xterm/xterm/css/xterm.css';
import { Host, IPC } from '../../../../shared/types';
import { useStore } from '@/store/useStore';
import { useKeys } from '@/hooks/useData';

interface TerminalPageProps {
  connection: Host;
  sessionId: string;
  isActive: boolean;
}

const TerminalPage = ({ connection, sessionId, isActive }: TerminalPageProps) => {
  const { removeSession } = useStore();

  const { data: keys = [], isLoading: keysLoading } = useKeys();

  const containerRef = useRef<HTMLDivElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<Terminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);

  const [status, setStatus] = useState('Initializing...');

  const connectionInitiatedRef = useRef(false);
  const terminalMountedRef = useRef(false);

  useEffect(() => {
    if (!terminalRef.current || terminalMountedRef.current) return;
    terminalMountedRef.current = true;

    const term = new Terminal({
      cursorBlink: true,
      fontSize: 14,
      fontFamily: 'Menlo, Monaco, "Courier New", monospace',
      theme: { background: '#16171b', foreground: '#ffffff' }
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    try { term.loadAddon(new WebglAddon()); } catch (e) { }

    term.open(terminalRef.current);
    fitAddon.fit();

    xtermRef.current = term;
    fitAddonRef.current = fitAddon;

    return () => {
      window.electron.ipcRenderer.send(IPC.SSH.DISCONNECT, sessionId);
      term.dispose();
      connectionInitiatedRef.current = false;
      terminalMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!xtermRef.current || connectionInitiatedRef.current) return;

    let resolvedKey = '';

    if (connection.keyId) {
      const foundKey = keys.find(k => k.id === connection.keyId);

      if (!foundKey) {
        if (keysLoading) {
          setStatus('Loading Keys...');
          return;
        } else {
          xtermRef.current.writeln(`\x1b[31mError: Key (ID: ${connection.keyId}) not found in vault.\x1b[0m`);
          setStatus('Key Missing');
          connectionInitiatedRef.current = true;
          return;
        }
      }
      resolvedKey = foundKey.privateKey;
    }

    connectionInitiatedRef.current = true;
    const term = xtermRef.current;
    const fitAddon = fitAddonRef.current;

    const onDataDispose = term.onData((data) => {
      window.electron.ipcRenderer.send(IPC.SSH.INPUT, { id: sessionId, data });
    });

    const removeDataListener = window.electron.ipcRenderer.on(IPC.SSH.DATA, (_, { id, data }) => {
      if (id === sessionId) term.write(data);
    });

    setStatus('Connecting...');

    const payload = { ...connection };
    if(resolvedKey) (payload as any).privateKey = resolvedKey;

    window.electron.ipcRenderer.invoke(IPC.SSH.CONNECT, { ...payload, id: sessionId })
      .then(() => {
        setStatus('Connected');
        term.writeln(`\r\nConnected to ${connection.host}\r\n`);
        fitAddon?.fit();
        window.electron.ipcRenderer.send(IPC.SSH.RESIZE, {
          id: sessionId,
          cols: term.cols,
          rows: term.rows
        });
      })
      .catch((err: any) => {
        setStatus('Error');
        term.writeln(`\r\nConnection failed: ${err.message}\r\n`);
      });

    return () => {
      onDataDispose.dispose();
      removeDataListener();
    };

  }, [keys, keysLoading, connection, sessionId]);

  useEffect(() => {
    if (!isActive || !fitAddonRef.current || !xtermRef.current || !containerRef.current?.offsetParent) return;

    setTimeout(() => {
      fitAddonRef.current?.fit();
      if(status === 'Connected') {
        window.electron.ipcRenderer.send(IPC.SSH.RESIZE, {
          id: sessionId,
          cols: xtermRef.current!.cols,
          rows: xtermRef.current!.rows
        });
      }
      xtermRef.current?.focus();
    }, 50);
  }, [isActive, sessionId, status]);

  return (
    <div ref={containerRef} className="flex flex-col h-full w-full bg-[#16171b]">
      <div className="flex items-center justify-between px-4 py-2 bg-[#2b2d33] border-b border-gray-800 h-12">
        <div className="flex items-center gap-3">
          <div className={`text-xs px-2 py-1 rounded ${status === 'Connected' ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'}`}>
            {status}
          </div>
          <div className="text-gray-200 text-sm font-medium">
            {connection.username}@{connection.host}
          </div>
        </div>
        <button onClick={() => removeSession(sessionId)} className="text-gray-400 hover:text-red-400 flex items-center gap-1 text-xs font-medium px-2 py-1 rounded hover:bg-white/5 transition-colors">
          <XCircle size={16} /> Disconnect
        </button>
      </div>
      <div className="flex-1 p-1 overflow-hidden relative">
        <div ref={terminalRef} className="absolute inset-0" />
      </div>
    </div>
  );
};

export default TerminalPage;
