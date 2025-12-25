import { Cloud, Key, Terminal } from 'lucide-react';
import { TabType } from '@/store/useStore';
import UserMenu from './UserMenu';

const Sidebar = ({ activeTab, setActiveTab }:
                 { activeTab: TabType, setActiveTab: (t: TabType) => void }) => {

  const menuItems: { id: TabType, icon: any, label: string }[] = [
    { id: 'hosts', icon: <Cloud size={20} />, label: 'Hosts' },
    { id: 'keys', icon: <Key size={20} />, label: 'Keys' },
    { id: 'terminal', icon: <Terminal size={20} />, label: 'Terminal' },
  ];

  return (
    <div className="w-64 bg-[#1e1f24] h-screen flex flex-col p-4 border-r border-gray-800">

      <div className="mb-8">
        <UserMenu />
      </div>

      <nav className="flex flex-col gap-2 flex-1">
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
      </nav>
    </div>
  );
};

export default Sidebar;
