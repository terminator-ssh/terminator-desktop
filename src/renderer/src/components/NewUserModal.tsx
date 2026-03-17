import { ArrowBigRight, Server, Shield, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { normalizeApiUrl } from '@/lib/utils';
import { Button } from '@/components/ui/button';

type Mode = 'select' | 'create' | 'connect';

const SelectionView = ({ setMode }: { setMode: (m: Mode) => void }) => (
  <div className="space-y-4">
    <h2 className="text-xl font-semibold text-foreground mb-2 text-center">Welcome to Terminator</h2>
    <p className="text-muted-foreground text-sm text-center mb-6">Choose how you want to start.</p>

    <Button
      variant="ghost"
      onClick={() => setMode('create')}
      className="w-full bg-input hover:bg-input/80 border border-border p-4 rounded-xl flex items-center gap-4 text-left h-auto justify-start whitespace-normal"
    >
      <div className="bg-primary/10 p-3 rounded-lg shrink-0">
        <Shield className="text-primary" size={24} />
      </div>
      <div>
        <div className="text-foreground font-medium">Create Local Vault</div>
        <div className="text-xs text-muted-foreground/70 mt-1">Store keys locally. Sync optional later.</div>
      </div>
    </Button>

    <Button
      variant="ghost"
      onClick={() => setMode('connect')}
      className="w-full bg-input hover:bg-input/80 border border-border p-4 rounded-xl flex items-center gap-4 text-left h-auto justify-start whitespace-normal"
    >
      <div className="bg-info/10 p-3 rounded-lg shrink-0">
        <Server className="text-info" size={24} />
      </div>
      <div>
        <div className="text-foreground font-medium">Restore from Server</div>
        <div className="text-xs text-muted-foreground/70 mt-1">Log in to an existing account and download data.</div>
      </div>
    </Button>
  </div>
);

const CreateView = ({ onRegister, loading }: { onRegister: (u: string, p: string) => void, loading: boolean }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-foreground mb-6 text-center">Create Local Vault</h2>
      <div>
        <label className="text-xs text-muted-foreground font-medium ml-1">Username</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full bg-input border border-border text-foreground text-sm rounded-lg px-4 py-3 focus:outline-none focus:border-primary"
          autoFocus
        />
      </div>

      <div>
        <label className="text-xs text-muted-foreground font-medium ml-1">Master Password</label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-input border border-border text-foreground text-sm rounded-lg px-4 py-3 focus:outline-none focus:border-primary pr-10"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-1 top-1/2 -translate-y-1/2 text-muted-foreground/70 hover:text-foreground">
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </Button>
        </div>
      </div>

      <Button
        onClick={() => onRegister(username, password)}
        disabled={loading}
        className="w-full mt-4"
        size="lg"
      >
        {loading ? "Creating..." : "Create & Unlock"} <ArrowBigRight size={18} />
      </Button>
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
      <h2 className="text-xl font-semibold text-foreground mb-6 text-center">Restore from Server</h2>
      <div>
        <label className="text-xs text-muted-foreground font-medium ml-1">Server URL</label>
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="example.com"
          className="w-full bg-input border border-border text-foreground text-sm rounded-lg px-4 py-3 focus:outline-none focus:border-primary"
        />
        <p className="text-[10px] text-muted-foreground/70 mt-1 ml-1">We'll add /api/v1 automatically if missing.</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-muted-foreground font-medium ml-1">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full bg-input border border-border text-foreground text-sm rounded-lg px-4 py-3 focus:outline-none focus:border-primary"
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground font-medium ml-1">Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-input border border-border text-foreground text-sm rounded-lg px-4 py-3 focus:outline-none focus:border-primary pr-10"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-1 top-1/2 -translate-y-1/2 text-muted-foreground/70 hover:text-foreground">
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </Button>
          </div>
        </div>
      </div>
      <Button
        onClick={() => onConnect(url, username, password)}
        disabled={loading}
        variant="info"
        className="w-full mt-4"
        size="lg"
      >
        {loading ? "Connecting..." : "Connect & Restore"} <ArrowBigRight size={18} />
      </Button>
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
    <div className="fixed inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-card w-96 rounded-2xl p-6 shadow-2xl border border-border/50 relative">

        {mode !== 'select' && (
          <Button
            variant="ghost"
            onClick={() => { setMode('select'); setError(''); }}
            className="absolute top-6 left-6 text-muted-foreground/70 hover:text-foreground"
          >
            <ArrowLeft size={20} />
          </Button>
        )}

        {mode === 'select' && <SelectionView setMode={setMode} />}
        {mode === 'create' && <CreateView onRegister={handleRegisterLocal} loading={loading} />}
        {mode === 'connect' && <ConnectView onConnect={handleConnectSync} loading={loading} />}

        {error && (
          <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-xs text-center">
            {error}
          </div>
        )}

      </div>
    </div>
  );
};

export default NewUserModal;
