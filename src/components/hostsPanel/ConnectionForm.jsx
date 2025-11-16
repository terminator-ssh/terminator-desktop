// // Отдельный компонент для формы создания/редактирования подключения (например, полей для имени подключения, хоста, порта, пользователя и т.д.).
// import React, { useState } from "react"

// const connectionForm = () => {
//     const [Name, setName] = useState('')
//     const [Host, setHost] = useState('')
//     const [Port, setPort] = useState('')
//     const [User, setUser] = useState('')

//     return (
//         <form className="connection-form" onSubmit={handleSubmit}>
//             <input type="text" id="fname" value={Name} onChange={(event) => setName(event.target.value)} required/>
//             <input type="text" id="fhost" value={Host} onChange={(event) => setHost(event.target.value)} required/>
//             <input type="text" id="fport" value={Port} onChange={(event) => setPort(event.target.value)} required/>
//             <input type="text" id="fuser" value={User} onChange={(event) => setUser(event.target.value)} required/>
//         </form>
//     )
// }

// export default connectionForm