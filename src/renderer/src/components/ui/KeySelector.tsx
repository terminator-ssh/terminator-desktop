import { Plus, ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useKeys } from '@/hooks/useData';
import { KeyEditor } from './KeyEditor';

interface KeySelectorProps {
  value: string;
  onChange: (val: string) => void;
}

export const KeySelector = ({ value, onChange }: KeySelectorProps) => {
  const { data: existingKeys = [] } = useKeys();

  const matchedKey = existingKeys.find(k => k.privateKey === value);

  const [useExisting, setUseExisting] = useState(true);
  const [selectedKeyId, setSelectedKeyId] = useState<string>(matchedKey?.id || '');

  useEffect(() => {
    if (matchedKey) {
      setUseExisting(true);
      setSelectedKeyId(matchedKey.id);
    }
  }, [value]);

  const handleDropdownChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSelectedKeyId(id);
    const key = existingKeys.find(k => k.id === id);
    if (key) {
      onChange(key.privateKey);
    } else {
      onChange('');
    }
  };

  return (
    <div className="pt-2">
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs text-gray-400 font-medium ml-1">SSH Key</label>
        <button
          type="button"
          onClick={() => {
            setUseExisting(!useExisting);
            if(useExisting) setSelectedKeyId('');
          }}
          className="text-xs text-emerald-500 hover:text-emerald-400 flex items-center gap-1"
        >
          {useExisting ? <><Plus size={12} /> Create / Edit Manually</> : "Select Existing"}
        </button>
      </div>

      {useExisting ? (
        <div className="relative">
          <select
            value={selectedKeyId}
            onChange={handleDropdownChange}
            className="w-full bg-[#2b2d33] border border-gray-700 text-gray-200 text-sm rounded-lg px-4 py-3 appearance-none focus:outline-none focus:border-emerald-500"
          >
            <option value="">-- Select a Key --</option>
            {existingKeys.map(k => (
              <option key={k.id} value={k.id}>{k.name}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-4 top-3.5 text-gray-500 pointer-events-none" size={16} />
        </div>
      ) : (
        <div className="border border-emerald-500/30 bg-emerald-500/5 rounded-xl p-4">
          <div className="text-xs text-emerald-400 font-medium mb-3">Manual Key Entry</div>
          <KeyEditor value={value} onChange={onChange} />
        </div>
      )}
    </div>
  );
};
