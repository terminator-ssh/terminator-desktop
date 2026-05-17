import { SyntheticEvent, useState } from "react";
import { useTranslation } from "react-i18next";
import { AlertTriangle, UploadCloud } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthService } from "../../../bindings/terminator-desktop/backend/internal/services/auth";
import { SyncService } from "../../../bindings/terminator-desktop/backend/internal/services/sync";
import { handleAppError } from "@/lib/error";
import { formatServerUrl } from "@/lib/utils.ts";
import { defaultServerUrl } from "@/lib/defaultServer.ts";

interface SwitchServerModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentUrl: string;
    onSuccess: () => void;
}

export function SwitchServerModal({isOpen, onClose, currentUrl, onSuccess}: SwitchServerModalProps) {
    const {t} = useTranslation(["settings", "common"]);
    const [url, setUrl] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const isSwitching = !!currentUrl;

    const handleConnect = async (e: SyntheticEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const cleanUrl = formatServerUrl(url);

        if (currentUrl && cleanUrl === currentUrl) {
            setIsLoading(false);
            onClose();
            return;
        }

        try {
            await AuthService.RegisterOnServer(cleanUrl);
            await SyncService.StartAutoSync();
            onSuccess();
            onClose();
        } catch (error) {
            handleAppError(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{
                        isSwitching
                            ? t("switch_server_title")
                            : t("connect_cloud_title")}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleConnect} className="grid gap-4 py-4">
                    {isSwitching ? (
                        <div className="flex items-start gap-3 p-4 text-warning
                                        rounded-lg border border-warning/20 bg-warning/10">
                            <AlertTriangle className="mt-0.5 size-5 shrink-0"/>
                            <div className="text-xs">
                                {t("switch_warning", {url: currentUrl})}
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-start gap-3 p-4 text-info
                                        rounded-lg border border-info/20 bg-info/10">
                            <UploadCloud className="mt-0.5 size-5 shrink-0"/>
                            <div className="text-xs">
                                {t("connect_info")}
                            </div>
                        </div>
                    )}

                    <div className="grid gap-2">
                        <Label htmlFor="serverUrl">{t("new_server_url")}</Label>
                        <Input
                            id="serverUrl"
                            placeholder={defaultServerUrl}
                            required
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                        />
                    </div>

                    <div className="mt-4 flex justify-end gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={isLoading}
                        >
                            {t("cancel", {ns: "common"})}
                        </Button>
                        <Button
                            type="submit"
                            variant={isSwitching ? "destructive" : "default"}
                            disabled={isLoading || !url}
                        >
                            {isLoading
                                ? t("connecting", {ns: "common"})
                                : (isSwitching
                                        ? t("confirm_switch_btn")
                                        : t("register_sync_btn")
                                )
                            }
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}