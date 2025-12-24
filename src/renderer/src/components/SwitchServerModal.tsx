import { ArrowBigRight, X, UploadCloud } from 'lucide-react';
import { useState } from 'react';
import { normalizeApiUrl } from '@/lib/utils';

const SwitchServerModal = ({ onClose }: { onClose: () => void }) => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleConnect = async () => {
    setLoading(true);
    setError('');

    const cleanUrl = normalizeApiUrl(url);

    try {
      // This calls 'sync:register' which pushes local user data to server
      await window.electron.ipcRenderer.invoke('sync:register', cleanUrl);
      await window.electron.ipcRenderer.invoke('sync:now');
      onClose();
    } catch (e) {
      console.error(e);
      setError("Registration failed. Does this user already exist on the server? If so, we can't merge yet.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-[#23242a] w-150 rounded-2xl p-6 shadow-2xl border border-gray-800 relative">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-white mx-auto">Sync to Cloud</h2>
          <button onClick={onClose} className="absolute right-6 text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div className="bg-blue-500/10 p-4 rounded-lg flex items-start gap-3 border border-blue-500/20">
            <UploadCloud className="text-blue-400 shrink-0" size={20} />
            <div className="text-xs text-blue-200">
              This will register your current local account on the server and upload your encrypted data.
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-gray-400 font-medium ml-1">Server URL</label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="example.com"
              className="w-full bg-[#2b2d33] border border-gray-700 text-gray-200 text-sm rounded-lg px-4 py-3 focus:outline-none focus:border-emerald-500"
            />
            <p className="text-[10px] text-gray-500 mt-1 ml-1">/api/v1 added automatically.</p>
          </div>

          {error && <div className="text-red-400 text-sm text-center p-2 bg-red-900/20 rounded">{error}</div>}

          <button
            type="button"
            onClick={handleConnect}
            disabled={loading}
            className="w-full bg-[#10b981] hover:bg-[#059669] text-white font-medium py-3 rounded-xl mt-4 transition-colors flex justify-center items-center gap-2 disabled:opacity-50">
            {loading ? "Registering..." : "Register & Sync"} <ArrowBigRight />
          </button>
        </div>
      </div>
    </div>
  );
};
export default SwitchServerModal;
