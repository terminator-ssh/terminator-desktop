import { useEffect, useState } from 'react';
import Sidebar from './components/Sidebar';
import HostsPage from './components/pages/HostsPage';
import KeysPage from './components/pages/KeysPage';
import TerminalPage from './components/pages/TerminalPage';
import NewUserModal from './components/NewUserModal';
import LoginModal from './components/LoginModal';
import { useStore } from './store/useStore';
import { useQueryClient } from '@tanstack/react-query';

const App = () => {
  const queryClient = useQueryClient();
  const {
    activeTab, setActiveTab,
    isUnlocked, setUnlocked,
    hasUser, setHasUser,
    sessions, activeSessionId, addSession, removeSession, setActiveSession
  } = useStore();

  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const handleUpdates = () => {
      console.log("Background sync received new data, refreshing UI...");
      queryClient.invalidateQueries({ queryKey: ['hosts'] });
      queryClient.invalidateQueries({ queryKey: ['keys'] });
    };

    window.electron.ipcRenderer.on('sync:updates-available', handleUpdates);

    return () => {
      window.electron.ipcRenderer.removeAllListeners('sync:updates-available');
    };
  }, [queryClient]);

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

      {hasUser && !isUnlocked && <LoginModal onUnlock={handleUnlock} />}
      {!hasUser && <NewUserModal onClick={handleCreated} />}

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

            {activeTab === 'terminal' && sessions.length > 0 && (
            <div className="flex flex-row bg-gray-800 border-b border-gray-700 overflow-x-auto">
              {sessions.map((s) => (
                <div
                  key={s.id}
                  onClick={() => setActiveSession(s.id)} // Нужно убедиться, что эта функция есть в сторе
                  className={`
                    px-4 py-2 cursor-pointer border-r border-gray-700 flex items-center gap-2 min-w-[150px]
                    ${activeSessionId === s.id ? 'bg-gray-900 text-blue-400 border-b-2 border-b-blue-500' : 'text-gray-400 hover:bg-gray-700'}
                  `}
                >
                <span className="truncate text-xs">{s.connection.name || 'Session'}  </span>

                <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeSession(s.id);
                    }}
                    className="ml-auto hover:text-red-500"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            )}

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
