import { User, LogOut, Trash2, Server,
  ChevronUp, ChevronDown, RefreshCw, AlertCircle, ShieldAlert } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useCurrentUser } from '@/hooks/useData';
import { useStore } from '@/store/useStore';
import ConfirmModal from './ConfirmModal';
import SwitchServerModal from './SwitchServerModal';
import {SyncStatus} from "../../../shared/types";

const UserMenu = () => {
  const { data: user, refetch } = useCurrentUser();
  const { setUnlocked } = useStore();

  const [isOpen, setIsOpen] = useState(false);
  const [showWipeModal, setShowWipeModal] = useState(false);
  const [showServerModal, setShowServerModal] = useState(false);

  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleStatus = (_event: any, status: string) => {
      setSyncStatus(status as SyncStatus);
    };

    const removeListener = window.electron.ipcRenderer.on('sync:status', handleStatus);

    return () => {
      removeListener();
    }
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  const handleLogout = () => {
    setUnlocked(false);
    setIsOpen(false);
  };

  const handleWipe = async () => {
    await window.electron.ipcRenderer.invoke('auth:wipe');
  };

  if (!user) return <div className="h-12 bg-[#2b2d33] rounded-xl animate-pulse"></div>;

  const isSynced = !!user.serverUrl;

  const renderStatus = () => {
    if (!isSynced) {
      return (
        <div className="text-[10px] flex items-center gap-1 text-gray-500">
          <span className="w-1.5 h-1.5 rounded-full bg-gray-500"></span>
          <span className="truncate">Local Vault</span>
        </div>
      );
    }

    switch (syncStatus) {
      case 'syncing':
        return (
          <div className="text-[10px] flex items-center gap-1 text-blue-400">
            <RefreshCw size={10} className="animate-spin" />
            <span className="truncate">Syncing...</span>
          </div>
        );
      case 'unauthenticated':
        return (
          <div className="text-[10px] flex items-center gap-1 text-orange-400 font-medium">
            <ShieldAlert size={10} />
            <span className="truncate">Unauthenticated</span>
          </div>
        );
      case 'error':
      case 'offline':
        return (
          <div className="text-[10px] flex items-center gap-1 text-red-500 font-medium">
            <AlertCircle size={10} />
            <span className="truncate">Disconnected</span>
          </div>
        );
      case 'success':
      case 'idle':
      default:
        return (
          <div className="text-[10px] flex items-center gap-1 text-emerald-500">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span className="truncate">Synced</span>
          </div>
        );
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full bg-[#2b2d33] rounded-xl p-3 flex items-center gap-3 transition-colors border border-transparent ${isOpen ? 'border-gray-600' : 'hover:bg-[#32343b]'}`}
      >
        <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center shrink-0">
          <User size={16} className="text-gray-300" />
        </div>
        <div className="flex-1 text-left min-w-0">
          <div className="text-sm font-medium text-gray-200 truncate">{user.username}</div>
          {renderStatus()}
        </div>

        {isOpen ? (
          <ChevronUp size={14} className="text-gray-500 pointer-events-none" />
        ) : (
          <ChevronDown size={14} className="text-gray-500 pointer-events-none" />
        )}
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 w-full mt-2 bg-[#1e1f24] border border-gray-700 rounded-xl shadow-2xl overflow-hidden z-50">
          <div className="p-1">
            <button
              onClick={() => { setShowServerModal(true); setIsOpen(false); }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-[#2b2d33] rounded-lg transition-colors text-left"
            >
              <Server size={14} className={isSynced ? "text-blue-400" : "text-gray-400"} />
              <span className="flex-1 truncate">{isSynced ? "Switch Server" : "Connect Cloud"}</span>
            </button>

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-[#2b2d33] rounded-lg transition-colors text-left"
            >
              <LogOut size={14} />
              Lock Vault
            </button>

            <div className="h-px bg-gray-700 my-1 mx-1"></div>

            <button
              onClick={() => { setShowWipeModal(true); setIsOpen(false); }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors text-left group"
            >
              <Trash2 size={14} className="group-hover:text-red-500" />
              Wipe Data
            </button>
          </div>
        </div>
      )}

      {showWipeModal && (
        <ConfirmModal
          title="Wipe Everything?"
          message="This will delete your database and keys, and restart the app. This cannot be undone."
          confirmText="Nuke it"
          onConfirm={handleWipe}
          onCancel={() => setShowWipeModal(false)}
        />
      )}

      {showServerModal && (
        <SwitchServerModal
          onClose={() => {
            setShowServerModal(false);
            refetch();
          }}
          currentUrl={user.serverUrl}
        />
      )}
    </div>
  );
};

export default UserMenu;
