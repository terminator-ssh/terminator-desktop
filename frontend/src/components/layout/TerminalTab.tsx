import { X } from "lucide-react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { TerminalSession } from "@/store/sessionStore";

const tabStyles = cva(
    "wails-no-drag group my-1 flex h-8 min-w-30 max-w-50 cursor-pointer items-center " +
    "justify-between rounded-md border px-3 text-xs font-medium transition-colors",
    {
        variants: {
            state: {
                active: "border-border bg-card text-foreground",
                inactive: "border-transparent bg-background text-muted-foreground hover:bg-muted/50 hover:text-foreground",
            },
        },
        defaultVariants: {
            state: "inactive",
        },
    }
);

const closeButtonStyles = cva(
    "ml-2 flex size-5 items-center justify-center rounded-sm transition-all hover:bg-muted",
    {
        variants: {
            state: {
                active: "opacity-100",
                inactive: "opacity-0 group-hover:opacity-100",
            },
        },
        defaultVariants: {
            state: "inactive",
        },
    }
);

interface TerminalTabProps {
    session: TerminalSession;
    isActive: boolean;
    onClick: () => void;
    onClose: () => void;
}

export function TerminalTab({session, isActive, onClick, onClose}: TerminalTabProps) {
    const state = isActive ? "active" : "inactive";

    return (
        <div onClick={onClick} className={cn(tabStyles({state}))}>
            <span className="truncate">{session.title}</span>
            <button
                type="button"
                onClick={(e) => {
                    e.stopPropagation();
                    onClose();
                }}
                className={cn(closeButtonStyles({state}))}
            >
                <X className="size-3"/>
            </button>
        </div>
    );
}