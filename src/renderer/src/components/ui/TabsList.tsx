import {TerminalSession} from "@/store/useStore";

interface TabsListProps {
  sessions: TerminalSession[]
  activeSessionId: string | null
  onSelect: (sessionId: string) => void
  onClose: (sessionId: string) => void
}

export const TabsList = ({sessions, activeSessionId, onSelect, onClose}: TabsListProps) => {
  return (
    <div className="flex flex-row bg-secondary border-b border-border overflow-x-auto">
      {sessions.map((s) => (
        <div key={s.id} onClick={() => onSelect(s.id)}
             className={`px-4 py-1 cursor-pointer border-b flex items-center gap-2 min-w-[150px]
                    ${activeSessionId === s.id ? 'bg-background border-b border-primary' : 'text-foreground hover:bg-background'}`}
        >

        <span className="truncate text-xs">{s.connection.name || 'Session'}  </span>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose(s.id);
          }}
          className="ml-auto hover:text-destructive cursor-pointer">
          ×
        </button>

        </div>
      ))}
    </div>
  )
}

export default TabsList;
