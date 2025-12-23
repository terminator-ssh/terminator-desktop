import {
  Cloud, Search, Plus, MoreHorizontal, Edit2, Trash2,
  Key
} from 'lucide-react';
import { useState } from 'react';
import NewHostModal from '../NewHostModal';
import EditKeyModal from '../EditKeyModal';

const KeyCard = (props) => {
  const [isOptionsOpen, setOptionsOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  

  console.log(props.props)
  return (
    
          <div key={props.props.id} className="bg-[#23242a] p-4 rounded-xl flex items-center gap-4 hover:bg-[#2b2d33]  transition-colors border border-transparent hover:border-gray-700 transition-all group relative">
            <div className="p-2 bg-[#2b2d33] rounded-lg">
                <Key size={20} className="text-gray-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-gray-200 font-medium">{props.props.name}</h3>
            </div>
            <button onClick={() => setOptionsOpen(!isOptionsOpen)} className="text-gray-500 hover:text-white p-2">
              <MoreHorizontal size={20} />
            </button>
          

            {
                isOptionsOpen &&
                <div className="absolute right-12 top-4 bg-[#1e1f24] rounded-lg shadow-xl border border-gray-800 overflow-hidden flex flex-col w-28 z-10">
                    <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-4 py-2 text-xs text-gray-300 hover:bg-[#2b2d33] text-left">
                    <Edit2 size={12} /> Edit
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 text-xs text-red-400 hover:bg-[#2b2d33] text-left">
                        <Trash2 size={12} /> Delete
                    </button>
                </div>
            }

            {
                isModalOpen && <EditKeyModal props={props.props} onClose={() => setIsModalOpen(false)} />
            }
            
          </div>
  );
};

export default KeyCard
