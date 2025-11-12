const { contextBridge, ipcRenderer } = require('electron');
const os = require('os');
const path = require('path');

contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
  homeDir: () => os.homedir(),
  currentDir: () => process.cwd(),
  
  // типа апи
  createPty: (cols, rows) => ipcRenderer.invoke('create-pty', { cols, rows }),
  writeToPty: (data) => ipcRenderer.invoke('write-to-pty', data),
  resizePty: (cols, rows) => ipcRenderer.invoke('resize-pty', { cols, rows }),
  onPtyData: (callback) => ipcRenderer.on('pty-data', callback),
  killPty: () => ipcRenderer.invoke('kill-pty')
});


/*
//
// Ноду нельзя пускать в рендер - поэтому её магия остается тут. Это МОСТ между рендером и Нодой
//
const { contextBridge, ipcRenderer } = require('electron');
const { Terminal } = require('@xterm/xterm'); 
const { FitAddon } = require('@xterm/addon-fit'); 



contextBridge.exposeInMainWorld('electronAPI', {
  
  // Эта функция просто отправляет ВВОД в главный процесс
  sendTerminalInput: (data) => ipcRenderer.send('terminal-input', data),

  // Эта функция предоставляет КОЛБЭК для получения ВЫВОДА в рендерере
  handleTerminalOutput: (callback) => {
      // Здесь мы просто передаем callback из рендерера обратно в рендерер при получении события
      ipcRenderer.on('terminal-output', (event, data) => callback(data));
  },

  // Функция-фабрика для терминала, поскольку в рендере нельзя неосредственно создать новый обьект терминала  
  createTerminal: (container) => {
      const term = new Terminal(); 
      const fitAddon = new FitAddon();
      
      term.loadAddon(fitAddon);
      term.open(container);
      
      return {
          onData: (callback) => term.onData(callback),
          write: (data) => term.write(data), // Используется в renderer.js
          fit: () => fitAddon.fit(),
      };
  }

  // platform: process.platform,
  // versions: process.versions
});
*/