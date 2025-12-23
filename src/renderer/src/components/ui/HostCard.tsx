import { Cloud, MoreHorizontal, Edit2, Trash2 } from 'lucide-react';
import { useState } from 'react';
import EditHostModal from '../EditHostModal';
import { Host, IPC } from '../../../../shared/types';

// Define props correctly
const HostCard = ({ props, onClose }: { props: Host, onClose: () => void }) => {
  const [isOptionsOpen, setOptionsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const handleDelete = async () => {
    if (confirm(`Delete ${props.name}?`)) {
      await window.electron.ipcRenderer.invoke(IPC.HOSTS.DELETE, props.id);
      onClose(); // Triggers a refresh in parent
    }
  };

  return (
    <div className="bg-[#23242a] p-5 rounded-2xl border border-transparent hover:border-gray-700 transition-all group relative">
      <div className="flex items-center gap-4">
        <div className="mt-1">
          <Cloud size={24} className="text-gray-400" />
        </div>
        <div className="flex-1">
          <h3 className="text-gray-200 font-medium text-lg">{props.name}</h3>
          <div className="text-gray-500 text-sm mt-1 flex flex-wrap gap-x-3">
            <span>{props.host}</span>
            <span className="text-gray-700">|</span>
            <span>{props.username}</span>
          </div>
        </div>

        <button onClick={(e) => { e.stopPropagation(); setOptionsOpen(!isOptionsOpen); }} className="text-gray-500 hover:text-white p-2">
          <MoreHorizontal size={20} />
        </button>

        {isOptionsOpen && (
          <div className="absolute right-12 top-4 bg-[#1e1f24] rounded-lg shadow-xl border border-gray-800 overflow-hidden flex flex-col w-28 z-20">
            <button
              onClick={(e) => { e.stopPropagation(); setIsEditOpen(true); setOptionsOpen(false); }}
              className="flex items-center gap-2 px-4 py-2 text-xs text-gray-300 hover:bg-[#2b2d33] text-left">
              <Edit2 size={12} /> Edit
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handleDelete(); }}
              className="flex items-center gap-2 px-4 py-2 text-xs text-red-400 hover:bg-[#2b2d33] text-left">
              <Trash2 size={12} /> Delete
            </button>
          </div>
        )}
      </div>

      {isEditOpen && (
        <EditHostModal
          host={props}
          onClose={() => setIsEditOpen(false)}
          onSaved={onClose} // Refresh list on save
        />
      )}
    </div>
  );
};

export default HostCard;
