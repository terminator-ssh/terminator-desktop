import { useState } from 'react';

import Sidebar from './components/Sidebar';
import HostsPage from './components/pages/HostsPage';
import KeysPage from './components/pages/KeysPage';
import TerminalPage from './components/pages/TerminalPage';
import NewUserModal from './components/NewUserModal';



const App = () => {
  const [activeTab, setActiveTab] = useState('hosts');
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);

  return (
    <div className="flex h-screen bg-[#16171b] text-gray-100 font-sans overflow-hidden">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 overflow-y-auto">
        {activeTab === 'hosts' && <HostsPage />}
        {activeTab === 'keys' && <KeysPage />}
        {activeTab === 'terminal' && <TerminalPage />}
      </main>

      
      {/* New User Overlay */}
      {!isUserLoggedIn && <NewUserModal onClick={() => setIsUserLoggedIn(true)} />}

    </div>
  );
};

export default App;
