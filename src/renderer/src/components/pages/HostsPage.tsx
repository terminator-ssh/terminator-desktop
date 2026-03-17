import { Search, Plus } from 'lucide-react';
import { useState } from 'react';
import NewHostModal from '../NewHostModal';
import HostCard from '../ui/HostCard';
import { Host } from '../../../../shared/types';
import { useHosts } from '@/hooks/useData';

interface HostsPageProps {
  onConnect: (host: Host) => void;
}

const HostsPage = ({ onConnect }: HostsPageProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const { data: hosts = [] } = useHosts();

  const filteredHosts = hosts.filter(h => {
    const name = h.name || '';
    const host = h.host || '';
    const term = searchTerm.toLowerCase();

    return name.toLowerCase().includes(term) || host.includes(term);
  });

  return (
    <div className="p-8 w-full">
      <h1 className="text-3xl font-bold text-foreground mb-2">Terminator <span className="text-muted-foreground/70 text-lg font-normal">| Hosts</span></h1>

      <div className="flex justify-between items-center mb-8 mt-6">
        <div className="relative w-full max-w-2xl">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground/70" size={18} />
          <input
            type="text"
            placeholder="Find a host..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-card text-foreground/80 pl-12 pr-4 py-3 rounded-xl focus:outline-none border border-transparent focus:border-border"
          />
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-primary hover:bg-primary/90 text-foreground px-6 py-3 rounded-xl font-medium flex items-center gap-2 transition-colors ml-4"
        >
          New host <Plus size={18} />
        </button>
      </div>

      <h2 className="text-xl font-semibold text-foreground mb-4">Saved hosts</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredHosts.map((host) => (
          <div key={host.id} onClick={() => onConnect(host)} className="cursor-pointer">
            <HostCard props={host} onClose={() => {}} />
          </div>
        ))}
      </div>

      {isModalOpen && <NewHostModal onClose={() => setIsModalOpen(false)} onSaved={() => setIsModalOpen(false)} />}
    </div>
  );
};

export default HostsPage;
