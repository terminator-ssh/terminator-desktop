import React, { useEffect, useRef } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import './Terminal.css';

const XTerminal = () => {
  const terminalRef = useRef(null);
  const terminal = useRef(null);
  const fitAddon = useRef(null);

  useEffect(() => {
    // Инициализация терминала
    terminal.current = new Terminal({
      cursorBlink: true,
      theme: {
        background: '#1e1e1e',
        foreground: '#cccccc'
      }
    });

    fitAddon.current = new FitAddon();
    terminal.current.loadAddon(fitAddon.current);

    // Подключаем терминал к DOM
    if (terminalRef.current) {
      terminal.current.open(terminalRef.current);
      fitAddon.current.fit();
      
      // Добавляем тестовые команды
      terminal.current.writeln('Welcome to Electron Terminal!');
      terminal.current.writeln('Try typing commands...');
      terminal.current.write('$ ');
      
      // Обработка ввода
      terminal.current.onData((data) => {
        handleInput(data);
      });
    }

    // Обработка изменения размера окна
    const handleResize = () => {
      fitAddon.current.fit();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      terminal.current.dispose();
    };
  }, []);

  const handleInput = (data) => {
    const code = data.charCodeAt(0);
    
    // Обработка Backspace
    if (code === 127) {
      terminal.current.write('\b \b');
      return;
    }
    
    // Обработка Enter
    if (code === 13) {
      terminal.current.write('\r\n$ ');
      return;
    }
    
    // Вывод введенных символов
    terminal.current.write(data);
  };

  return (
    <div className="terminal-container">
      <div ref={terminalRef} className="terminal" />
    </div>
  );
};

export default XTerminal;