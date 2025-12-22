import {
  Plus,  X, FileText
} from 'lucide-react';
import { useState } from 'react';

const EditHostModal = ({ props, onClose }: { props: any, onClose: () => void }) => {


  return ( 
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-[#23242a] w-150 rounded-2xl p-6 shadow-2xl border border-gray-800 relative">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-white mx-auto">New Host</h2>
          <button onClick={onClose} className="absolute right-6 text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form className="space-y-4">
          {/* Name or label */}
          <div className="space-y-1">
            <label className="text-xs text-gray-400 font-medium ml-1">Name</label>
            <input
              type="text"
              defaultValue={props.name}
              className="w-full bg-[#2b2d33] border border-gray-700 text-gray-200 text-sm rounded-lg px-4 py-3 focus:outline-none focus:border-emerald-500"
              required
            />
          </div>

          {/* Host */}
          <div className="space-y-1">
            <label className="text-xs text-gray-400 font-medium ml-1">Host</label>
            <input
              type="text"
              defaultValue={props.host}
              className="w-full bg-[#2b2d33] border border-gray-700 text-gray-200 text-sm rounded-lg px-4 py-3 focus:outline-none focus:border-emerald-500"
              required
            />
          </div>

         {/* Port */}
          <div className="space-y-1">
            <label className="text-xs text-gray-400 font-medium ml-1">Port</label>
            <input
              type="text"
              defaultValue={props.port}
              className="w-full bg-[#2b2d33] border border-gray-700 text-gray-200 text-sm rounded-lg px-4 py-3 focus:outline-none focus:border-emerald-500"
            />
          </div>
            {/* Username */}
          <div className="space-y-1">
            <label className="text-xs text-gray-400 font-medium ml-1">Username</label>
            <input
              type="text"
              defaultValue={props.username} 
              className="w-full bg-[#2b2d33] border border-gray-700 text-gray-200 text-sm rounded-lg px-4 py-3 focus:outline-none focus:border-emerald-500"
            />{/* Можно вставлять имя текущего юзера? */}
          </div>

          {/* Зфыыцщкв */}
          <div className="space-y-1">
            <label className="text-xs text-gray-400 font-medium ml-1">Password</label>
            <input
              type="password"
              placeholder="********" 
              className="w-full bg-[#2b2d33] border border-gray-700 text-gray-200 text-sm rounded-lg px-4 py-3 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Keys Row */}
          <div className="flex gap-4">
            <div className="flex-1 space-y-1">
              <label className="text-xs text-gray-400 font-medium ml-1">Private key</label>
              <textarea
                placeholder="Private key"
                className="w-full h-24 bg-[#2b2d33] border border-gray-700 text-gray-200 text-sm rounded-lg px-4 py-3 resize-none focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* File Upload */}
          <div className="space-y-1 pt-2">
             <label className="text-xs text-gray-400 font-medium ml-1">Move a private key file to import</label>
             <div className="border-2 border-dashed border-gray-700 rounded-lg p-3 flex items-center justify-between cursor-pointer hover:border-gray-500 transition-colors">
                <span className="text-sm text-gray-500 ml-2">Choose file</span>
                <FileText size={18} className="text-gray-500 mr-2" />
             </div>
          </div>

          {/* Save Button */}
          <button type="button" className="w-full bg-[#10b981] hover:bg-[#059669] text-white font-medium py-3 rounded-xl mt-4 transition-colors flex justify-center items-center gap-2">
            Save <Plus size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};
export default EditHostModal
