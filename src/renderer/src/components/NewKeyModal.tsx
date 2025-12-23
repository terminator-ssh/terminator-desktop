import { Plus, X, FileText } from 'lucide-react';
import { useState, useRef } from 'react';
import { IPC, SavedKey } from '../../../shared/types';

// Add onSaved prop
const NewKeyModal = ({ onClose, onSaved }: { onClose: () => void, onSaved: () => void }) => {
  const [formData, setFormData] = useState<Partial<SavedKey>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = async () => {
    if (!formData.name || !formData.privateKey) return;
    await window.electron.ipcRenderer.invoke(IPC.KEYS.SAVE, formData);
    onSaved();
  };

  const handleFiles = (file: File) => {
    // In Electron, File has 'path'. We can save the path, or read it.
    // For keys, we usually want the content.
    const reader = new FileReader();
    reader.onload = (e) => {
      if(e.target?.result) {
        setFormData({...formData, privateKey: e.target.result as string});
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-[#23242a] w-150 rounded-2xl p-6 shadow-2xl border border-gray-800 relative">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-white mx-auto">New key</h2>
          <button onClick={onClose} className="absolute right-6 text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <form className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs text-gray-400 font-medium ml-1">Name</label>
            <input
              type="text"
              placeholder="My Key"
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full bg-[#2b2d33] border border-gray-700 text-gray-200 text-sm rounded-lg px-4 py-3 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1 space-y-1">
              <label className="text-xs text-gray-400 font-medium ml-1">Private key content</label>
              <textarea
                placeholder="Paste key content..."
                value={formData.privateKey || ''}
                onChange={(e) => setFormData({...formData, privateKey: e.target.value})}
                className="w-full h-24 bg-[#2b2d33] border border-gray-700 text-gray-200 text-sm rounded-lg px-4 py-3 resize-none focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="space-y-1 pt-2">
            <label className="text-xs text-gray-400 font-medium ml-1">Import key file</label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-700 rounded-lg p-3 flex items-center justify-between cursor-pointer hover:border-gray-500 transition-colors">
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={(e) => e.target.files && handleFiles(e.target.files[0])}
              />
              <span className="text-sm text-gray-500 ml-2">Choose file</span>
              <FileText size={18} className="text-gray-500 mr-2" />
            </div>
          </div>

          <button type="button" onClick={handleSave} className="w-full bg-[#10b981] hover:bg-[#059669] text-white font-medium py-3 rounded-xl mt-4 transition-colors flex justify-center items-center gap-2">
            Save <Plus size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};
export default NewKeyModal;
