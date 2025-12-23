import { ArrowBigRight, X } from 'lucide-react';
import { useState } from 'react';

const SwitchServerModal = ({ onClose }: { onClose: () => void }) => {
  const [url, setUrl] = useState('http://localhost:5000/api/v1');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleConnect = async () => {
    setLoading(true);
    setError('');
    try {
      await window.electron.ipcRenderer.invoke('sync:register', url);
      // If successful, try a sync immediately
      await window.electron.ipcRenderer.invoke('sync:now');
      onClose();
    } catch (e) {
      setError("Failed to connect to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-[#23242a] w-150 rounded-2xl p-6 shadow-2xl border border-gray-800 relative">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-white mx-auto">Switch Server</h2>
          <button onClick={onClose} className="absolute right-6 text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs text-gray-400 font-medium ml-1">Server API URL</label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="http://example.com/api/v1"
              className="w-full bg-[#2b2d33] border border-gray-700 text-gray-200 text-sm rounded-lg px-4 py-3 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {error && <div className="text-red-400 text-sm text-center">{error}</div>}

          <button
            type="button"
            onClick={handleConnect}
            disabled={loading}
            className="w-full bg-[#10b981] hover:bg-[#059669] text-white font-medium py-3 rounded-xl mt-4 transition-colors flex justify-center items-center gap-2 disabled:opacity-50">
            {loading ? "Connecting..." : "Connect & Register"} <ArrowBigRight />
          </button>
        </div>
      </div>
    </div>
  );
};
export default SwitchServerModal;
