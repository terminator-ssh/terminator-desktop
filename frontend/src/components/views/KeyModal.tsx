import { useState, useEffect, useRef, SyntheticEvent } from "react";
import {useTranslation} from "react-i18next";
import {FileText} from "lucide-react";
import {SavedKey, ItemType} from "../../../bindings/terminator-desktop/backend/internal/services/blob";
import {Dialog, DialogContent, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Textarea} from "@/components/ui/textarea";

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
    const [privateKey, setPrivateKey] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            setName(initialData?.name || "");
            setPrivateKey(initialData?.privateKey || "");
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
            privateKey,
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

                    <div className="mt-4 flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
                            {t("cancel", {ns: "common"})}
                        </Button>
                        <Button type="submit" disabled={isSaving || !privateKey}>
                            {isSaving ? t("saving", {ns: "common"}) : t("save_key")}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}