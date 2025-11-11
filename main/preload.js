const { contextBridge, ipcRenderer } = require('electron');

// Предоставляем безопасные API для рендер-процесса
contextBridge.exposeInMainWorld('electronAPI', {
  // Здесь можно добавить методы для взаимодействия с main process
  platform: process.platform,
  versions: process.versions
});