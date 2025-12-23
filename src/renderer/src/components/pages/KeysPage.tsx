import { useState, useEffect } from 'react';
import { Search, Plus } from 'lucide-react';
import NewKeyModal from '../NewKeyModal';
import KeyCard from '../ui/KeyCard';
import { SavedKey, IPC } from '../../../../shared/types';

const KeysPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [keys, setKeys] = useState<SavedKey[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const refreshKeys = async () => {
    try {
      const data = await window.electron.ipcRenderer.invoke(IPC.KEYS.GET);
      setKeys(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    refreshKeys();
  }, []);

  const handleSave = async () => {
    setIsModalOpen(false);
    await refreshKeys();
  };

  const filteredKeys = keys.filter(k =>
    k.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 w-full">
      <h1 className="text-3xl font-bold text-gray-200 mb-2">Terminator <span className="text-gray-500 text-lg font-normal">| Keys</span></h1>

      <div className="flex justify-between items-center mb-8 mt-6">
        <div className="relative w-full max-w-2xl">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
          <input
            type="text"
            placeholder="Find a key..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
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

      <h2 className="text-xl font-semibold text-gray-200 mb-4">Saved keys</h2>

      <div className="flex flex-col gap-3">
        {filteredKeys.map((key) => (
          <KeyCard key={key.id} props={key} onClose={() => {}} />
        ))}
      </div>

      {isModalOpen && <NewKeyModal onClose={() => setIsModalOpen(false)} onSaved={handleSave} />}
    </div>
  );
};

export default KeysPage;
