//
// Волшебная штука, которая всё рисует. И, в частности, терминал.
//
const { Terminal, FitAddon } = window.electronAPI;
const terminalContainer = document.getElementById('terminal-container');
const termAPI = window.electronAPI.createTerminal(terminalContainer);

// 1. Отправка ввода пользователя в главный процесс через Preload скрипт
termAPI.onData(data => {
    console.log("Отправка ввода в главный процесс:", data);
    // 'electronAPI' предоставлен через contextBridge в preload.js
    window.electronAPI.sendTerminalInput(data);
});

// 2. Обработка вывода из главного процесса и запись в терминал xterm.js
window.electronAPI.handleTerminalOutput((data) => {
    termAPI.write(data);
});

// 3. Автоматическое масштабирование терминала при изменении размера окна
window.addEventListener('resize', () => {
    termAPI.fit();
});

// Первичное масштабирование при загрузке
termAPI.fit();
