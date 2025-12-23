import { ArrowBigRight, Lock } from 'lucide-react';
import { useState } from 'react';

const LoginModal = ({ onUnlock }: { onUnlock: () => void }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const success = await window.electron.ipcRenderer.invoke('auth:login', { password });
      if (success) {
        onUnlock();
      } else {
        setError("Invalid password");
      }
    } catch (err) {
      setError("Decryption failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50">
    <div className="bg-[#23242a] w-96 rounded-2xl p-8 shadow-2xl border border-gray-800 text-center">
    <div className="mx-auto bg-gray-800 w-16 h-16 rounded-full flex items-center justify-center mb-6">
    <Lock size={32} className="text-emerald-500" />
    </div>

    <h2 className="text-2xl font-bold text-white mb-2">Welcome Back</h2>
  <p className="text-gray-400 text-sm mb-6">Enter your master password to unlock your vault.</p>

  <form onSubmit={handleLogin} className="space-y-4">
  <div className="text-left">
  <input
    type="password"
  placeholder="Master Password"
  value={password}
  onChange={(e) => setPassword(e.target.value)}
  className="w-full bg-[#2b2d33] border border-gray-700 text-gray-200 text-sm rounded-lg px-4 py-3 focus:outline-none focus:border-emerald-500 transition-colors"
  autoFocus
  />
  </div>

  {error && <div className="text-red-400 text-xs bg-red-400/10 p-2 rounded">{error}</div>}

    <button
    type="submit"
    disabled={loading}
    className="w-full bg-[#10b981] hover:bg-[#059669] text-white font-medium py-3 rounded-xl transition-colors flex justify-center items-center gap-2 disabled:opacity-50">
      {loading ? "Unlocking..." : "Unlock Vault"}
    {!loading && <ArrowBigRight size={18} />}
    </button>
    </form>
    </div>
    </div>
    );
    };

    export default LoginModal;
