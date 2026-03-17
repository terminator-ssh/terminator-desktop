import { Key, MoreHorizontal, Edit2, Trash2 } from 'lucide-react';
import { useState } from 'react';
import EditKeyModal from '../EditKeyModal';
import { SavedKey } from '../../../../shared/types';
import ConfirmModal from '../ConfirmModal';
import { useDeleteKey, useSaveKey } from '@/hooks/useData';
import { InlineInput } from './InlineInput';

const KeyCard = ({ props, onClose }: { props: SavedKey, onClose: () => void }) => {
  const [isOptionsOpen, setOptionsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);

  const deleteMutation = useDeleteKey();
  const saveMutation = useSaveKey();

  const handleDelete = () => {
    deleteMutation.mutate(props.id);
    setIsDeleteModalOpen(false);
    onClose();
  };

  const handleRename = (newName: string) => {
    saveMutation.mutate({ ...props, name: newName });
    setIsEditingName(false);
  };

  return (
    <>
      <div className="bg-card p-4 rounded-xl flex items-center gap-4 hover:bg-input transition-colors border border-transparent hover:border-border transition-all group relative">
        <div className="p-2 bg-input rounded-lg">
          <Key size={20} className="text-muted-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          {isEditingName ? (
            <InlineInput
              value={props.name}
              className="bg-sidebar border border-primary text-foreground font-medium px-2 py-0.5 rounded w-full"
              onSave={handleRename}
              onCancel={() => setIsEditingName(false)}
            />
          ) : (
            <h3
              className="text-foreground font-medium truncate cursor-text border border-transparent hover:border-border px-1 -ml-1 rounded transition-colors"
              onClick={(e) => { e.stopPropagation(); setIsEditingName(true); }}
              title="Click to rename"
            >
              {props.name}
            </h3>
          )}
        </div>

        <button
          onClick={(e) => { e.stopPropagation(); setOptionsOpen(!isOptionsOpen); }}
          className="text-muted-foreground/70 hover:text-foreground p-2 rounded-lg hover:bg-foreground/5"
        >
          <MoreHorizontal size={20} />
        </button>

        {isOptionsOpen && (
          <>
            <div
              className="fixed inset-0 z-10 cursor-default"
              onClick={(e) => { e.stopPropagation(); setOptionsOpen(false); }}
            />
            <div className="absolute right-12 top-4 bg-sidebar rounded-lg shadow-xl border border-border/50 overflow-hidden flex flex-col w-32 z-20">
              <button
                onClick={(e) => { e.stopPropagation(); setIsEditOpen(true); setOptionsOpen(false); }}
                className="flex items-center gap-2 px-4 py-2 text-xs text-foreground/80 hover:bg-input text-left">
                <Edit2 size={12} /> Edit
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setIsDeleteModalOpen(true); setOptionsOpen(false); }}
                className="flex items-center gap-2 px-4 py-2 text-xs text-destructive hover:bg-input text-left">
                <Trash2 size={12} /> Delete
              </button>
            </div>
          </>
        )}
      </div>

      {isEditOpen && (
        <EditKeyModal
          savedKey={props}
          onClose={() => setIsEditOpen(false)}
          onSaved={onClose}
        />
      )}

      {isDeleteModalOpen && (
        <ConfirmModal
          title="Delete Key?"
          message={`Are you sure you want to delete ${props.name}?`}
          onConfirm={handleDelete}
          onCancel={() => setIsDeleteModalOpen(false)}
        />
      )}
    </>
  );
};

export default KeyCard;
