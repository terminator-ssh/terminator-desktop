//  Это будет основной компонент для панели подключений. Он будет содержать логику и рендеринг формы для создания новых подключений и списка существующих.
import React, { useState , useEffect} from 'react';
import ConnectionItem from './ConnectionItem';
// import ConnectionForm from './ConnectionForm';
import ConnectionForm2 from './ConnectionForm2';
// import './css/HostsPanel.css';

// const mockConnection = [
//     { name: 'My Server', host: '192.168.1.100', port: '22', user: 'root' },
// ];




const HostsPanel = () => {
    const [connectionList, setConnectionList] = useState([])
    const [updateList, setUpdateList] = useState(true)
    
    const getConnectionList = () => {
        setUpdateList(true)
        const storedConnections = localStorage.getItem('connections');
        console.log(storedConnections);
        if (storedConnections) {
        try {
            const parsedConnections = JSON.parse(storedConnections);
            setConnectionList(parsedConnections);
        } catch (error) {
            console.error("Ошибка при попытке парсить JSON", error);
        }
        }
        setUpdateList(false)
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
    
    const handleCreateConnection = (connectionData) => {
        console.log("типа создался конекшн: " + connectionData);
        getConnectionList();

    }

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
            <div className='panel-header'>
                {/* кнопка, которая будет выводить модалку с формой на экран? */}
                <button className='newHostBtn' onClick={(connection)=>handleCreateConnection(connection)}>New Host</button> 
                <button onClick={console.log(handleCheck())} >все коннекты в консоль </button>
                {/* <button onClick={window.electronAPI.clearAllConnections()} >сжечь все коннекты к чертям</button> */}
            </div>
            <div className="hosts-list">

                <div className="hosts-header">
                    <span>Name</span>
                    <span>Host</span>
                    <span>Port</span>
                    <span>User</span>
                    <span>Actions</span>
                    <ConnectionForm2 onUpdate={getConnectionList}/> {/* <-- Вот наша форма */}
                    
                </div>
                
                <div className='hosts-body'>
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