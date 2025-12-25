import { ArrowBigRight, Server, Shield, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { normalizeApiUrl } from '@/lib/utils';

type Mode = 'select' | 'create' | 'connect';

const SelectionView = ({ setMode }: { setMode: (m: Mode) => void }) => (
  <div className="space-y-4">
    <h2 className="text-xl font-semibold text-white mb-2 text-center">Welcome to Terminator</h2>
    <p className="text-gray-400 text-sm text-center mb-6">Choose how you want to start.</p>

    <button
      onClick={() => setMode('create')}
      className="w-full bg-[#2b2d33] hover:bg-[#32343b] border border-gray-700 p-4 rounded-xl flex items-center gap-4 transition-all group text-left"
    >
      <div className="bg-emerald-500/10 p-3 rounded-lg group-hover:bg-emerald-500/20 transition-colors">
        <Shield className="text-emerald-500" size={24} />
      </div>
      <div>
        <div className="text-gray-200 font-medium">Create Local Vault</div>
        <div className="text-xs text-gray-500 mt-1">Store keys locally. Sync optional later.</div>
      </div>
    </button>

    <button
      onClick={() => setMode('connect')}
      className="w-full bg-[#2b2d33] hover:bg-[#32343b] border border-gray-700 p-4 rounded-xl flex items-center gap-4 transition-all group text-left"
    >
      <div className="bg-blue-500/10 p-3 rounded-lg group-hover:bg-blue-500/20 transition-colors">
        <Server className="text-blue-500" size={24} />
      </div>
      <div>
        <div className="text-gray-200 font-medium">Restore from Server</div>
        <div className="text-xs text-gray-500 mt-1">Log in to an existing account and download data.</div>
      </div>
    </button>
  </div>
);

const CreateView =
  ({ onRegister, loading }:
   { onRegister: (u: string, p: string) => void, loading: boolean }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-white mb-6 text-center">Create Local Vault</h2>
      <div>
        <label className="text-xs text-gray-400 font-medium ml-1">Username</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full bg-[#2b2d33] border border-gray-700 text-gray-200 text-sm rounded-lg px-4 py-3 focus:outline-none focus:border-emerald-500"
          autoFocus
        />
      </div>

      <div>
        <label className="text-xs text-gray-400 font-medium ml-1">Master Password</label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-[#2b2d33] border border-gray-700 text-gray-200 text-sm rounded-lg px-4 py-3 focus:outline-none focus:border-emerald-500 pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      <button
        onClick={() => onRegister(username, password)}
        disabled={loading}
        className="w-full bg-[#10b981] hover:bg-[#059669] text-white font-medium py-3 rounded-xl mt-4 transition-colors flex justify-center items-center gap-2 disabled:opacity-50">
        {loading ? "Creating..." : "Create & Unlock"} <ArrowBigRight size={18} />
      </button>
    </div>
  );
};

const ConnectView = ({ onConnect, loading }: { onConnect: (url: string, u: string, p: string) => void, loading: boolean }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [url, setUrl] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-white mb-6 text-center">Restore from Server</h2>
      <div>
        <label className="text-xs text-gray-400 font-medium ml-1">Server URL</label>
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="example.com"
          className="w-full bg-[#2b2d33] border border-gray-700 text-gray-200 text-sm rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500"
        />
        <p className="text-[10px] text-gray-500 mt-1 ml-1">We'll add /api/v1 automatically if missing.</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-gray-400 font-medium ml-1">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full bg-[#2b2d33] border border-gray-700 text-gray-200 text-sm rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500"
          />
        </div>
        <div>
          <label className="text-xs text-gray-400 font-medium ml-1">Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#2b2d33] border border-gray-700 text-gray-200 text-sm rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
      </div>
      <button
        onClick={() => onConnect(url, username, password)}
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl mt-4 transition-colors flex justify-center items-center gap-2 disabled:opacity-50">
        {loading ? "Connecting..." : "Connect & Restore"} <ArrowBigRight size={18} />
      </button>
    </div>
  );
};

const NewUserModal = ({ onClick }: { onClick: () => void }) => {
  const [mode, setMode] = useState<Mode>('select');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegisterLocal = async (u: string, p: string) => {
    setLoading(true);
    setError('');
    try {
      await window.electron.ipcRenderer.invoke('auth:register', { username: u, password: p });
      onClick();
    } catch (e) {
      console.error(e);
      setError("Registration failed. Try a different username?");
    } finally {
      setLoading(false);
    }
  };

  const handleConnectSync = async (url: string, u: string, p: string) => {
    setLoading(true);
    setError('');

    const cleanUrl = normalizeApiUrl(url);

    try {
      await window.electron.ipcRenderer.invoke('auth:login-sync', { url: cleanUrl, username: u, password: p });
      await window.electron.ipcRenderer.invoke('sync:now');
      onClick();
    } catch (e) {
      console.error(e);
      setError("Connection failed. Check URL (is the server running?) and credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-[#23242a] w-96 rounded-2xl p-6 shadow-2xl border border-gray-800 relative">

        {mode !== 'select' && (
          <button
            onClick={() => { setMode('select'); setError(''); }}
            className="absolute top-6 left-6 text-gray-500 hover:text-white"
          >
            <ArrowLeft size={20} />
          </button>
        )}

        {mode === 'select' && <SelectionView setMode={setMode} />}
        {mode === 'create' && <CreateView onRegister={handleRegisterLocal} loading={loading} />}
        {mode === 'connect' && <ConnectView onConnect={handleConnectSync} loading={loading} />}

        {error && (
          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs text-center">
            {error}
          </div>
        )}

      </div>
    </div>
  );
};
export default NewUserModal;
