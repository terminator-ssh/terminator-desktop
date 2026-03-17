import { User, LogOut, Trash2, Server,
  ChevronUp, ChevronDown, RefreshCw, AlertCircle, ShieldAlert } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useCurrentUser } from '@/hooks/useData';
import { useStore } from '@/store/useStore';
import ConfirmModal from './ConfirmModal';
import SwitchServerModal from './SwitchServerModal';
import {SyncStatus} from "../../../shared/types";
import {Button} from "@/components/ui/button";

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

  if (!user) return <div className="h-12 bg-input rounded-xl animate-pulse"></div>;

  const isSynced = !!user.serverUrl;

  const renderStatus = () => {
    if (!isSynced) {
      return (
        <div className="text-[10px] flex items-center gap-1 text-muted-foreground/70">
          <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground"></span>
          <span className="truncate">Local Vault</span>
        </div>
      );
    }

    switch (syncStatus) {
      case 'syncing':
        return (
          <div className="text-[10px] flex items-center gap-1 text-info">
            <RefreshCw size={10} className="animate-spin" />
            <span className="truncate">Syncing...</span>
          </div>
        );
      case 'unauthenticated':
        return (
          <div className="text-[10px] flex items-center gap-1 text-warning/80 font-medium">
            <ShieldAlert size={10} />
            <span className="truncate">Unauthenticated</span>
          </div>
        );
      case 'error':
      case 'offline':
        return (
          <div className="text-[10px] flex items-center gap-1 text-destructive font-medium">
            <AlertCircle size={10} />
            <span className="truncate">Disconnected</span>
          </div>
        );
      case 'success':
      case 'idle':
      default:
        return (
          <div className="text-[10px] flex items-center gap-1 text-primary">
            <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
            <span className="truncate">Synced</span>
          </div>
        );
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <Button
        variant="ghost"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full h-auto bg-input rounded-xl p-3 justify-start gap-3 border border-transparent ${isOpen ? 'border-border' : 'hover:bg-input/80'}`}
      >
        <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center shrink-0">
          <User size={16} className="text-foreground/80" />
        </div>
        <div className="flex-1 text-left min-w-0">
          <div className="text-sm font-medium text-foreground truncate">{user.username}</div>
          {renderStatus()}
        </div>
        {isOpen ? (
          <ChevronUp size={14} className="text-muted-foreground/70 pointer-events-none" />
        ) : (
          <ChevronDown size={14} className="text-muted-foreground/70 pointer-events-none" />
        )}
      </Button>

      {isOpen && (
        <div className="absolute top-full left-0 w-full mt-2 bg-sidebar border border-border rounded-xl shadow-2xl overflow-hidden z-50">
          <div className="p-1">
            <Button variant="ghost" onClick={() => { setShowServerModal(true); setIsOpen(false); }}
                    className="w-full justify-start gap-2 text-foreground/80">
              <Server size={14} className={isSynced ? "text-info" : "text-muted-foreground"} />
              {isSynced ? "Switch Server" : "Connect Cloud"}
            </Button>

            <Button variant="ghost" onClick={handleLogout}
                    className="w-full justify-start gap-2 text-foreground/80">
              <LogOut size={14} /> Lock Vault
            </Button>

            <div className="h-px bg-border my-1 mx-1"></div>

            <Button variant="ghost" onClick={() => { setShowWipeModal(true); setIsOpen(false); }}
                    className="w-full justify-start gap-2 text-destructive hover:text-destructive hover:bg-destructive/10">
              <Trash2 size={14} /> Wipe Data
            </Button>
          </div>
        </div>
      )}

      {showWipeModal && (
        <ConfirmModal
          title="Wipe Everything?"
          message="This will delete your database and keys, and close the app. This cannot be undone."
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
