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
    <div onClick={(e) => e.stopPropagation()} className="fixed inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center z-50 cursor-default">
      <div className="bg-card w-150 rounded-2xl p-6 shadow-2xl border border-border/50 relative">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-foreground mx-auto">Edit Key</h2>
          <button onClick={onClose} className="absolute right-6 text-muted-foreground hover:text-foreground"><X size={20} /></button>
        </div>

        <form className="space-y-4" onSubmit={handleSave}>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground font-medium ml-1">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full bg-input border border-border text-foreground text-sm rounded-lg px-4 py-3 focus:outline-none focus:border-primary"
            />
          </div>

          <KeyEditor
            value={formData.privateKey}
            onChange={(val) => setFormData({...formData, privateKey: val})}
          />

          <button type="submit" className="w-full bg-primary hover:bg-primary/90 text-foreground font-medium py-3 rounded-xl mt-4 transition-colors flex justify-center items-center gap-2">
            Save Changes <Plus size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};
export default EditKeyModal;
