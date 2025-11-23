// Компонент для отображения одного созданного подключения со всеми его деталями и кнопками ("Изменить", "Удалить", "Подключиться").
import React, { useState } from "react"
import XTerminal from "../../../Terminal/Terminal";

const ConnectionItem = ({connection, onConnect, onEdit, onDelete}) => {
    
    const [isVisible, setVisibility] = useState(true);
    const [isTerminalVisible, setTerminalVisible] = useState(false) 

    const handleDelete = (connection) => {
        console.log(connection)
            // e.preventDefault();
            
            let storedConnections = window.electronAPI.getAllConnections();
            // Тут наерное есть какая-то волшебная функция, но я ее не знаю,так что...
            
            for (let index = 0; index < storedConnections.length; index++) {
                const storedConnection = storedConnections[index];
                if (storedConnection.name == connection.name ) { 
                        console.log('DEL ' + index +' FROM')
                        console.log(storedConnections)
                        storedConnections.splice(index, 1);
                        console.log('DONE: ')
                        console.log(storedConnections) 
                    
                    break;
                }
                console.log(storedConnection)
            }


            window.electronAPI.saveAllConnections(storedConnections);
            setVisibility(false);
    }

    const handleConnect = () => {
        setTerminalVisible(true);
    }

    if (isVisible){
    return (
            
        <div className="connection-item">
            <div className="connection-item-details"> 
                <span><strong>Name: </strong>{connection.name}</span>
                <span><strong>Host: </strong>{connection.host}</span>
                <span><strong>Port: </strong>{connection.port}</span>
                <span><strong>User: </strong>{connection.username}</span>
            </div>
            
                    <button className="conn-item-connect" onClick={() => {setTerminalVisible(true);}}>
                Connect
            </button>
                    <button className="conn-item-edit" onClick={() => {handleConnect(connection)}}>
                Edit
            </button>
            <button className="conn-item-delete" onClick={() => {handleDelete(connection)}}>
                Delete
            </button>
            
            {isTerminalVisible && (
            <XTerminal
            host={connection.host}
            port={connection.port}
            username={connection.username}
            keyName = {connection.privateKeyPath}
            />
        )}
        </div>
    )
     } else {
        return( <div>DELETED</div>)
     }
}

export default ConnectionItem;