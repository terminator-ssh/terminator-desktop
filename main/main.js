const { app, BrowserWindow, ipcMain } = require('electron');
const fs = require('fs')
const path = require('path');
const pty = require('node-pty');
const isDev = process.env.ELECTRON_IS_DEV === 'true';

/*
Файл с логикой Electron, именно тут происходит его магия: общение с системой и терминалом.

Как выглядит наш Электрон?
Из-за того, что Хром и Нода имеют ограничения в работе с ОС, мы не можем взаимодействовать с ней напрямую. 
За сим, получается такая архитектура, где сверху фронт, а снизу бек:
- Рекакт-компонет, он же render.js с точки зрения Электрон. Отвечает за UI и ничего не может сам.
- Мост: файл preload.js, который дает render.js возможность обратиться к мейн-процессу
- Мейн-процесс: файл main.js (Вы находитесь здесь), который обеспечивает общение с ОС. 

Где-то тут будет АПИ для общения с сервером.
*/


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
        name: 'xterm-pty-idk', // придумать адекватное название
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

  // Передаем в терминал
  ipcMain.handle('write-to-pty', (event, data) => {
    if (ptyProcess) {
      ptyProcess.write(data);
      return { success: true };
    }
    return { success: false };
  });

  // При изменении окна
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

   // Сложные Обработчики IPC для PTY
  ipcMain.handle('connect-ssh',  (e,  userName, port, host, keyName, password) => { // props = [keyName, username, port, host, password , command]
    console.log('CONNECT IT')
    console.log(userName, port, host, keyName, password)
    if (ptyProcess) {
      let command = 'ssh -i ' + process.cwd() + '/ssh/' + keyName + ' ' +  userName + '@' + host + ' \r\n';
      console.log(command)
      ptyProcess.write(command);
      command = password ;
      ptyProcess.on('data', (data) => {
        // Проверяем вывод на наличие ожидаемого маркера
        if (data.includes('password')) {
            ptyProcess.write(command + '\r');
        }
});
    }
  });

  // Обработчики IPC для файловой системы
  ipcMain.handle('save-file', async (e, buffer, fileName, targetDir) => {
    try {
      // console.log('IPC_SAVE_FILE')
      // const fileName = path.basename(file); // а можно захэшировать в фарш
      const rootDir = process.cwd();
      // console.log(rootDir)
      targetDir = path.join(rootDir, targetDir);
      // Нужно ли проверять наличие папки?
      const targetPath = path.join(targetDir, fileName);

      fs.writeFileSync(targetPath, Buffer.from(buffer)); // Работаем не с файлом,а с буфером - из рендера нельзя передать файл через Мост
      // console.log('IPC_SAVE_FILE: DONE')
      
      return { success: true, file: targetPath};   
    } catch (error) {
      return {success: false, error: error.message};
    }
  });

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }
  mainWindow.loadURL('http://localhost:3000');
}

app.whenReady().then(createWindow);

// Нейронка посоветовала подумать о яблочниках.
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