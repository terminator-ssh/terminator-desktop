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

    // Функция-фабрика 
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
});