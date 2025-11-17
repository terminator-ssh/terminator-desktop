// Компонент для отображения одного созданного подключения со всеми его деталями и кнопками ("Изменить", "Удалить", "Подключиться").
import React from "react"

const ConnectionItem = ({connection, onConnect, onEdit, onDelete}) => {
    
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
                <button className="conn-item-delete" onClick={() => {onDelete(connection)}}>
                    Delete
                </button>
        </div>
    )
}

export default ConnectionItem;