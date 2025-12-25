import { useEffect, useState } from 'react';
import Sidebar from './components/Sidebar';
import HostsPage from './components/pages/HostsPage';
import KeysPage from './components/pages/KeysPage';
import TerminalPage from './components/pages/TerminalPage';
import NewUserModal from './components/NewUserModal';
import LoginModal from './components/LoginModal';
import { useStore } from './store/useStore';

const App = () => {
  const {
    activeTab, setActiveTab,
    isUnlocked, setUnlocked,
    hasUser, setHasUser,
    sessions, activeSessionId, addSession
  } = useStore();

  const [checkingAuth, setCheckingAuth] = useState(true);

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

  const handleUnlock = () => setUnlocked(true);

  const handleCreated = () => {
    setHasUser(true);
    setUnlocked(true);
  };

  if (checkingAuth) {
    return <div className="h-screen bg-[#16171b] flex items-center justify-center text-gray-500">Loading...</div>;
  }

  return (
    <div className="flex h-screen bg-[#16171b] text-gray-100 font-sans overflow-hidden">

      {/* Auth Modals */}
      {hasUser && !isUnlocked && <LoginModal onUnlock={handleUnlock} />}
      {!hasUser && <NewUserModal onClick={handleCreated} />}

      {/* Main Content (Only if Unlocked) */}
      {isUnlocked && (
        <>
          <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

          <main className="flex-1 overflow-y-auto relative h-full flex flex-col">

            <div className={activeTab === 'hosts' ? 'block h-full' : 'hidden'}>
              <HostsPage onConnect={addSession} />
            </div>

            <div className={activeTab === 'keys' ? 'block h-full' : 'hidden'}>
              <KeysPage />
            </div>

            {sessions.map(session => (
              <div
                key={session.id}
                className={activeTab === 'terminal' && activeSessionId === session.id ? 'flex-1 h-full' : 'hidden'}
              >
                <TerminalPage
                  connection={session.connection}
                  sessionId={session.id}
                  isActive={activeTab === 'terminal' && activeSessionId === session.id}
                />
              </div>
            ))}

            {activeTab === 'terminal' && sessions.length === 0 && (
              <div className="flex items-center justify-center h-full text-gray-500 flex-col gap-2">
                <p>No active connections.</p>
                <button
                  onClick={() => setActiveTab('hosts')}
                  className="text-emerald-500 hover:underline"
                >
                  Select a host
                </button>
              </div>
            )}
          </main>
        </>
      )}
    </div>
  );
};

export default App;
