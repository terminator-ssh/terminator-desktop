// Компонент для отображения одного созданного подключения со всеми его деталями и кнопками ("Изменить", "Удалить", "Подключиться").
import React from "react"

const ConnectionItem = ({connection, onConnect, onEdit, onDelete}) => {
    

    const handleDelete = (connection) => {
        console.log(connection)
            // e.preventDefault();
            const storedConnections = window.electronAPI.getAllConnections();
            // Тут наерное есть какая-то волшебная функция, но я ее не знаю,так что...
            let index = 0;
            storedConnections.forEach(storedConnection => {
                if (storedConnection.name == connection.name ) {storedConnections.slice(storedConnection);console.log(storedConnections);}
                
            });console.log(storedConnections);
            // let index = storedConnections.IndexOf(connection);
            // currentConnections.push(prepareFormData());
            // console.log(currentConnections);
            // console.log(index)
            // window.electronAPI.saveAllConnections(currentConnections);
    }
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
}

export default ConnectionItem;