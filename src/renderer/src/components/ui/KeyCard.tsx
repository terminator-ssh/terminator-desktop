import { Key, MoreHorizontal, Edit2, Trash2 } from 'lucide-react';
import { useState } from 'react';
import EditKeyModal from '../EditKeyModal';
import { SavedKey } from '../../../../shared/types';
import ConfirmModal from '../ConfirmModal';
import { useDeleteKey, useSaveKey } from '@/hooks/useData';
import { InlineInput } from './InlineInput'; // Import

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
      <div className="bg-[#23242a] p-4 rounded-xl flex items-center gap-4 hover:bg-[#2b2d33] transition-colors border border-transparent hover:border-gray-700 transition-all group relative">
        <div className="p-2 bg-[#2b2d33] rounded-lg">
          <Key size={20} className="text-gray-400" />
        </div>
        <div className="flex-1 min-w-0">
          {isEditingName ? (
            <InlineInput
              value={props.name}
              className="bg-[#1e1f24] border border-emerald-500 text-white font-medium px-2 py-0.5 rounded w-full"
              onSave={handleRename}
              onCancel={() => setIsEditingName(false)}
            />
          ) : (
            <h3
              className="text-gray-200 font-medium truncate cursor-text border border-transparent hover:border-gray-700 px-1 -ml-1 rounded transition-colors"
              onClick={(e) => { e.stopPropagation(); setIsEditingName(true); }}
              title="Click to rename"
            >
              {props.name}
            </h3>
          )}
        </div>

        <button
          onClick={(e) => { e.stopPropagation(); setOptionsOpen(!isOptionsOpen); }}
          className="text-gray-500 hover:text-white p-2 rounded-lg hover:bg-white/5"
        >
          <MoreHorizontal size={20} />
        </button>

        {isOptionsOpen && (
          <>
            <div
              className="fixed inset-0 z-10 cursor-default"
              onClick={(e) => { e.stopPropagation(); setOptionsOpen(false); }}
            />
            <div className="absolute right-12 top-4 bg-[#1e1f24] rounded-lg shadow-xl border border-gray-800 overflow-hidden flex flex-col w-32 z-20">
              <button
                onClick={(e) => { e.stopPropagation(); setIsEditOpen(true); setOptionsOpen(false); }}
                className="flex items-center gap-2 px-4 py-2 text-xs text-gray-300 hover:bg-[#2b2d33] text-left">
                <Edit2 size={12} /> Edit
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setIsDeleteModalOpen(true); setOptionsOpen(false); }}
                className="flex items-center gap-2 px-4 py-2 text-xs text-red-400 hover:bg-[#2b2d33] text-left">
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
