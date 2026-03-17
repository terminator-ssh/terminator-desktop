import {TerminalSession} from "@/store/useStore";
import {Button} from "@/components/ui/button";
import Plus from "lucide-react"
import {Host} from "../../../../shared/types";

interface TabsListProps {
  sessions: TerminalSession[]
  activeSessionId: string | null
  onSelect: (sessionId: string) => void
  onClose: (sessionId: string) => void
}

export const TabsList = ({sessions, activeSessionId, onSelect, onClose, onAdd}: TabsListProps) => {
  return (
    <div className="flex flex-row bg-secondary border-b border-border overflow-x-auto">
      {sessions.map((s) => (
        <div key={s.id} onClick={() => onSelect(s.id)}
             className={`px-4 py-1 cursor-pointer border-b flex items-center gap-2 min-w-[150px]
                    ${activeSessionId === s.id ? 'bg-background border-b border-primary' : 'text-foreground hover:bg-background'}`}
        >

        <span className="truncate text-xs">{s.connection.name || 'Session'}  </span>

        <Button
          className="ml-auto h-5.5 w-5.5 hover:text-destructive cursor-pointer"
          variant="ghost"
          size="icon-sm"
          onClick={(e) => {
            e.stopPropagation();
            onClose(s.id);
          }}
          >
        </Button>
        </div>
      ))}
    </div>
  )
}

export default TabsList;
