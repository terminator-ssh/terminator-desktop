const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const pty = require('node-pty');
const os = require('os');

// Выбор системной оболочки в зависимости от ОС
const shell = os.platform() === 'win32' ? 'powershell.exe' : 'bash';

function createWindow() {
  // Создаем окно браузера
  const win = new BrowserWindow({
    width: 900,
    height: 800,
    webPreferences: {
      // Указываем путь к скрипту preload, который будет иметь доступ к IPC и DOM
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true, // ДОЛЖНО БЫТЬ ТРУ ДЛЯ БЕЗОПАСНОСТИ
      sandbox: false // Мы же не полезем в Интернет?
    }
  });

  // Загружаем HTML-файл
  win.loadFile('index.html');

  win.webContents.openDevTools(); // Чтоб каждый раз не тыкать ctrl+shift+I

  // 1. Создаем новый процесс pty
    const ptyProcess = pty.spawn(shell, [], {
        name: 'xterm-color',
        cols: 80,
        rows: 30,
        cwd: process.env.HOME,
        env: process.env
    });

    // 2. Отправляем вывод терминала из pty в окно рендеринга
    ptyProcess.onData(data => {
        // Отправляем данные в рендерер через IPC
        win.webContents.send('terminal-output', data);
    });

    // 3. Обрабатываем ввод пользователя из окна рендеринга (клавиатура)
    ipcMain.on('terminal-input', (event, input) => {
      console.log("Получен ввод из рендерера, запись в pty:", input);
        // Записываем полученный ввод в процесс pty
        ptyProcess.write(input);
    });
}

// Когда приложение готово, создаем окно
app.whenReady().then(createWindow);

// Закрываем приложение, когда все окна закрыты (кроме macOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // Для macOS: если приложение активно, а окон нет, создаем новое
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
