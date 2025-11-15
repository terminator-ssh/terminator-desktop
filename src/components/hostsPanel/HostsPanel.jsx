//  Это будет основной компонент для панели подключений. Он будет содержать логику и рендеринг формы для создания новых подключений и списка существующих.
import React from 'react';
import ConnectionItem from './ConnectionItem';
// import './css/HostsPanel.css';


const mockConnection = [
    { name: 'My Server', host: '192.168.1.100', port: '22', user: 'root' },
];

const HostsPanel = () => {

    const handleConnect = (connection) => {
        console.log("Типа подключился к серверу: " + connection);
    }
    
    const handleCreateConnection = (connectionData) => {
        console.log("типа создался конекшн: " + connectionData);

    }

    const handleEditConnection = (connectionData) => {
        console.log("типа изменился конекшн: " + connectionData);
    }

    const handleDeleteConnection = (connectionData) => {
        console.log("типа удалился конекшн: " + connectionData);
    }

    return (
        <div className="hosts-panel">
            <div className='panel-header'>
                <button className='newHostBtn' onClick={(connection)=>handleCreateConnection(connection)}>New Host</button>
            </div>
            <div className="hosts-list">

                <div className="hosts-header">
                    <span>Name</span>
                    <span>Host</span>
                    <span>Port</span>
                    <span>User</span>
                    <span>Actions</span>
                </div>
                
                <div className='hosts-body'>
                    {mockConnection.map(connection => (
                        <ConnectionItem connection={connection} onConnect={handleConnect} onEdit={() => handleEditConnection(connection)} onDelete={() => handleDeleteConnection(connection.name)}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default HostsPanel;