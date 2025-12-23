import {
  Cloud, Search, Plus, MoreHorizontal, Edit2, Trash2
} from 'lucide-react';
import { useState } from 'react';
import NewHostModal from '../NewHostModal';
import EditHostModal from '../EditHostModal';

const HostCard = (props) => {
  const [isOptionsOpen, setOptionsOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // ye xt pf [htym]
  console.log(props.props)
  return (
    
          <div key={props.props.id} className="bg-[#23242a] p-5 rounded-2xl border border-transparent hover:border-gray-700 transition-all group relative">
            <div className="flex items-center gap-4">
              <div className="mt-1">
                <Cloud size={24} className="text-gray-400" />
              </div>props
              <div className="flex-1">
                <h3 className="text-gray-200 font-medium text-lg">{props.props.name}</h3>
                <div className="text-gray-500 text-sm mt-1 flex flex-wrap gap-x-3">
                  <span>Host: {props.props.host}</span>
                  <span className="text-gray-700">|</span>
                  <span>Port: {props.props.port}</span>
                  <span className="text-gray-700">|</span>
                  <span>User: {props.props.user}</span>
                </div>
              </div>

              {/* Context Menu Trigger */}
              <button  onClick={() => setOptionsOpen(!isOptionsOpen) }  className="text-gray-500 hover:text-white">
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

            </div>
            {
                isModalOpen && <EditHostModal props={props.props} onClose={() => setIsModalOpen(false)} />
            }
            
          </div>
  );
};

export default HostCard
