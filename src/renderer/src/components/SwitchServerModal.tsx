import {
  Plus,  X, FileText,
  ArrowBigRight
} from 'lucide-react';

const SwitchServerModal = ({ onClose }: { onClose: () => void }) => {
    const onClick = () => {}
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-[#23242a] w-150 rounded-2xl p-6 shadow-2xl border border-gray-800 relative">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-white mx-auto">Switch Server</h2>
          <button onClick={onClose} className="absolute right-6 text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form className="space-y-4">
          {/* Address */}
          <div className="space-y-1">
            <label className="text-xs text-gray-400 font-medium ml-1">Address of your server</label>
            <input
              type="text"
              placeholder="Name"
              className="w-full bg-[#2b2d33] border border-gray-700 text-gray-200 text-sm rounded-lg px-4 py-3 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Password. Ремувни если не нужен */}
          <div className="flex gap-4">
            <div className="flex-1 space-y-1">
              <label className="text-xs text-gray-400 font-medium ml-1">Address</label>
            <input
              type="password"
              placeholder="0.0.0.0"
              className="w-full bg-[#2b2d33] border border-gray-700 text-gray-200 text-sm rounded-lg px-4 py-3 focus:outline-none focus:border-emerald-500"
            />
            </div>
          </div>
          <hr />

          {/* Save Button */}
          <button type="button" onClick={onClick} className="w-full bg-[#10b981] hover:bg-[#059669] text-white font-medium py-3 rounded-xl mt-4 transition-colors flex justify-center items-center gap-2">
            Connect <ArrowBigRight />
          </button>
        </form>
      </div>
    </div>
  );
};
export default SwitchServerModal
