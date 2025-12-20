import React from 'react';
import { 
  Cloud, Search, Plus, MoreHorizontal, Edit2, Trash2
} from 'lucide-react';

const HostsPage = () => {
  // Mock data for hosts
  const hosts = [
    { id: 1, name: 'wing.vaultsoldier.tech', host: '12498442342', port: '12498', user: 'dssddasdsa' },
    { id: 2, name: 'wing.vaultsoldier.tech', host: '12498442342', port: '12498', user: 'dssddasdsa' },
    { id: 3, name: 'wing.vaultsoldier.tech', host: '12498442342', port: '12498', user: 'dssddasdsa' },
  ];

  return (
    <div className="p-8 w-full">
      {/* Header */}
      <h1 className="text-3xl font-bold text-gray-200 mb-2">Terminator SSH <span className="text-gray-500 text-lg font-normal">| Hosts</span></h1>
      
      {/* Controls */}
      <div className="flex justify-between items-center mb-8 mt-6">
        <div className="relative w-full max-w-2xl">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
          <input 
            type="text" 
            placeholder="Find a host or ssh" 
            className="w-full bg-[#23242a] text-gray-300 pl-12 pr-4 py-3 rounded-xl focus:outline-none border border-transparent focus:border-gray-700"
          />
        </div>
        <button className="bg-[#10b981] hover:bg-[#059669] text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2 transition-colors ml-4">
          New host <Plus size={18} />
        </button>
      </div>

      <h2 className="text-xl font-semibold text-gray-200 mb-4">Save hosts</h2>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {hosts.map((host) => (
          <div key={host.id} className="bg-[#23242a] p-5 rounded-2xl border border-transparent hover:border-gray-700 transition-all group relative">
            <div className="flex items-start gap-4">
              <div className="mt-1">
                <Cloud size={24} className="text-gray-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-gray-200 font-medium text-lg">{host.name}</h3>
                <div className="text-gray-500 text-sm mt-1 flex flex-wrap gap-x-3">
                  <span>Host: {host.host}</span>
                  <span className="text-gray-700">|</span>
                  <span>Port: {host.port}</span>
                  <span className="text-gray-700">|</span>
                  <span>User: {host.user}</span>
                </div>
              </div>
              
              {/* Context Menu Trigger */}
              <button className="text-gray-500 hover:text-white">
                <MoreHorizontal size={20} />
              </button>
              
              {/* Visual Demo of Context Menu (Show only on first item for demo) */}
              {host.id === 1 && (
                <div className="absolute right-12 top-4 bg-[#1e1f24] rounded-lg shadow-xl border border-gray-800 overflow-hidden flex flex-col w-28 z-10">
                    <button className="flex items-center gap-2 px-4 py-2 text-xs text-gray-300 hover:bg-[#2b2d33] text-left">
                      <Edit2 size={12} /> Edit
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 text-xs text-red-400 hover:bg-[#2b2d33] text-left">
                        <Trash2 size={12} /> Delete
                    </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HostsPage