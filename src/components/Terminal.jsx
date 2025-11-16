// components/Terminal.jsx
import React, { useRef, useEffect, useState } from "react";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import "@xterm/xterm/css/xterm.css";
import "./Terminal.css"
import { wait } from "@testing-library/user-event/dist/utils";


function XTerminal(props){
  const terminalRef = useRef(null);
  const terminal = useRef(null);
  const fitAddon = useRef(null);
  const [isInitialized, setIsInitialized] = useState(false);
  
  let command = 'ssh ' +  props.username + '@' + props.host + ' \r\n';

  //   if (props){
  //   host= props.host;
  //   port= props.port;
  //   username= props.username
  //   password= props.password
  // }

  useEffect(() => {
    // Инициализация терминала
    terminal.current = new Terminal({
      cursorBlink: true,
      fontSize: 14,
      fontFamily: 'Consolas, "Courier New", monospace', // подбор шрифтов тема спорная, есть идеи - предлагйте
      theme: {
        background: '#1e1e1e',
        foreground: '#ffffff'
      }
    });

    fitAddon.current = new FitAddon(); // штуковина, которая подгоняет размер терминала под его контейнер
    terminal.current.loadAddon(fitAddon.current);

    // крепим виртуальный терминал к реальному дому 
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
    // дожидаемся инициализации терминала
    if (!isInitialized || !window.electronAPI) return;

    const initPty = async () => {
      try {
        // Создаем PTY процесс
        await window.electronAPI.createPty(
          terminal.current.cols,
          terminal.current.rows
        );
        
        // Оиз пту в наш терминал
        window.electronAPI.onPtyData((event, data) => terminal.current.write(data));

        // из нашего терминала в пту
        terminal.current.onData((data) => window.electronAPI.writeToPty(data));

        // Обработка изменения размера
        terminal.current.onResize(({ cols, rows }) => window.electronAPI.resizePty(cols, rows));
        window.electronAPI.writeToPty(command)

      } catch (error) {
        // нейрогенеренный обработчик ошибки
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