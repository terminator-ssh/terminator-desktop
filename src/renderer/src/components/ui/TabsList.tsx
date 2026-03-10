import {TerminalSession} from "@/store/useStore";

interface TabsListProps {
  sessions: TerminalSession[]
  activeSessionId: string | null
  onSelect: (sessionId: string) => void
  onClose: (sessionId: string) => void
}

export const TabsList = ({sessions, activeSessionId, onSelect, onClose}: TabsListProps) => {
  return (
    <div className="flex flex-row bg-gray-800 border-b border-gray-700 overflow-x-auto">
      {sessions.map((s) => (
        <div key={s.id} onClick={() => onSelect(s.id)}
              className={`px-4 py-2 cursor-pointer border-r border-gray-700 flex items-center gap-2 min-w-[150px]
                    ${activeSessionId === s.id ? 'bg-gray-900 text-blue-400 border-b-2 border-b-blue-500' : 'text-gray-400 hover:bg-gray-700'}`}
        >

        <span className="truncate text-xs">{s.connection.name || 'Session'}  </span>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose(s.id);
          }}
          className="ml-auto hover:text-red-500">
        </button>

        </div>
      ))}
    </div>
  )
}

export default TabsList;
