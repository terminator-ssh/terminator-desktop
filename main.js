const { app, BrowserWindow } = require('electron');

function createWindow() {
  // Создаем окно браузера
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true // Позволяет использовать Node.js в рендерере (хотя лучше использовать preload скрипт)
    }
  });

  // Загружаем HTML-файл
  win.loadFile('index.html');
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
