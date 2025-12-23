import { Plus, X } from 'lucide-react';
import { useState } from 'react';
import { Host, IPC } from '../../../shared/types';

const EditHostModal = ({ host, onClose, onSaved }: { host: Host, onClose: () => void, onSaved: () => void }) => {
  const [formData, setFormData] = useState<Host>(host);

  const handleChange = (e: any, field: string) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  const handleSave = async () => {
    await window.electron.ipcRenderer.invoke(IPC.HOSTS.SAVE, formData);
    onSaved();
    onClose();
  };

  return (
    <div onClick={(e) => e.stopPropagation()} className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-[#23242a] w-150 rounded-2xl p-6 shadow-2xl border border-gray-800 relative">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-white mx-auto">Edit Host</h2>
          <button onClick={onClose} className="absolute right-6 text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <form className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs text-gray-400 font-medium ml-1">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange(e, 'name')}
              className="w-full bg-[#2b2d33] border border-gray-700 text-gray-200 text-sm rounded-lg px-4 py-3 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2 space-y-1">
              <label className="text-xs text-gray-400 font-medium ml-1">Host</label>
              <input
                type="text"
                value={formData.host}
                onChange={(e) => handleChange(e, 'host')}
                className="w-full bg-[#2b2d33] border border-gray-700 text-gray-200 text-sm rounded-lg px-4 py-3 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-gray-400 font-medium ml-1">Port</label>
              <input
                type="number"
                value={formData.port}
                onChange={(e) => handleChange(e, 'port')}
                className="w-full bg-[#2b2d33] border border-gray-700 text-gray-200 text-sm rounded-lg px-4 py-3 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-gray-400 font-medium ml-1">Username</label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => handleChange(e, 'username')}
              className="w-full bg-[#2b2d33] border border-gray-700 text-gray-200 text-sm rounded-lg px-4 py-3 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <button type="button" onClick={handleSave} className="w-full bg-[#10b981] hover:bg-[#059669] text-white font-medium py-3 rounded-xl mt-4 transition-colors flex justify-center items-center gap-2">
            Save Changes <Plus size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};
export default EditHostModal;
