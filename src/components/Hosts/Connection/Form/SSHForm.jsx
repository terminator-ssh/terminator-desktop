
import React, { useRef, useState } from 'react';
import XTerminal from '../../../Terminal/Terminal';
import "./SSHForm.css";

/* Компонент - Форма Создания одключения. ПЕРЕДЕЛАТЬ этот цирк. */

const SSHConnectionForm = ({ onUpdate }) => {
  // Храню все в одной пачке, это было удобно... Но будет ли удобно в будущем?
  const [formData, setFormData] = useState({
    name: '',
    host: '',
    port: '22',
    username: '',
    password: '',
    privateKeyPath: ''
  });

  // 
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
  // Извликает из С://fakepath/FileName имя файла. Быть может, PWA не так уж круто? Очередное ограничение браузерного прошлого.
  const getKeyPath = (keyPath) => { if (keyPath) return keyPath.split('\\')[2]; else return []}

  // обрабатываем файл и высылаем в Электрон, чтобы тот сохранил его по адресу ssh/
  async function copyKeyToDir(keyFile) {
    // console.log('COPY KEY')
    // console.log(keyFile)
    if (!keyFile) {
      alert('Файл не выбран.');
      return;
    }
    try {
      // console.log('SENDING TO API')
      const arrayBuffer = await keyFile.arrayBuffer();
      const buffer = new Uint8Array(arrayBuffer); // Через мост нельзя отправить файл, это же не зашкварный PHP. Пихаем его в такой буфер.
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

  // Нейронка сгенерила по SE6, но я слишком стар для SE6. 
  // Помещает в состояние данные, введенные в форму.
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    }); // console.log(formData)
  };

  const handleRemoveTerminal = (e) => {
    e.preventDefault();
    setTerminalVisible(false)
  };

  // Сохранение подключения.
  const handleSave = (e) => {
    e.preventDefault();
    
    // Получаем актуальный список подключений
    const currentConnections = window.electronAPI.getAllConnections(); 
    // Тут должна быть проверка на уникальность, но мне не платят
    // console.log('SAVING STARTED')
    copyKeyToDir(fileInputRef.current.files[0]); // Работа с файликом, сделать обработку "ЕСЛИ успешно то продолжаем"
    currentConnections.push(prepareFormData()); // пушим новую запись в список
    // console.log(currentConnections);
    window.electronAPI.saveAllConnections(currentConnections); // Отправляем новый список на сохранение в главный процесс
    if (onUpdate) onUpdate(); //  вызываем обновление списка (странная конструкция, сделать красивее)
  };

  // Рендерим терминал если его не было или обновляем его.
  const handleConnect = (e) => {
    e.preventDefault();
    setTerminalVisible(false)
    console.log('handleConnect:', formData);
    setTerminalVisible(true)
  };

 

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
        <button type="submit" onClick={handleSave}>Сохранить</button>
        <button type="submit" onClick={handleConnect}>Подключиться</button>
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