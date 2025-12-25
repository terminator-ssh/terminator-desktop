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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-[#23242a] w-150 rounded-2xl p-6 shadow-2xl border border-gray-800 relative">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-white mx-auto">
            {isSwitching ? "Switch Server" : "Connect Cloud"}
          </h2>
          <button onClick={onClose} className="absolute right-6 text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">

          {isSwitching ? (
            <div className="bg-yellow-500/10 p-4 rounded-lg flex items-start gap-3 border border-yellow-500/20 text-yellow-500">
              <AlertTriangle size={20} className="shrink-0" />
              <div className="text-xs">
                You are currently connected to <b>{currentUrl}</b>. <br/>
                Switching will update your Sync endpoint. Your local data will be pushed to the new server.
              </div>
            </div>
          ) : (
            <div className="bg-blue-500/10 p-4 rounded-lg flex items-start gap-3 border border-blue-500/20 text-blue-400">
              <UploadCloud size={20} className="shrink-0" />
              <div className="text-xs">
                This will register your current local account on the server and upload your encrypted data.
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs text-gray-400 font-medium ml-1">New Server URL</label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="example.com"
              className="w-full bg-[#2b2d33] border border-gray-700 text-gray-200 text-sm rounded-lg px-4 py-3 focus:outline-none focus:border-emerald-500"
              autoFocus
            />
            <p className="text-[10px] text-gray-500 mt-1 ml-1">/api/v1 added automatically.</p>
          </div>

          {error && <div className="text-red-400 text-sm text-center p-2 bg-red-900/20 rounded">{error}</div>}

          <button
            type="button"
            onClick={handleConnect}
            disabled={loading}
            className={`w-full text-white font-medium py-3 rounded-xl mt-4 transition-colors flex justify-center items-center gap-2 disabled:opacity-50
                ${isSwitching ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-[#10b981] hover:bg-[#059669]'}`}
          >
            {loading ? "Connecting..." : (isSwitching ? "Confirm Switch" : "Register & Sync")} <ArrowBigRight />
          </button>
        </div>
      </div>
    </div>
  );
};
export default SwitchServerModal;
