import { useState, useEffect } from "react";
import { Minus, Square, Copy, X } from "lucide-react";
import { Window } from "@wailsio/runtime";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const windowControlStyles = cva(
    "wails-no-drag inline-flex h-full w-12 items-center justify-center transition-colors",
    {
        variants: {
            intent: {
                default: "text-muted-foreground hover:bg-muted hover:text-foreground",
                close: "text-muted-foreground hover:bg-destructive hover:text-destructive-foreground",
            }
        },
        defaultVariants: {intent: "default"}
    }
);

export function WindowControls() {
    const [isMaximised, setIsMaximised] = useState(false);

    useEffect(() => {
        Window.IsMaximised().then(setIsMaximised);

        const handleResize = () => {
            Window.IsMaximised().then(setIsMaximised);
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const handleToggleMaximise = async () => {
        if (isMaximised) {
            await Window.Restore();
        } else {
            await Window.Maximise();
        }
        setIsMaximised(!isMaximised);
    };

    return (
        <div className="wails-no-drag flex h-full items-center">
            <button
                type="button"
                tabIndex={-1}
                onClick={() => Window.Minimise()}
                className={cn(windowControlStyles())}
            >
                <Minus className="size-4"/>
            </button>

            <button
                type="button"
                tabIndex={-1}
                onClick={handleToggleMaximise}
                className={cn(windowControlStyles())}
            >
                {isMaximised ? <Copy className="size-3.5"/> : <Square className="size-3.5"/>}
            </button>

            <button
                type="button"
                tabIndex={-1}
                onClick={() => Window.Close()}
                className={cn(windowControlStyles({intent: "close"}))}
            >
                <X className="size-4"/>
            </button>
        </div>
    );
}