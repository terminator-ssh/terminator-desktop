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
  const connectedRef = useRef(false);
  const terminalMountedRef = useRef(false);

  useEffect(() => {
    if (!terminalRef.current || terminalMountedRef.current) return;

    if (connection.keyId && keysLoading) {
      setStatus('Loading Keys...');
      return;
    }

    terminalMountedRef.current = true;

    const term = new Terminal({
      cursorBlink: true,
      fontSize: 14,
      fontFamily: '"CascadiaMonoNF-SemiLight", "CascadiaMonoNF", "SourceCodeProNF", "Cascadia Code", ' +
        'Consolas, monospace',
      allowProposedApi: true,
      lineHeight: 1.1,
      theme: {
        background: '#16171b',
        foreground: '#ffffff',
        cursor: '#f8f8f2',
        selectionBackground: 'rgba(255, 255, 255, 0.3)',
      }
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);

    try {
      const webgl = new WebglAddon();
      webgl.onContextLoss(() => { term.dispose() });
      term.loadAddon(webgl);
    } catch (e) {
      console.warn("WebGL failed");
    }

    term.open(terminalRef.current);
    fitAddon.fit();
    xtermRef.current = term;
    fitAddonRef.current = fitAddon;

    term.attachCustomKeyEventHandler((arg) => {
      if (arg.repeat) return false;

      // Ctrl + Shift + C
      if (arg.ctrlKey && arg.shiftKey && arg.code === 'KeyC' && arg.type === 'keydown') {
        const selection = term.getSelection();
        if (selection) {
          navigator.clipboard.writeText(selection);
          return false;
        }
      }
      // Ctrl + Shift + V
      if (arg.ctrlKey && arg.shiftKey && arg.code === 'KeyV' && arg.type === 'keydown') {
        navigator.clipboard.readText().then(text => {
          window.electron.ipcRenderer.send(IPC.SSH.INPUT, { id: sessionId, data: text });
        });
        return false;
      }
      return true;
    });

    terminalRef.current.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      navigator.clipboard.readText().then(text => {
        if(text) window.electron.ipcRenderer.send(IPC.SSH.INPUT, { id: sessionId, data: text });
      });
    });


    const sendResize = () => {
      window.electron.ipcRenderer.send(IPC.SSH.RESIZE, {
        id: sessionId,
        cols: term.cols,
        rows: term.rows
      });
    };

    let resolvedConnection = { ...connection };
    if (connection.keyId) {
      const key = keys.find(k => k.id === connection.keyId);
      if (key) (resolvedConnection as any).privateKey = key.privateKey;
    }

    setStatus('Connecting...');

    if (!connectedRef.current) {
      connectedRef.current = true;

      window.electron.ipcRenderer.invoke(IPC.SSH.CONNECT, { ...resolvedConnection, id: sessionId })
        .then(() => {
          setStatus('Connected');
          fitAddon.fit();
          sendResize();
          term.focus();
        })
        .catch((err: any) => {
          setStatus('Error');
          term.writeln(`\r\n\x1b[31mConnection failed: ${err.message}\x1b[0m\r\n`);
        });
    }

    term.onData((data) => {
      window.electron.ipcRenderer.send(IPC.SSH.INPUT, { id: sessionId, data });
    });

    const removeListener = window.electron.ipcRenderer.on(IPC.SSH.DATA, (_, { id, data }) => {
      if (id === sessionId) term.write(data);
    });

    const resizeObserver = new ResizeObserver(() => {
      if (isActive && containerRef.current?.offsetParent) {
        fitAddon.fit();
        sendResize();
      }
    });
    if (containerRef.current) resizeObserver.observe(containerRef.current);

    return () => {
      removeListener();
      resizeObserver.disconnect();
      window.electron.ipcRenderer.send(IPC.SSH.DISCONNECT, sessionId);
      term.dispose();
      connectedRef.current = false;
      terminalMountedRef.current = false;
    };
  }, [keysLoading]);

  useEffect(() => {
    if (isActive && fitAddonRef.current && xtermRef.current && containerRef.current?.offsetParent) {
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
    }
  }, [isActive, sessionId]);

  const handleDisconnect = () => {
    removeSession(sessionId);
  };

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
        <button onClick={handleDisconnect} className="text-gray-400 hover:text-red-400 flex items-center gap-1 text-xs font-medium px-2 py-1 rounded hover:bg-white/5 transition-colors">
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
