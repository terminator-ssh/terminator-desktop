import { ArrowDownToLine } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { UpdaterService } from "../../../bindings/terminator-desktop/backend/internal/services/updater";
import { useUIStore } from "@/store/uiStore";
import { handleAppError } from "@/lib/error";

export function UpdatePopover() {
    const {t} = useTranslation("update");
    const {updateVersionReady} = useUIStore();

    if (!updateVersionReady) return null;

    const handleRestartUpdate = async () => {
        try {
            await UpdaterService.ApplyAndRestart();
        } catch (error) {
            handleAppError(error);
        }
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <div className="relative">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="wails-no-drag text-success hover:text-success/80 group"
                        title={t("update_ready")}
                    >
                        {/*<ArrowDownToLine className="size-5 group-hover:animate-bounce"/>*/}
                        <ArrowDownToLine className="size-5 animate-bounce"/>
                    </Button>
                </div>
            </PopoverTrigger>

            <PopoverContent side="right" align="end" className="z-50 w-56 p-4">
                <div className="flex flex-col gap-3">
                    <div className="flex flex-col">
                        <span className="font-semibold">{t("update_ready")}</span>
                        <span className="text-xs text-muted-foreground">
                            {t("update_to", {version: updateVersionReady})}
                        </span>
                    </div>
                    <Button size="sm" onClick={handleRestartUpdate} className="w-full">
                        {t("restart_update")}
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    );
}