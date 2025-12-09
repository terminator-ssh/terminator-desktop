const { contextBridge, ipcRenderer } = require('electron');

/*
 Это наш, с позволения сказать, мост между Рендером и Электроном.
*/

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
  
  establishSSHConnection: ( username, port, host,keyName, password ) => {
    console.log('BRIDGE')
    console.log({ username, port, host,keyName, password })
    ipcRenderer.invoke('connect-ssh',  username, port, host,keyName, password )
},



  // Апишечка для стореджа на клиенте
  // getStore: (key) => ipcRenderer.invoke('get-store', key),
  // setStore: (key, value) => ipcRenderer.invoke('set-store', key, value),
  // сторедж идет нахер

  /* Функции для работы с ЛокалСториджем */
  // Получить все коннекты
  getAllConnections: () => {
    // console.log('GETALL')
    const connections = localStorage.getItem('connections');
    // console.log(connections)
    if (!connections) { return []; }
    try {
      return JSON.parse(connections);
    } catch (error) {
      console.error('Jib,rf j,hf,jnrb lfyys[ kjrfkmyjuj [hfybkbof', error);
      return [];
    }
    
  },

  // Сохранить все коннекты. Возможно, стоит хранить каждый коннект отдельно? Да не, бред какой-то.
  saveAllConnections: (connectionsArray) => { localStorage.setItem('connections', JSON.stringify(connectionsArray));  },
  // clearAllConnections: () => { localStorage.setItem('connections', []); }, // Черная магия лишит тебя всего!
  
  /* Функции для работы с ОС */
  // Сохранить файл в папку ssh/
  saveFile: (buffer, fileName) => ipcRenderer.invoke('save-file', buffer, fileName, '/ssh/')
});

console.log('Preload script loaded');

