import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import HostsPage from './components/pages/HostsPage';
import KeysPage from './components/pages/KeysPage';
import TerminalPage from './components/pages/TerminalPage';
import NewUserModal from './components/NewUserModal';
import LoginModal from './components/LoginModal';
import { Host } from '../../shared/types';

const App = () => {
  const [activeTab, setActiveTab] = useState('hosts');

  // Auth State
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [hasUser, setHasUser] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);

  // Terminal State
  const [activeConnection, setActiveConnection] = useState<Host | null>(null);

  // 1. Check DB on load
  useEffect(() => {
    const checkUser = async () => {
      try {
        const exists = await window.electron.ipcRenderer.invoke('auth:check');
        setHasUser(exists);
      } catch (e) {
        console.error("Auth check failed", e);
      } finally {
        setCheckingAuth(false);
      }
    };
    checkUser();
  }, []);

  const handleConnect = (host: Host) => {
    setActiveConnection(host);
    setActiveTab('terminal');
  };

  const handleUnlock = () => {
    setIsUnlocked(true);
  };

  const handleCreated = () => {
    setHasUser(true);
    setIsUnlocked(true);
  };

  if (checkingAuth) {
    return <div className="h-screen bg-[#16171b] flex items-center justify-center text-gray-500">Loading Vault...</div>;
  }

  return (
    <div className="flex h-screen bg-[#16171b] text-gray-100 font-sans overflow-hidden">

      {/* 1. If Locked and User Exists -> Login */}
      {hasUser && !isUnlocked && <LoginModal onUnlock={handleUnlock} />}

      {/* 2. If Locked and NO User -> Register */}
      {!hasUser && <NewUserModal onClick={handleCreated} />}

      {/* 3. Main App (Only render if unlocked to prevent data leaking) */}
      {isUnlocked && (
        <>
          <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
          <main className="flex-1 overflow-y-auto relative h-full">
            {activeTab === 'hosts' && <HostsPage onConnect={handleConnect} />}
            {activeTab === 'keys' && <KeysPage />}
            {activeTab === 'terminal' && activeConnection ? (
              <TerminalPage connection={activeConnection} />
            ) : activeTab === 'terminal' ? (
              <div className="flex items-center justify-center h-full text-gray-500">Select a host to connect</div>
            ) : null}
          </main>
        </>
      )}
    </div>
  );
};

export default App;
