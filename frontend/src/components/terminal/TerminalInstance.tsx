import { useEffect, useRef } from "react";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import { Events } from "@wailsio/runtime";
import { TERMINAL_THEME } from "@/lib/terminalTheme";
import { parseAppError } from "@/lib/error";
import { cn, decodeBase64ToUint8Array } from "@/lib/utils";
import "@xterm/xterm/css/xterm.css";
import { SSHConnectionConfig, SshService } from "../../../bindings/terminator-desktop/backend/internal/services/ssh";
import { useTranslation } from "react-i18next";
import { AppEvent } from "@/lib/events.ts";

interface TerminalInstanceProps {
    sessionId: string;
    isActive: boolean;
    config: SSHConnectionConfig;
}

export function TerminalInstance({sessionId, isActive, config}: TerminalInstanceProps) {
    const {t} = useTranslation("terminal");

    const containerRef = useRef<HTMLDivElement>(null);
    const terminalRef = useRef<Terminal | null>(null);
    const fitAddonRef = useRef<FitAddon | null>(null);
    const hasConnectedRef = useRef(false);
    const isReadyRef = useRef(false);

    const printErrorToTerminal = (error: unknown) => {
        if (!terminalRef.current) return;
        const appError = parseAppError(error);

        // TODO think of something better
        // \x1b[0m = reset formatting
        // \x1b[31m = red
        console.log(appError)
        const translated = t("error_message", { message: appError.message, error: appError.detailsString })
        terminalRef.current.write(`\r\n\x1b[31m${translated}\x1b[0m\r\n`)
    };

    useEffect(() => {
        if (!containerRef.current || terminalRef.current) return;
        const container = containerRef.current;

        const term = new Terminal(TERMINAL_THEME);
        const fitAddon = new FitAddon();

        term.loadAddon(fitAddon);
        term.open(containerRef.current);

        terminalRef.current = term;
        fitAddonRef.current = fitAddon;

        term.attachCustomKeyEventHandler((arg) => {
            if (arg.type === "keydown") {
                if (arg.ctrlKey && arg.shiftKey && arg.code === "KeyC") {
                    arg.preventDefault();
                    const selection = term.getSelection();
                    if (selection) {
                        navigator.clipboard.writeText(selection).catch(console.error);
                    }
                    return false;
                }

                if (arg.ctrlKey && arg.shiftKey && arg.code === "KeyV") {
                    arg.preventDefault();
                    navigator.clipboard.readText().then((text) => {
                        if (text && isReadyRef.current) {
                            term.paste(text);
                        }
                    }).catch(console.error);
                    return false;
                }
            }
            return true;
        });

        const handleContextMenu = (e: MouseEvent) => {
            e.preventDefault();

            const selection = term.getSelection();
            if (selection) {
                navigator.clipboard.writeText(selection).catch(console.error);
                term.clearSelection();
            } else {
                navigator.clipboard.readText().then((text) => {
                    if (text && isReadyRef.current) {
                        SshService.Input(sessionId, text).catch(printErrorToTerminal);
                    }
                }).catch(console.error);
            }
        };
        containerRef.current.addEventListener("contextmenu", handleContextMenu);

        const unsubscribeSshData = Events.On(AppEvent.SshData, (event) => {
            if (event.data.id === sessionId && terminalRef.current) {
                const rawBytes = decodeBase64ToUint8Array(event.data.data);

                terminalRef.current.write(rawBytes);
            }
        });

        const onDataDisposable = term.onData((data) => {
            if (!isReadyRef.current) return;

            SshService.Input(sessionId, data).catch((err) => {
                printErrorToTerminal(err);
            });
        });

        if (!hasConnectedRef.current) {
            hasConnectedRef.current = true;
            SshService.Connect(config)
                .then(() => {
                    isReadyRef.current = true;

                    if (terminalRef.current && fitAddonRef.current) {
                        fitAddonRef.current.fit();

                        SshService.Resize(sessionId, terminalRef.current.rows, terminalRef.current.cols)
                            .catch(console.error);
                    }
                })
                .catch((err) => {
                    printErrorToTerminal(err);
                });
        }

        return () => {
            container.removeEventListener("contextmenu", handleContextMenu);
            unsubscribeSshData();
            onDataDisposable.dispose();
            term.dispose();
            terminalRef.current = null;
            fitAddonRef.current = null;
        };
    }, [sessionId, config]);

    useEffect(() => {
        if (!containerRef.current) return;

        const resizeObserver = new ResizeObserver(() => {
            if (!isActive || !isReadyRef.current) return;

            const fit = fitAddonRef.current;
            const term = terminalRef.current;
            if (!fit || !term) return;

            try {
                fit.fit();
                term.focus();
                SshService.Resize(sessionId, term.rows, term.cols).catch((err) => {
                    printErrorToTerminal(err);
                });
            } catch (e) {
                console.warn("xterm fit failed:", e);
            }
        });

        resizeObserver.observe(containerRef.current);
        return () => resizeObserver.disconnect();
    }, [isActive, sessionId]);

    return (
        <div className={cn("h-full w-full bg-background p-2", isActive ? "block" : "hidden")}>
            <div ref={containerRef} className="h-full w-full"/>
        </div>
    );
}