import { Plus, X, FileText } from 'lucide-react';
import { useState, useRef } from 'react';
import { IPC, Host } from '../../../shared/types';

const NewHostModal = ({ onClose, onSaved }: { onClose: () => void, onSaved: () => void }) => {
  const [formData, setFormData] = useState<Partial<Host>>({ port: 22 });
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: any, field: string) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  const handleSave = async () => {
    if (!formData.name || !formData.host || !formData.username) return;
    await window.electron.ipcRenderer.invoke(IPC.HOSTS.SAVE, formData);
    onSaved();
  };

  // --- File Drag & Drop Logic ---
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files[0]);
    }
  };

  const handleFiles = (file: File) => {
    // In Electron, File object has a 'path' property
    const path = (file as any).path;
    setFormData({ ...formData, privateKey: path }); // Store path, or read content if needed
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-[#23242a] w-150 rounded-2xl p-6 shadow-2xl border border-gray-800 relative">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-white mx-auto">New Host</h2>
          <button onClick={onClose} className="absolute right-6 text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <form className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs text-gray-400 font-medium ml-1">Name</label>
            <input
              type="text"
              placeholder="My Server"
              onChange={(e) => handleChange(e, 'name')}
              className="w-full bg-[#2b2d33] border border-gray-700 text-gray-200 text-sm rounded-lg px-4 py-3 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-gray-400 font-medium ml-1">Host</label>
            <input
              type="text"
              placeholder="192.168.1.1"
              onChange={(e) => handleChange(e, 'host')}
              className="w-full bg-[#2b2d33] border border-gray-700 text-gray-200 text-sm rounded-lg px-4 py-3 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-gray-400 font-medium ml-1">Port</label>
            <input
              type="number"
              defaultValue={22}
              onChange={(e) => handleChange(e, 'port')}
              className="w-full bg-[#2b2d33] border border-gray-700 text-gray-200 text-sm rounded-lg px-4 py-3 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-gray-400 font-medium ml-1">Username</label>
            <input
              type="text"
              placeholder="root"
              onChange={(e) => handleChange(e, 'username')}
              className="w-full bg-[#2b2d33] border border-gray-700 text-gray-200 text-sm rounded-lg px-4 py-3 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-gray-400 font-medium ml-1">Password</label>
            <input
              type="password"
              placeholder="********"
              onChange={(e) => handleChange(e, 'password')}
              className="w-full bg-[#2b2d33] border border-gray-700 text-gray-200 text-sm rounded-lg px-4 py-3 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Keys Row */}
          <div className="flex gap-4">
            <div className="flex-1 space-y-1">
              <label className="text-xs text-gray-400 font-medium ml-1">Private key path</label>
              <textarea
                placeholder="Paste key or drop file below..."
                value={formData.privateKey || ''}
                onChange={(e) => handleChange(e, 'privateKey')}
                className="w-full h-24 bg-[#2b2d33] border border-gray-700 text-gray-200 text-sm rounded-lg px-4 py-3 resize-none focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* File Upload / Drag Drop */}
          <div className="space-y-1 pt-2">
            <label className="text-xs text-gray-400 font-medium ml-1">Import private key file</label>
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-lg p-3 flex items-center justify-between cursor-pointer transition-colors ${dragActive ? 'border-emerald-500 bg-[#2b2d33]' : 'border-gray-700 hover:border-gray-500'}`}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={(e) => e.target.files && handleFiles(e.target.files[0])}
              />
              <span className="text-sm text-gray-500 ml-2">
                    {formData.privateKey ? "File selected (Click to change)" : "Choose file or Drag & Drop"}
                </span>
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
export default NewHostModal;
