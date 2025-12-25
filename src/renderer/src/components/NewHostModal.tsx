import { Plus, X, AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Host, SavedKey, IPC } from '../../../shared/types';
import { useKeys, useSaveHost } from '@/hooks/useData';
import { useEscape } from '@/hooks/useEscape';
import { PasswordInput } from './ui/PasswordInput';
import { KeySelector } from './ui/KeySelector';

const NewHostModal = ({ onClose, onSaved }: { onClose: () => void, onSaved: () => void }) => {
  const queryClient = useQueryClient();
  const { data: existingKeys = [] } = useKeys();
  const saveHostMutation = useSaveHost();

  useEscape(onClose);

  const [formData, setFormData] = useState<Partial<Host>>({ port: 22, username: 'root' });
  const [showValidationWarning, setShowValidationWarning] = useState(false);

  const [keyContent, setKeyContent] = useState('');

  const handleChange = (field: keyof Host, value: any) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      if (field === 'host' && (!prev.name || prev.name === prev.host)) {
        updated.name = value;
      }
      return updated;
    });
  };

  const handleSave = async () => {
    if ((!formData.name || !formData.host || !formData.username) && !showValidationWarning) {
      setShowValidationWarning(true);
      return;
    }

    let finalKeyId = formData.keyId;

    const isNewKeyContent = keyContent && !existingKeys.find(k => k.id === finalKeyId);

    if (isNewKeyContent) {
      const newKey: Partial<SavedKey> = {
        name: `${formData.name} key`,
        privateKey: keyContent
      };

      try {
        const result = await window.electron.ipcRenderer.invoke(IPC.KEYS.SAVE, newKey);
        finalKeyId = result.id;

        await queryClient.invalidateQueries({ queryKey: ['keys'] });

      } catch (e) {
        console.error("Failed to auto-create key", e);
        return;
      }
    } else if (!keyContent) {
      finalKeyId = undefined;
    }

    const hostPayload = { ...formData, keyId: finalKeyId };

    saveHostMutation.mutate(hostPayload, {
      onSuccess: () => { onSaved(); onClose(); }
    });
  };

  return (
    <div onClick={(e) => e.stopPropagation()} className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-[#23242a] w-[500px] rounded-2xl p-6 shadow-2xl border border-gray-800 relative max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-white">New Host</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><X size={20} /></button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1">
              <label className="text-xs text-gray-400 font-medium ml-1">Host IP / Domain</label>
              <input
                type="text"
                placeholder="192.168.1.1"
                onChange={(e) => handleChange('host', e.target.value)}
                className="w-full bg-[#2b2d33] border border-gray-700 text-gray-200 text-sm rounded-lg px-4 py-3 focus:outline-none focus:border-emerald-500"
                autoFocus
              />
            </div>
            <div className="col-span-2 space-y-1">
              <label className="text-xs text-gray-400 font-medium ml-1">Label</label>
              <input
                type="text"
                value={formData.name || ''}
                placeholder="My Server"
                onChange={(e) => handleChange('name', e.target.value)}
                className="w-full bg-[#2b2d33] border border-gray-700 text-gray-200 text-sm rounded-lg px-4 py-3 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-gray-400 font-medium ml-1">Port</label>
              <input
                type="number"
                value={formData.port}
                onChange={(e) => handleChange('port', parseInt(e.target.value))}
                className="w-full bg-[#2b2d33] border border-gray-700 text-gray-200 text-sm rounded-lg px-4 py-3 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-gray-400 font-medium ml-1">Username</label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => handleChange('username', e.target.value)}
                className="w-full bg-[#2b2d33] border border-gray-700 text-gray-200 text-sm rounded-lg px-4 py-3 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-gray-400 font-medium ml-1">Password</label>
            <PasswordInput
              value={formData.password || ''}
              onChange={(val) => handleChange('password', val)}
              placeholder="Optional"
            />
          </div>

          <KeySelector
            value={keyContent}
            onChange={(val) => {
              setKeyContent(val);
              const existing = existingKeys.find(k => k.privateKey === val);
              handleChange('keyId', existing ? existing.id : undefined);
            }}
          />

          {showValidationWarning && (
            <div className="flex items-center gap-2 text-yellow-500 text-xs bg-yellow-500/10 p-3 rounded-lg border border-yellow-500/20">
              <AlertTriangle size={16} />
              <span>Missing required fields. Click Save again to force.</span>
            </div>
          )}

          <button
            type="button"
            onClick={handleSave}
            disabled={saveHostMutation.isPending}
            className={`w-full font-medium py-3 rounded-xl mt-4 transition-colors flex justify-center items-center gap-2
              ${showValidationWarning ? 'bg-yellow-600 hover:bg-yellow-700 text-white' : 'bg-[#10b981] hover:bg-[#059669] text-white'}`}
          >
            {saveHostMutation.isPending ? "Saving..." : "Save"} <Plus size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};
export default NewHostModal;
