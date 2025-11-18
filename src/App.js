import logo from './logo.webp';
import XTerminal from './components/Terminal';
import Sidebar from './components/Sidebar';
import HostsPanel from './components/hostsPanel/HostsPanel'
import './App.css';
import { useState } from 'react';

function App() {
  const [activeView, setActiveView] = useState('hosts')

  return (
    <div className="App">
      <div className="app-layout">
        <Sidebar activeView={activeView} onSelectView={setActiveView} />

        <main className="main-content">
          <h1>Terminator SSH</h1>
          {activeView === 'hosts' && <HostsPanel />}
          {activeView === 'terminal' && <XTerminal/>}
          {activeView === 'keychain' && <div>Тут пока ничего нет... </div>}
        </main>
      </div>
      <footer>
        {/*  Line 1:8:  'logo' is defined but never used  no-unused-vars */}
        <img src={logo} className="App-logo" alt="logo" />
      </footer>
    </div>
  );
}

export default App;
