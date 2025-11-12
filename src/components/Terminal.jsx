// components/Terminal.jsx
import React, { useRef, useEffect, useState } from "react";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import "@xterm/xterm/css/xterm.css";
import "./Terminal.css"

const XTerminal = () => {
  const terminalRef = useRef(null);
  const terminal = useRef(null);
  const fitAddon = useRef(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Инициализация терминала
    terminal.current = new Terminal({
      cursorBlink: true,
      fontSize: 14,
      fontFamily: 'Consolas, "Courier New", monospace',
      theme: {
        background: '#1e1e1e',
        foreground: '#ffffff'
      }
    });

    fitAddon.current = new FitAddon();
    terminal.current.loadAddon(fitAddon.current);

    if (terminalRef.current) {
      terminal.current.open(terminalRef.current);
      fitAddon.current.fit();
      setIsInitialized(true);
    }

    return () => {
      if (terminal.current) {
        terminal.current.dispose();
      }
      // Убиваем PTY процесс при размонтировании
      if (window.electronAPI) {
        window.electronAPI.killPty();
      }
    };
  }, []);

  useEffect(() => {
    if (!isInitialized || !window.electronAPI) return;

    const initPty = async () => {
      try {
        // Создаем PTY процесс
        await window.electronAPI.createPty(
          terminal.current.cols,
          terminal.current.rows
        );

        // Обработка данных от PTY
        window.electronAPI.onPtyData((event, data) => {
          terminal.current.write(data);
        });

        // Обработка ввода в терминал
        terminal.current.onData((data) => {
          window.electronAPI.writeToPty(data);
        });

        // Обработка изменения размера
        terminal.current.onResize(({ cols, rows }) => {
          window.electronAPI.resizePty(cols, rows);
        });

      } catch (error) {
        console.error('Failed to initialize PTY:', error);
        terminal.current.write('Error: Terminal initialization failed\r\n');
      }
    };

    initPty();
  }, [isInitialized]);

  return (
    <div className="terminal-container">
      <div 
        ref={terminalRef} 
        className="terminal" 
      />
    </div>
  );
};

export default XTerminal;


/**
 * 
import React, {useRef, useEffect} from "react";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import "@xterm/xterm/css/xterm.css";


const XTerminal = () => {
  const terminalRef = useRef(null);
  const terminal = useRef(null);
  const fitAddon = useRef(null);
  const ptyProcess = useRef(null)

  useEffect(() => {
    terminal.current = new Terminal({
      cursorBlink: true,
      fontSize: 14,
      fontFamily: 'Consolas',
      theme: {
        background: '#1e1e1e',
        foreground: '#ffffff'
      }
    });

    fitAddon.current = new FitAddon();
    terminal.current.loadAddon(fitAddon.current);

    // Цепляем созданный терминал к ДОМу
    if (terminalRef.current){
      terminal.current.open(terminalRef.current);
      fitAddon.current.fit();
    }

    // инициализируем pty процесс
    if (window.require){
      const spawn = window.require ('node-pty');
      const shell = process.platform === 'win32' ? 'powershell.exe' : 'bash';

      ptyProcess.current = spawn(shell, [], {
        name: 'xterm-pty-process-idk',
        cols: terminal.current.cols,
        rows: terminal.current.rows,
        cwd: process.cwd(), // Current Working Directory
        env: process.env, // переменные окруженя
      })

      // из pty  в наш терминал
      ptyProcess.current.onData((data) => terminal.current.write(data))
      // из нашего терминала в pty
      terminal.current.onData((data) => ptyProcess.current.write(data))
      // на случай изменения размера
      terminal.current.onResize(({cols, rows}) => ptyProcess.resize(cols, rows))

      // Добавляем тестовый вывод
      terminal.current.write('Hi World!\r\n');
      terminal.current.write('$ ');
      
      // terminal.current.onData((data) => {
      //   terminal.current.write(data);
      //   if (data === '\r') {
      //     terminal.current.write('\r\n$')
      //   }
      // })

      // Очистка
      return () => {
        if (ptyProcess.current) {
          ptyProcess.current.kill();
        }
        if (terminal.current) {
          terminal.current.dispose();
        }
      };
    }
    
  }, []); 
      
    return (
      <div className="terminal-container">
        <div ref={terminalRef} className="terminal" />
      </div>
    )
};

export default XTerminal;
  */