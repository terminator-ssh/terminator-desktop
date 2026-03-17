import {TabType, TerminalSession} from "@/store/useStore";
import {Button} from "@/components/ui/button";

interface TabsListProps {
  sessions: TerminalSession[]
  activeSessionId: string | null
  onSelect: (sessionId: string) => void
  onClose: (sessionId: string) => void
  onAdd: (tab: TabType) => void
}

export const TabsList = ({sessions, activeSessionId, onSelect, onClose, onAdd}: TabsListProps) => {
  return (
    <div className="flex flex-row py-1 bg-secondary border-b border-border overflow-x-auto items-center">
      {sessions.map((s) => (
        <div key={s.id} onClick={() => onSelect(s.id)}
             className={`px-4 cursor-pointer border-b flex gap-1 min-w-[100px]
                    ${activeSessionId === s.id ? 'bg-background border-b border-primary' : 'text-foreground hover:bg-background'}`}
        >

        <Button
          className="ml-auto h-5 w-5 hover:text-destructive cursor-pointer"
          variant="ghost"
          size="icon-sm"
          onClick={(e) => {
            e.stopPropagation();
            onClose(s.id);
          }}
        >
          ×
        </Button>

        <span className="truncate text-xs">{s.connection.name || 'Session'}  </span>
        </div>
      ))}
      <Button
        className="ml-2 shrink-0 h-5 w-5 hover:text-success cursor-pointer"
        variant="ghost"
        size="icon-sm"
        onClick={(e) => {
          e.stopPropagation();
          onAdd('hosts')
        }}
      >
        +
      </Button>
    </div>
  )
}

export default TabsList;
