// Компонент для отображения одного созданного подключения со всеми его деталями и кнопками ("Изменить", "Удалить", "Подключиться").
import React, { useState } from "react"

const ConnectionItem = ({connection, onConnect, onEdit, onDelete}) => {
    
    const [isVisible, setVisibility] = useState(true);

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
            
            // storedConnections.forEach(storedConnection => {
            //     index++;
            //     if (storedConnection.name == connection.name ) { }
                
            // });console.log(storedConnections);
            // let index = storedConnections.IndexOf(connection);
            // currentConnections.push(prepareFormData());
            // console.log(currentConnections);
            // console.log(index)
            // window.electronAPI.saveAllConnections(currentConnections);
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
                
                    <button className="conn-item-connect" onClick={() => {onConnect(connection)}}>
                        Connect
                    </button>
                    <button className="conn-item-edit" onClick={() => {onEdit(connection)}}>
                        Edit
                    </button>
                    <button className="conn-item-delete" onClick={() => {handleDelete(connection)}}>
                        Delete
                    </button>
            </div>
        )
     } else {
        return( <div>DELETED</div>)
     }
}

export default ConnectionItem;