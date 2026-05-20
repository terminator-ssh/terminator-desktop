import { useState, useEffect, useRef, SyntheticEvent } from "react";
import {useTranslation} from "react-i18next";
import {FileText} from "lucide-react";
import {SavedKey, ItemType, KeyKind} from "../../../bindings/terminator-desktop/backend/internal/services/blob";
import {Dialog, DialogContent, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Textarea} from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface KeyModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (key: SavedKey) => void;
    initialData?: SavedKey | null;
    isSaving: boolean;
}

export function KeyModal({isOpen, onClose, onSave, initialData, isSaving}: KeyModalProps) {
    const {t} = useTranslation(["keys", "common"]);
    const [name, setName] = useState("");
    const [kind, setKind] = useState<KeyKind>(KeyKind.KeyKindPrivateKey);
    const [privateKey, setPrivateKey] = useState("");
    const [privateKeyPath, setPrivateKeyPath] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            setName(initialData?.name || "");
            setKind(initialData?.kind || KeyKind.KeyKindPrivateKey);
            setPrivateKey(initialData?.privateKey || "");
            setPrivateKeyPath(initialData?.privateKeyPath || "");
        }
    }, [isOpen, initialData]);

    const handleFileRead = (file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            if (e.target?.result) setPrivateKey(e.target.result as string);
        };
        reader.readAsText(file);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleSubmit = (e: SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        onSave(new SavedKey({
            id: initialData?.id || "",
            type: ItemType.TypeKey,
            name,
            kind,
            privateKey: kind === KeyKind.KeyKindHardwareKey ? "" : privateKey,
            privateKeyPath: kind === KeyKind.KeyKindHardwareKey ? privateKeyPath : "",
        }));
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{initialData ? t("edit_title") : t("new_title")}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">{t("key_name_label")}</Label>
                        <Input
                            id="name"
                            placeholder={t("key_name_placeholder")}
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label>{t("key_type_label")}</Label>
                        <Select value={kind} onValueChange={(value) => setKind(value as KeyKind)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={KeyKind.KeyKindPrivateKey}>{t("key_type_private_key")}</SelectItem>
                                <SelectItem value={KeyKind.KeyKindHardwareKey}>{t("key_type_hardware_key")}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {kind === KeyKind.KeyKindPrivateKey ? (
                        <div className="grid gap-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="privateKey">{t("private_key_label")}</Label>
                                <Button
                                    type="button"
                                    variant="secondary"
                                    size="sm"
                                    className="h-7 text-xs"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <FileText className="mr-2 size-3"/>
                                    {t("load_from_file")}
                                </Button>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    onChange={(e) =>
                                        e.target.files && handleFileRead(e.target.files[0])}
                                />
                            </div>

                            <Textarea
                                id="privateKey"
                                required
                                className="min-h-37.5 font-mono text-xs"
                                value={privateKey}
                                onChange={(e) => setPrivateKey(e.target.value)}
                                placeholder="-----BEGIN OPENSSH PRIVATE KEY-----"
                            />
                        </div>
                    ) : (
                        <div className="grid gap-2">
                            <Label htmlFor="privateKeyPath">{t("hardware_key_path_label")}</Label>
                            <Input
                                id="privateKeyPath"
                                placeholder="~/.ssh/id_ed25519_sk"
                                value={privateKeyPath}
                                onChange={(e) => setPrivateKeyPath(e.target.value)}
                            />
                            <p className="rounded-md border border-border bg-muted/40 p-3 text-sm text-muted-foreground">
                                {t("hardware_key_description")}
                            </p>
                        </div>
                    )}

                    <div className="mt-4 flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
                            {t("cancel", {ns: "common"})}
                        </Button>
                        <Button type="submit" disabled={isSaving || (kind === KeyKind.KeyKindPrivateKey && !privateKey) || (kind === KeyKind.KeyKindHardwareKey && !privateKeyPath)}>
                            {isSaving ? t("saving", {ns: "common"}) : t("save_key")}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}