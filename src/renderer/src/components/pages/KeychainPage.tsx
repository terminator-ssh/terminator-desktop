import React, { useState }  from 'react';
import { 
  Key, Search, Plus, MoreHorizontal 
} from 'lucide-react';
import NewKeychainModal from '../ui/NewKeyChainModal';

const KeychainPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const keys = [
    { id: 1, name: 'Key 1', user: '12498442342', pass: 'gjikrdjhkwfdjdshfdhbj...' },
    { id: 2, name: 'Key 2', user: '12498442342', pass: 'gjikrdjhkwfdjdshfdhbj...' },
    { id: 3, name: 'Key 3', user: '12498442342', pass: 'gjikrdjhkwfdjdshfdhbj...' },
    { id: 4, name: 'Key 4', user: '12498442342', pass: 'gjikrdjhkwfdjdshfdhbj...' },
  ];

  return (
    <div className="p-8 w-full">
      {/* Header */}
      <h1 className="text-3xl font-bold text-gray-200 mb-2">Terminator SSH <span className="text-gray-500 text-lg font-normal">| Keychain</span></h1>
      
       {/* Controls */}
       <div className="flex justify-between items-center mb-8 mt-6">
        <div className="relative w-full max-w-2xl">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
          <input 
            type="text" 
            placeholder="Find a keychain" 
            className="w-full bg-[#23242a] text-gray-300 pl-12 pr-4 py-3 rounded-xl focus:outline-none border border-transparent focus:border-gray-700"
          />
        </div>
        <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-[#10b981] hover:bg-[#059669] text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2 transition-colors ml-4"
        >
          New key <Plus size={18} />
        </button>
      </div>

      <h2 className="text-xl font-semibold text-gray-200 mb-4">Save keys</h2>

      {/* List */}
      <div className="flex flex-col gap-3">
        {keys.map((key) => (
          <div key={key.id} className="bg-[#23242a] p-4 rounded-xl flex items-center gap-4 hover:bg-[#2b2d33] transition-colors border border-transparent hover:border-gray-700">
            <div className="p-2 bg-[#2b2d33] rounded-lg">
                <Key size={20} className="text-gray-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-gray-200 font-medium">{key.name}</h3>
              <div className="text-gray-500 text-sm flex gap-3">
                <span>User: {key.user}</span>
                <span className="text-gray-700">|</span>
                <span className="font-mono text-xs pt-0.5 opacity-60">Password: {key.pass}</span>
              </div>
            </div>
            <button className="text-gray-500 hover:text-white p-2">
              <MoreHorizontal size={20} />
            </button>
          </div>
        ))}
      </div>

      {/* Modal Overlay */}
      {isModalOpen && <NewKeychainModal onClose={() => setIsModalOpen(false)} />}
    </div>
  );
};

export default KeychainPage