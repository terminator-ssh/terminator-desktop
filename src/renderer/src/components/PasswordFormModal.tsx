import {
  ArrowBigRight
} from 'lucide-react';
import { useState } from 'react';

const PasswordFormModal = () => {
    const [isVisible, setVisibility] = useState(true)

  return (
    isVisible &&
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-[#23242a] w-150 rounded-2xl p-6 shadow-2xl border border-gray-800 relative">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-white mx-auto">Enter password</h2>
        </div>

        {/* Form */}
        <form className="space-y-4">
          {/* Name */}
          <div className="space-y-1">
            <label className="text-xs text-gray-400 font-medium ml-1">Your password</label>
            <input
              type="password"
              placeholder="Password"
              className="w-full bg-[#2b2d33] border border-gray-700 text-gray-200 text-sm rounded-lg px-4 py-3 focus:outline-none focus:border-emerald-500"
            />
          </div>
          <hr />
          {/* login Button */}
          <button onClick={() => setVisibility(false)} type="button" className="w-full bg-[#10b981] hover:bg-[#059669] text-white font-medium py-3 rounded-xl mt-4 transition-colors flex justify-center items-center gap-2">
            Log in <ArrowBigRight/>
          </button>
        </form>
      </div>
    </div>
  );
};
export default PasswordFormModal
