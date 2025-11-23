//  Это будет основной компонент для панели подключений. Он будет содержать логику и рендеринг формы для создания новых подключений и списка существующих.
import React, { useState , useEffect} from 'react';
import ConnectionItem from './ConnectionItem';
// import ConnectionForm from './ConnectionForm';
import SSHConnectionForm from './SSHConnectionForm';
import './css/HostsPanel.css';

// const mockConnection = [
//     { name: 'My Server', host: '192.168.1.100', port: '22', user: 'root' },
// ];




const HostsPanel = () => {
    const [connectionList, setConnectionList] = useState([])
    // const [updateList, setUpdateList] = useState(true) // Он нужен.
    const [isFormOpen, setIsFormOpen] = useState(false)
    
    const getConnectionList = () => {
        // setUpdateList(true) // Тут че-то не то, разобраться
        const storedConnections = localStorage.getItem('connections');
        // console.log(storedConnections);
        if (storedConnections) {
            try {
                // console.log(storedConnections)
                const parsedConnections = JSON.parse(storedConnections);
                setConnectionList(parsedConnections);
            } catch (error) {
                console.error("Ошибка при попытке парсить JSON", error);
            }
        }
        // setUpdateList(false)
    }

    useEffect(() => {
        getConnectionList();
    }, []); // Только при монтировании в дом

    function handleCheck() {
        return window.electronAPI.getAllConnections()
    }

    const handleConnect = (connection) => {
        console.log("Типа подключился к серверу: " + connection);
        getConnectionList();
    }
    
    // const handleCreateConnection = (connectionData) => {
    //     console.log("типа создался конекшн: " + connectionData);
    //     getConnectionList();
    // }

    const handleEditConnection = (connectionData) => {
        console.log("типа изменился конекшн: " + connectionData);
        getConnectionList();
    }

    const handleDeleteConnection = (connectionData) => {
        console.log("типа удалился конекшн: " + connectionData);
        getConnectionList();
    }

    return (
        <div className="hosts-panel">
            <div className='hosts-panel__header'>
                {/* кнопка, которая будет выводить модалку с формой на экран! Ну почти модалку */}
                <button 
                    className='hosts-panel__new-host-btn' 
                    onClick={() => setIsFormOpen(!isFormOpen)}>
                    {isFormOpen ? 'Close Form' : 'New Host'}
                </button> 
                
                {/* Почти модалка. */}
                {isFormOpen && (
                    <div className="hosts-panel__dropdown-form">
                        <SSHConnectionForm 
                            onUpdate={getConnectionList}
                            onSuccess={() => setIsFormOpen(false)}
                        />
                    </div>
                )}

                <button onClick={console.log(handleCheck())} >все коннекты в консоль </button>
                {/* <button onClick={window.electronAPI.clearAllConnections()} >сжечь все коннекты к чертям</button> */}
            </div>

            <div className="hosts-panel__hosts-list">
                <div className="hosts-header">
                    <span>Name</span>
                    <span>Host</span>
                    <span>Port</span>
                    <span>User</span>
                    <span>Actions</span>
                </div>
                
                <div className='hosts-panel__hosts-body'>
                    {connectionList.map(connection => (
                        <ConnectionItem key={connection.name} connection={connection} onConnect={handleConnect} onEdit={() => handleEditConnection(connection)} onDelete={() => handleDeleteConnection(connection.name)}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default HostsPanel;