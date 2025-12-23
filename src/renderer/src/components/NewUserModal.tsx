import { ArrowBigRight } from 'lucide-react';
import { useState } from 'react';

const NewUserModal = ({ onClick }: { onClick: () => void }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleRegister = async () => {
    try {
      // In a real app, check if we need to Login or Register via ipc 'auth:check'
      // For now, assuming Register for dev
      await window.electron.ipcRenderer.invoke('auth:register', { username, password });
      onClick(); // Updates parent state to "LoggedIn"
    } catch (e) {
      console.error(e);
      setError("Registration failed");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-[#23242a] w-96 rounded-2xl p-6 shadow-2xl border border-gray-800">
        <h2 className="text-xl font-semibold text-white mb-6 text-center">Create Master User</h2>

        <form className="space-y-4">
          <div>
            <label className="text-xs text-gray-400 font-medium ml-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-[#2b2d33] border border-gray-700 text-gray-200 text-sm rounded-lg px-4 py-3 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="text-xs text-gray-400 font-medium ml-1">Master Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#2b2d33] border border-gray-700 text-gray-200 text-sm rounded-lg px-4 py-3 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {error && <div className="text-red-500 text-sm text-center">{error}</div>}

          <button
            type="button"
            onClick={handleRegister}
            className="w-full bg-[#10b981] hover:bg-[#059669] text-white font-medium py-3 rounded-xl mt-4 transition-colors flex justify-center items-center gap-2">
            Create & Unlock <ArrowBigRight size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};
export default NewUserModal;
