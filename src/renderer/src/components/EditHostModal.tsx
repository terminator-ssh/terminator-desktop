import { Plus, X } from 'lucide-react';
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Host, SavedKey, IPC } from '../../../shared/types';
import { useKeys, useSaveHost } from '@/hooks/useData';
import { useEscape } from '@/hooks/useEscape';
import { PasswordInput } from './ui/PasswordInput';
import { KeySelector } from './ui/KeySelector';

const EditHostModal = ({ host, onClose, onSaved }: { host: Host, onClose: () => void, onSaved: () => void }) => {
  const queryClient = useQueryClient();
  const { data: existingKeys = [] } = useKeys();
  const saveHostMutation = useSaveHost();
  useEscape(onClose);

  const [formData, setFormData] = useState<Host>(host);

  const initialKey = existingKeys.find(k => k.id === host.keyId);
  const [keyContent, setKeyContent] = useState(initialKey ? initialKey.privateKey : '');

  const handleChange = (field: keyof Host, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    let finalKeyId = formData.keyId;

    if (keyContent && !finalKeyId) {
      const newKey: Partial<SavedKey> = {
        name: `${formData.name} key`,
        privateKey: keyContent
      };
      try {
        const result = await window.electron.ipcRenderer.invoke(IPC.KEYS.SAVE, newKey);
        finalKeyId = result.id;

        await queryClient.invalidateQueries({ queryKey: ['keys'] });

      } catch(e) { return; }
    } else if (!keyContent) {
      finalKeyId = undefined;
    }

    saveHostMutation.mutate({ ...formData, keyId: finalKeyId }, {
      onSuccess: () => { onSaved(); onClose(); }
    });
  };

  return (
    <div onClick={(e) => e.stopPropagation()} className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 cursor-default">
      <div className="bg-[#23242a] w-[500px] rounded-2xl p-6 shadow-2xl border border-gray-800 relative max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-white mx-auto">Edit Host</h2>
          <button onClick={onClose} className="absolute right-6 text-gray-400 hover:text-white"><X size={20} /></button>
        </div>

        <form className="space-y-4" onSubmit={handleSave}>
          <div className="space-y-1">
            <label className="text-xs text-gray-400 font-medium ml-1">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="w-full bg-[#2b2d33] border border-gray-700 text-gray-200 text-sm rounded-lg px-4 py-3 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2 space-y-1">
              <label className="text-xs text-gray-400 font-medium ml-1">Host</label>
              <input
                type="text"
                value={formData.host}
                onChange={(e) => handleChange('host', e.target.value)}
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

          <div className="space-y-1">
            <label className="text-xs text-gray-400 font-medium ml-1">Password</label>
            <PasswordInput
              value={formData.password || ''}
              onChange={(val) => handleChange('password', val)}
              placeholder="Leave empty to keep unchanged"
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

          <button type="submit" className="w-full bg-[#10b981] hover:bg-[#059669] text-white font-medium py-3 rounded-xl mt-4 transition-colors flex justify-center items-center gap-2">
            Save Changes <Plus size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};
export default EditHostModal;
