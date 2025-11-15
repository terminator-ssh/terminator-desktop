// Отдельный компонент для формы создания/редактирования подключения (например, полей для имени подключения, хоста, порта, пользователя и т.д.).
import React, { useState } from "react"

const connectionForm = () => {
    const [name, setName] = useState('')
    const [host, setHost] = useState('')
    const [port, setPort] = useState('')
    const [user, setUser] = useState('')

    return (
        <form className="connection-form" onSubmit={handleSubmit}>
            <input type="text" id="fname" value={name} onChange={(event) => setName(event.target.value)} required/>
            <input type="text" id="fhost" value={host} onChange={(event) => setHost(event.target.value)} required/>
            <input type="text" id="fport" value={port} onChange={(event) => setPort(event.target.value)} required/>
            <input type="text" id="fuser" value={user} onChange={(event) => setUser(event.target.value)} required/>
        </form>
    )
}

export default connectionForm