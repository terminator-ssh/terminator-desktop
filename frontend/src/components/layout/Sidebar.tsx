import { Server, Key, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUIStore, ViewType } from "@/store/uiStore";
import { cn } from "@/lib/utils";
import { SyncStatus } from "../../../bindings/terminator-desktop/backend/internal/services/sync";
import { useSyncStore } from "@/store/syncStore.ts";
import { useTranslation } from "react-i18next";
import { UpdatePopover } from "@/components/layout/UpdatePopover.tsx";

export function Sidebar() {
    const {t} = useTranslation(["hosts", "update"]);
    const {activeView, setActiveView, isSidebarVisible} = useUIStore();
    const {status} = useSyncStore();

    let dotColor = "bg-muted-foreground";
    if (status === SyncStatus.SyncStatusSyncing) dotColor = "bg-info animate-pulse";
    if (status === SyncStatus.SyncStatusSuccess) dotColor = "bg-success";
    if (status === SyncStatus.SyncStatusError || status === SyncStatus.SyncStatusUnauthenticated) dotColor = "bg-destructive";

    return (
        <aside
            className={cn(
                "wails-drag flex shrink-0 flex-col items-center justify-between " +
                "border-r border-border bg-sidebar pb-4 pt-2",
                (activeView !== ViewType.Terminal || isSidebarVisible) ? "w-14" : "w-0 overflow-hidden border-r-0"
            )}
        >
            <nav className="flex flex-col gap-2">
                <Button
                    variant={activeView === ViewType.Hosts ? "secondary" : "ghost"}
                    size="icon"
                    onClick={() => setActiveView(ViewType.Hosts)}
                    className="wails-no-drag"
                    title={t("page_title", { ns: "hosts" })}
                >
                    <Server className="size-5"/>
                </Button>

                <Button
                    variant={activeView === ViewType.Keys ? "secondary" : "ghost"}
                    size="icon"
                    onClick={() => setActiveView(ViewType.Keys)}
                    className="wails-no-drag"
                    title={t("page_title", { ns: "keys" })}
                >
                    <Key className="size-5"/>
                </Button>
            </nav>

            <nav className="flex flex-col gap-2">
                <UpdatePopover/>

                <div className="relative">
                    <Button
                        variant={activeView === ViewType.Settings ? "secondary" : "ghost"}
                        size="icon"
                        onClick={() => setActiveView(ViewType.Settings)}
                        className="wails-no-drag text-muted-foreground hover:text-foreground"
                        title={t("page_title", { ns: "settings" })}
                    >
                        <Settings className="size-5"/>
                    </Button>

                    <div className={cn(
                        "absolute right-1 top-1 size-2 rounded-full border border-sidebar",
                        dotColor
                    )}/>
                </div>
            </nav>
        </aside>
    );
}