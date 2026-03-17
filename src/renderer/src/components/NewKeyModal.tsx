import { Plus, X } from 'lucide-react';
import { useState } from 'react';
import { SavedKey } from '../../../shared/types';
import { useSaveKey } from '@/hooks/useData';
import { useEscape } from '@/hooks/useEscape';
import { KeyEditor } from './ui/KeyEditor';
import { Button } from '@/components/ui/button';

const NewKeyModal = ({ onClose, onSaved }: { onClose: () => void, onSaved: () => void }) => {
  const [formData, setFormData] = useState<Partial<SavedKey>>({});
  const saveMutation = useSaveKey();

  useEscape(onClose);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.privateKey) return;

    saveMutation.mutate(formData, {
      onSuccess: () => { onSaved(); onClose(); }
    });
  };

  return (
    <div onClick={(e) => e.stopPropagation()} className="fixed inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-card w-150 rounded-2xl p-6 shadow-2xl border border-border/50 relative">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-foreground mx-auto">New key</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="absolute right-2 top-2 text-muted-foreground hover:text-foreground">
            <X size={18} />
          </Button>
        </div>

        <form className="space-y-4" onSubmit={handleSave}>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground font-medium ml-1">Name</label>
            <input
              type="text"
              placeholder="My Key"
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full bg-input border border-border text-foreground text-sm rounded-lg px-4 py-3 focus:outline-none focus:border-primary"
              autoFocus
            />
          </div>

          <KeyEditor
            value={formData.privateKey || ''}
            onChange={(val) => setFormData({...formData, privateKey: val})}
          />

          <Button
            type="submit"
            disabled={saveMutation.isPending}
            className="w-full mt-4"
            size="lg"
          >
            {saveMutation.isPending ? "Saving..." : "Save"} <Plus size={18} />
          </Button>
        </form>
      </div>
    </div>
  );
};

export default NewKeyModal;
