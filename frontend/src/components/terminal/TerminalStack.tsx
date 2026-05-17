import { useSessionStore } from "@/store/sessionStore";
import { TerminalInstance } from "@/components/terminal/TerminalInstance";
import { cn } from "@/lib/utils";

interface TerminalStackProps {
    isVisible: boolean;
}

export function TerminalStack({isVisible}: TerminalStackProps) {
    const {sessions, activeSessionId} = useSessionStore();

    return (
        <div className={cn("absolute inset-0", isVisible ? "block" : "hidden")}>
            {sessions.map((session) => (
                <TerminalInstance
                    key={session.id}
                    sessionId={session.id}
                    config={session.config}
                    isActive={session.id === activeSessionId}
                />
            ))}
        </div>
    );
}