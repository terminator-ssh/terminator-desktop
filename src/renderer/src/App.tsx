import React, { useState } from 'react';

import Sidebar from './components/ui/Sidebar';
import HostsPage from './components/pages/HostsPage';
import KeychainPage from './components/pages/KeychainPage';


const App = () => {
  const [activeTab, setActiveTab] = useState('hosts'); // Default to Keychain to show context 


  return (
    <div className="flex h-screen bg-[#16171b] text-gray-100 font-sans overflow-hidden">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 overflow-y-auto">
        {activeTab === 'hosts' && <HostsPage />}
        {activeTab === 'keychain' && <KeychainPage />}
        {activeTab === 'terminal' && (
            <div className="flex items-center justify-center h-full text-gray-500">Terminal Placeholder</div>
        )}
      </main>

    </div>
  );
};

export default App;