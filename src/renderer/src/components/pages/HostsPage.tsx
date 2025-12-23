import { Search, Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import NewHostModal from '../NewHostModal';
import HostCard from '../ui/HostCard';
import { Host, IPC } from '../../../../shared/types';

// Define props interface explicitly
interface HostsPageProps {
  onConnect: (host: Host) => void;
}

const HostsPage = ({ onConnect }: HostsPageProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hosts, setHosts] = useState<Host[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const refreshHosts = async () => {
    try {
      const data = await window.electron.ipcRenderer.invoke(IPC.HOSTS.GET);
      setHosts(data);
    } catch (e) {
      console.error("Failed to fetch hosts", e);
    }
  };

  useEffect(() => {
    refreshHosts();
  }, []);

  const handleSave = async () => {
    setIsModalOpen(false);
    await refreshHosts();
  };

  const filteredHosts = hosts.filter(h =>
    h.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    h.host.includes(searchTerm)
  );

  return (
    <div className="p-8 w-full">
      <h1 className="text-3xl font-bold text-gray-200 mb-2">Terminator <span className="text-gray-500 text-lg font-normal">| Hosts</span></h1>

      <div className="flex justify-between items-center mb-8 mt-6">
        <div className="relative w-full max-w-2xl">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
          <input
            type="text"
            placeholder="Find a host..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#23242a] text-gray-300 pl-12 pr-4 py-3 rounded-xl focus:outline-none border border-transparent focus:border-gray-700"
          />
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-[#10b981] hover:bg-[#059669] text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2 transition-colors ml-4"
        >
          New host <Plus size={18} />
        </button>
      </div>

      <h2 className="text-xl font-semibold text-gray-200 mb-4">Saved hosts</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredHosts.map((host) => (
          <div key={host.id} onClick={() => onConnect(host)} className="cursor-pointer">
            <HostCard props={host} onClose={() => {}} />
          </div>
        ))}
      </div>

      {isModalOpen && <NewHostModal onClose={() => setIsModalOpen(false)} onSaved={handleSave} />}
    </div>
  );
};

export default HostsPage;
