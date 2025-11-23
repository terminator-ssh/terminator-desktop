
import React, { useEffect, useRef, useState } from 'react';
import XTerminal from '../../../Terminal/Terminal';
import "./SSHForm.css";

const SSHConnectionForm = ({ onUpdate }) => {
  const [formData, setFormData] = useState({
    name: '',
    host: '',
    port: '22',
    username: '',
    password: '',
    privateKeyPath: ''
  });
  
  const prepareFormData = () => { // ТУДУ: исправить это всё
    return {
        name: formData.name,
        host: formData.host,
        port: formData.port,
        username: formData.username,
        password: formData.password,
        privateKeyPath: getKeyPath(formData.privateKeyPath)
        // privateKeyPath: formData.privateKeyPath.replace('C:\\fakepath\\', '')
    }
  }
  const getKeyPath = (keyPath) => { if (keyPath) return keyPath.split('\\')[2]; else return []}

  async function copyKeyToDir(keyFile) {
    console.log('COPY KEY')
    console.log(keyFile)
    if (!keyFile) {
      alert('Файл не выбран.');
      return;
    }
    try {
      console.log('SENDING TO API')
      const arrayBuffer = await keyFile.arrayBuffer();
      const buffer = new Uint8Array(arrayBuffer);
      const result = await window.electronAPI.saveFile(buffer,  keyFile.name);
      if (result.success) {
        // console.log('success i guess')
        fileInputRef.current.value = '';
      } else {
        alert('Ошибка: ' + result.error);
      }
    } catch (error) {
      alert('Ошибка при сохранении файла');
    }
  };
  

  const [isTerminalVisible, setTerminalVisible] = useState(false) 
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });console.log(formData)
  };

  const handleRemoveTerminal = (e) => {
    e.preventDefault();
    setTerminalVisible(false)
  };
  const handleSave = (e) => {
    e.preventDefault();
    const currentConnections = window.electronAPI.getAllConnections();
    if (formData in currentConnections) alert('Replace it?')
    console.log('SAVING STARTED')
    copyKeyToDir(fileInputRef.current.files[0]);
    currentConnections.push(prepareFormData());
    // console.log(currentConnections);
    window.electronAPI.saveAllConnections(currentConnections);
    if (onUpdate) onUpdate();
  };

  const handleConnect = (e) => {
    e.preventDefault();
    setTerminalVisible(false)
    console.log('handleConnect:', formData);
    setTerminalVisible(true)
  };

  const handleCancel = (e, isEditing) => {
    e.preventDefault();
    console.log('Cancelled');
    if (isEditing) {
      isEditing(false);
    } else {
      
    }
  }
 

  return (
    <div>
      <h2>SSH Подключение</h2>
      <form className='newHostForm'>
        <div>
          <label>Название:</label>
          <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="" required/>
        </div>
        <div>
          <label>Хост:</label>
          <input type="text" name="host" value={formData.host} onChange={handleChange} placeholder="example.com" required/>
        </div>

        <div>
          <label>Порт:</label>
          <input type="number" name="port" value={formData.port} onChange={handleChange} placeholder="22"/>
        </div>

        <div>
          <label>Имя пользователя:</label>
          <input type="text" name="username" value={formData.username} onChange={handleChange} placeholder="user" required/>
        </div>

        <div>
          <label>Пароль:</label>
          <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="••••••••"/>
        </div>

        <div>
          <label>Приватный ключ:</label>
          <input type="file" name="privateKeyPath" value={formData.privateKeyPath} ref={fileInputRef}  onChange={handleChange}/>
        </div>  

        <button type="submit" onClick={handleRemoveTerminal}>удалить терминал нахрен</button>        {/* Служебная кнопка */}
        <button type="submit" onClick={handleConnect}>Подключиться</button>
        <button type="submit" onClick={handleSave}>Сохранить</button>
        <button type="submit" onClick={handleCancel}>Отмена</button>
      </form>
            
        {/* Условный рендеринг:  */}
      {isTerminalVisible && (
        <XTerminal
          host={formData.host}
          port={formData.port}
          username={formData.username}
          keyName = {getKeyPath(formData.privateKeyPath)}
          />
      )}
    </div>
  );
};

export default SSHConnectionForm;