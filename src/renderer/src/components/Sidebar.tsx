import {
  Cable,
  Cloud, Key, Terminal, User
} from 'lucide-react';
import { useState } from 'react';
import SwitchServerModal from './SwitchServerModal';
import { TabType } from '@/store/useStore';

const Sidebar = ({ activeTab, setActiveTab }: { activeTab: TabType, setActiveTab: (t: TabType) => void }) => {

  const [isServermodalVisible, setServerModalVisible] = useState(false)

  const menuItems: { id: TabType, icon: any, label: string }[] = [
    { id: 'hosts', icon: <Cloud size={20} />, label: 'Hosts' },
    { id: 'keys', icon: <Key size={20} />, label: 'Keys' },
    { id: 'terminal', icon: <Terminal size={20} />, label: 'Terminal' },
  ];

  return (
    <div className="w-64 bg-[#1e1f24] h-screen flex flex-col p-4 border-r border-gray-800">
      {isServermodalVisible && <SwitchServerModal onClose={() => setServerModalVisible(false)}/>}
      <div className="bg-[#2b2d33] rounded-xl p-3 mb-8 flex items-center gap-3">
        <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
          <User size={16} className="text-gray-300" />
        </div>
        <div className="text-sm font-medium text-gray-200">User Meme</div>
      </div>

      <nav className="flex flex-col gap-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors ${
              activeTab === item.id
                ? 'bg-[#e4e4e7] text-black font-medium'
                : 'text-gray-400 hover:text-gray-200 hover:bg-[#2b2d33]'
            }`}
          >
            {item.icon}
            {item.label}
          </button>
        ))}

        <button
          key={"switchServer"}
          onClick={() => setServerModalVisible(true)}
          className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors text-gray-400 hover:text-gray-200 hover:bg-[#2b2d33] `}
        >
          <Cable size={20} />
          Switch Server
        </button>

      </nav>
    </div>
  );
};

export default Sidebar;
