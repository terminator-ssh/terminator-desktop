import React from "react"
import "./Sidebar.css" 


const Sidebar = ({activeView, onSelectView}) => {
    
    return (
        <nav className="sidebar">
            <ul>
                <li>
                    <button className={activeView === "hosts" ? "active" : ""}
                            onClick={() => onSelectView("hosts")}>
                        Hosts
                    </button>
                </li>
                
                <li>
                    <button className={activeView === "keychain" ? "active" : ""}
                            onClick={() => onSelectView("keychain")}>
                        Keychain
                    </button>
                </li>
                
                <li>
                    <button className={activeView === "terminal" ? "active" : ""}
                            onClick={() => onSelectView("terminal")}>
                        Terminal
                    </button>
                </li>
                
                {/* <li>
                    <button className={activeView === "knownHosts" ? "active" : ""}
                            onClick={() => onSelectView("knownhosts")}>
                        Known Hosts
                    </button>
                </li> */}
            </ul>
        </nav>
    )
}

export default Sidebar;