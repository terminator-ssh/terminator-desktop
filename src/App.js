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
      <header>Terminator SSH!</header>
      <div className="app-layout">
        <Sidebar activeView={activeView} onSelectView={setActiveView} />

        <main className="main-content">
          {activeView === 'hosts' && <HostsPanel />}
          {activeView === 'terminal' && <div>Terminal Panel?</div>}
          {activeView === 'keychain' && <div>Тут пока ничего нет... </div>}
        </main>
      </div>
      <footer>
        <XTerminal/>
      </footer>
    </div>
  );
}

export default App;
