import { useState } from 'react';
import { Search, Plus } from 'lucide-react';
import NewKeyModal from '../NewKeyModal';
import KeyCard from '../ui/KeyCard';
import { useKeys } from '@/hooks/useData';
import { Button } from '@/components/ui/button';

const KeysPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const { data: keys = [] } = useKeys();

  const filteredKeys = keys.filter(k =>
    k.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 w-full">
      <h1 className="text-3xl font-bold text-foreground mb-2">
        Terminator <span className="text-muted-foreground/70 text-lg font-normal">| Keys</span>
      </h1>

      <div className="flex justify-between items-center mb-8 mt-6">
        <div className="relative w-full max-w-2xl">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground/70" size={18} />
          <input
            type="text"
            placeholder="Find a key..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-card text-foreground/80 pl-12 pr-4 py-3 rounded-xl focus:outline-none border border-transparent focus:border-border"
          />
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="ml-4" size="lg">
          New key <Plus size={18} />
        </Button>
      </div>

      <h2 className="text-xl font-semibold text-foreground mb-4">Saved keys</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredKeys.map((key) => (
          <KeyCard key={key.id} props={key} onClose={() => {}} />
        ))}
      </div>

      {isModalOpen && <NewKeyModal onClose={() => setIsModalOpen(false)} onSaved={() => setIsModalOpen(false)} />}
    </div>
  );
};

export default KeysPage;
