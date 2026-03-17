import { ArrowBigRight, Lock } from 'lucide-react';
import { useState } from 'react';
import { PasswordInput } from './ui/PasswordInput';

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
    <div className="fixed inset-0 bg-background/90 backdrop-blur-md flex items-center justify-center z-50">
      <div className="bg-card w-96 rounded-2xl p-8 shadow-2xl border border-border/50 text-center">
        <div className="mx-auto bg-secondary w-16 h-16 rounded-full flex items-center justify-center mb-6">
          <Lock size={32} className="text-primary" />
        </div>

        <h2 className="text-2xl font-bold text-foreground mb-2">Welcome Back</h2>
        <p className="text-muted-foreground text-sm mb-6">Enter your master password to unlock your vault.</p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="text-left">
            <PasswordInput
              value={password}
              onChange={setPassword}
              placeholder="Master Password"
              className="py-3"
            />
          </div>

          {error && <div className="text-destructive text-xs bg-destructive/10 p-2 rounded">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary/90 text-foreground font-medium py-3 rounded-xl transition-colors flex justify-center items-center gap-2 disabled:opacity-50">
            {loading ? "Unlocking..." : "Unlock Vault"}
            {!loading && <ArrowBigRight size={18} />}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginModal;
