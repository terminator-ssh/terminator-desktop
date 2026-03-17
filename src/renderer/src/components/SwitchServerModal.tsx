import { ArrowBigRight, X, UploadCloud, AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import { normalizeApiUrl } from '@/lib/utils';

interface SwitchServerModalProps {
  onClose: () => void;
  currentUrl: string | null;
}

const SwitchServerModal = ({ onClose, currentUrl }: SwitchServerModalProps) => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isSwitching = !!currentUrl;

  const handleConnect = async () => {
    setLoading(true);
    setError('');
    const cleanUrl = normalizeApiUrl(url);

    if (currentUrl && cleanUrl === currentUrl) {
      setError("You are already connected to this server.");
      setLoading(false);
      return;
    }

    try {
      await window.electron.ipcRenderer.invoke('sync:register', cleanUrl);
      await window.electron.ipcRenderer.invoke('sync:now');
      onClose();
    } catch (e) {
      console.error(e);
      setError("Registration failed. Either the server is unreachable, or this user already exists there.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-card w-150 rounded-2xl p-6 shadow-2xl border border-border/50 relative">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-foreground mx-auto">
            {isSwitching ? "Switch Server" : "Connect Cloud"}
          </h2>
          <button onClick={onClose} className="absolute right-6 text-muted-foreground hover:text-foreground">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">

          {isSwitching ? (
            <div className="bg-warning/10 p-4 rounded-lg flex items-start gap-3 border border-warning/20 text-warning">
              <AlertTriangle size={20} className="shrink-0" />
              <div className="text-xs">
                You are currently connected to <b>{currentUrl}</b>. <br/>
                Switching will update your Sync endpoint. Your local data will be pushed to the new server.
              </div>
            </div>
          ) : (
            <div className="bg-info/10 p-4 rounded-lg flex items-start gap-3 border border-info/20 text-info">
              <UploadCloud size={20} className="shrink-0" />
              <div className="text-xs">
                This will register your current local account on the server and upload your encrypted data.
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs text-muted-foreground font-medium ml-1">New Server URL</label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="example.com"
              className="w-full bg-input border border-border text-foreground text-sm rounded-lg px-4 py-3 focus:outline-none focus:border-primary"
              autoFocus
            />
            <p className="text-[10px] text-muted-foreground/70 mt-1 ml-1">/api/v1 added automatically.</p>
          </div>

          {error && <div className="text-destructive text-sm text-center p-2 bg-destructive/20/20 rounded">{error}</div>}

          <button
            type="button"
            onClick={handleConnect}
            disabled={loading}
            className={`w-full text-foreground font-medium py-3 rounded-xl mt-4 transition-colors flex justify-center items-center gap-2 disabled:opacity-50
                ${isSwitching ? 'bg-warning hover:bg-warning/90' : 'bg-primary hover:bg-primary/90'}`}
          >
            {loading ? "Connecting..." : (isSwitching ? "Confirm Switch" : "Register & Sync")} <ArrowBigRight />
          </button>
        </div>
      </div>
    </div>
  );
};
export default SwitchServerModal;
