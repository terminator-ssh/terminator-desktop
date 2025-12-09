import React, { useState } from "react"
import XTerminal from "../../../Terminal/Terminal";
import SSHForm from "../Form/SSHForm";

// Компонент для отображения одного созданного подключения. Виденье моё и Андрея немного разошлось, нужно уничтожить следы размолвки.

const Item = ({connection, onUpdate}) => {
    
    const [isVisible, setVisibility] = useState(true); // Видимость всего компонента
    const [isTerminalVisible, setTerminalVisible] = useState(false) // Видимость терминала, принадлежащего подключению
    const [isEditing, setIsEditing] = useState(false)

    const handleDelete = (connection) => {
        
        // e.preventDefault();
        
        let storedConnections = window.electronAPI.getAllConnections();

        // Тут наерное есть какая-то волшебная функция, но я ее не знаю,так что...
        for (let index = 0; index < storedConnections.length; index++) {
            const storedConnection = storedConnections[index];
            if (storedConnection.name === connection.name ) { 
                    // console.log('DEL ' + index +' FROM')
                    // console.log(storedConnections)
                    storedConnections.splice(index, 1);
                    // console.log('DONE: ')
                    // console.log(storedConnections) 
                break;
            }
            // console.log(storedConnection)
        }
        window.electronAPI.saveAllConnections(storedConnections);
        setVisibility(false); // триггерит условный рендеринг
    }

    const handleEdit = (connection) => {
        setIsEditing(!isEditing)
    }

    // рендерит терминал
    const handleConnect = () => {
        setTerminalVisible(true);
    } 

    // Если компонент существует и не удален
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
                    <button className="conn-item-edit" onClick={handleEdit}>
                        Edit
                    </button>
                    <button className="conn-item-delete" onClick={() => {handleDelete(connection)}}>
                        Delete
                    </button>
                    {isEditing && (
                        <SSHForm connection={connection} onUpdate={onUpdate} isEditing={isEditing}/>
                    )}

                      {isTerminalVisible && (
                        <XTerminal
                        host={connection.host}
                        port={connection.port}
                        username={connection.username}
                        keyName = {connection.privateKeyPath}
                        password = {connection.password}
                        />
                    )}
            </div>
        )
     } else {
        // Если компонент удален
        return( <div></div>)
     }
}

export default Item;