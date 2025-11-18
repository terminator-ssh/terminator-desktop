const { contextBridge, ipcRenderer } = require('electron');
// const os = require('os');
// const path = require('path');

contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
  homeDir: () => os.homedir(),
  currentDir: () => process.cwd(),
  
  // типа апи между ренднром и главным процессом
  createPty: (cols, rows) => ipcRenderer.invoke('create-pty', { cols, rows }),
  writeToPty: (data) => ipcRenderer.invoke('write-to-pty', data),
  resizePty: (cols, rows) => ipcRenderer.invoke('resize-pty', { cols, rows }),
  onPtyData: (callback) => ipcRenderer.on('pty-data', callback),
  killPty: () => ipcRenderer.invoke('kill-pty'),
  
  // Апишечка для стореджа на клиенте
  // getStore: (key) => ipcRenderer.invoke('get-store', key),
  // setStore: (key, value) => ipcRenderer.invoke('set-store', key, value),
  // сторедж идет нахер

  // Функции для работы со Сториджем

  getAllConnections: () => {
    console.log('GETALL')
    const connections = localStorage.getItem('connections');
    console.log(connections)
    if (!connections) { return []; }
    try {
      return JSON.parse(connections);
    } catch (error) {
      console.error('Jib,rf j,hf,jnrb lfyys[ kjrfkmyjuj [hfybkbof', error);
      return [];
    }
    
  },

  saveAllConnections: (connectionsArray) => {
      console.log('SAVE'); 
      console.log(connectionsArray); 
      localStorage.setItem('connections', JSON.stringify(connectionsArray));
      console.log('SAVED:'); 
      console.log(localStorage.getItem('connections')); 
    },
  // clearAllConnections: () => { localStorage.setItem('connections', []); },

});

console.log('Preload script loaded');

