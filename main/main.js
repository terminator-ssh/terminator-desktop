const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const pty = require('node-pty');
const isDev = process.env.ELECTRON_IS_DEV === 'true';

let ptyProcess = null

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      // Указываем путь к скрипту preload, который будет иметь доступ к IPC и DOM
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true, // ДОЛЖНО БЫТЬ ТРУ ДЛЯ БЕЗОПАСНОСТИ
      sandbox: false, //Мы же не полезем в Интернет?
      webSecurity: true // В проде должно быть ТРУ
    }
  });


  // Обработчики IPC для PTY
  ipcMain.handle('create-pty', (event, { cols, rows }) => {
    try {
      const shell = process.platform === 'win32' ? 'powershell.exe' : 'bash';
      
      ptyProcess = pty.spawn(shell, [], {
        name: 'xterm-pty-idk',
        cols: cols,
        rows: rows,
        cwd: process.cwd(), // Current Working Directory
        env: process.env, // переменные окруженя
      });

      ptyProcess.onData((data) => mainWindow.webContents.send('pty-data', data));
      ptyProcess.onExit(() => ptyProcess = null);

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('write-to-pty', (event, data) => {
    if (ptyProcess) {
      ptyProcess.write(data);
      return { success: true };
    }
    return { success: false };
  });

  ipcMain.handle('resize-pty', (event, { cols, rows }) => {
    if (ptyProcess) {
      ptyProcess.resize(cols, rows);
      return { success: true };
    }
    return { success: false };
  });

  ipcMain.handle('kill-pty', () => {
    if (ptyProcess) {
      ptyProcess.kill();
      ptyProcess = null;
    }
    return { success: true };
  });


  if (isDev) {
    mainWindow.webContents.openDevTools();
  }
  // else { mainWindow.loadFile(path.join(__dirname, '../build/index.html'));  }
  mainWindow.loadURL('http://localhost:3000');
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});