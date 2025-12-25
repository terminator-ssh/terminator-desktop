import { Plus, X } from 'lucide-react';
import { useState } from 'react';
import { SavedKey } from '../../../shared/types';
import { useSaveKey } from '@/hooks/useData';
import { useEscape } from '@/hooks/useEscape';
import { KeyEditor } from './ui/KeyEditor';

const EditKeyModal = ({ savedKey, onClose, onSaved }: { savedKey: SavedKey, onClose: () => void, onSaved: () => void }) => {
  const [formData, setFormData] = useState<SavedKey>(savedKey);
  const saveMutation = useSaveKey();
  useEscape(onClose);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate(formData, {
      onSuccess: () => { onSaved(); onClose(); }
    });
  };

  return (
    <div onClick={(e) => e.stopPropagation()} className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 cursor-default">
      <div className="bg-[#23242a] w-150 rounded-2xl p-6 shadow-2xl border border-gray-800 relative">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-white mx-auto">Edit Key</h2>
          <button onClick={onClose} className="absolute right-6 text-gray-400 hover:text-white"><X size={20} /></button>
        </div>

        <form className="space-y-4" onSubmit={handleSave}>
          <div className="space-y-1">
            <label className="text-xs text-gray-400 font-medium ml-1">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full bg-[#2b2d33] border border-gray-700 text-gray-200 text-sm rounded-lg px-4 py-3 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <KeyEditor
            value={formData.privateKey}
            onChange={(val) => setFormData({...formData, privateKey: val})}
          />

          <button type="submit" className="w-full bg-[#10b981] hover:bg-[#059669] text-white font-medium py-3 rounded-xl mt-4 transition-colors flex justify-center items-center gap-2">
            Save Changes <Plus size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};
export default EditKeyModal;
