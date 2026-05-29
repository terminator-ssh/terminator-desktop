import { useState, useEffect, SyntheticEvent } from "react";
import {useTranslation} from "react-i18next";
import {Host, ItemType} from "../../../bindings/terminator-desktop/backend/internal/services/blob";
import {Dialog, DialogContent, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {useKeys} from "@/hooks/useKeys";

interface HostModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (host: Host) => void;
    initialData?: Host | null;
    isSaving: boolean;
}

const DEFAULT_HOST: Partial<Host> = {
    name: "",
    host: "",
    port: 22,
    username: "root",
    password: "",
    keyId: undefined,
};

export function HostModal({isOpen, onClose, onSave, initialData, isSaving}: HostModalProps) {
    const {t} = useTranslation(["hosts", "common"]);
    const [formData, setFormData] = useState<Partial<Host>>(DEFAULT_HOST);
    const {data: keys} = useKeys();

    useEffect(() => {
        if (isOpen) {
            setFormData(initialData || DEFAULT_HOST);
        }
    }, [isOpen, initialData]);

    const handleSubmit = (e: SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();

        const finalHost = new Host({
            ...formData,
            id: formData.id || "",
            type: ItemType.TypeHost,
            port: Number(formData.port) || 22,
            keyId: formData.keyId === "none" ? undefined : formData.keyId,
        });

        onSave(finalHost);
    };

    const isEditing = !!initialData;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{isEditing ? t("edit_title") : t("new_title")}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">{t("label_optional", { ns: "common" })}</Label>
                        <Input
                            id="name"
                            placeholder={t("label_placeholder")}
                            value={formData.name || ""}
                            onChange={(e) =>
                                setFormData({...formData, name: e.target.value})}
                        />
                    </div>

                    <div className="grid grid-cols-4 gap-4">
                        <div className="col-span-3 grid gap-2">
                            <Label htmlFor="host">{t("host_ip", {ns: "common"})}</Label>
                            <Input
                                id="host"
                                placeholder={t("host_placeholder")}
                                required
                                value={formData.host || ""}
                                onChange={(e) =>
                                    setFormData({...formData, host: e.target.value})}
                            />
                        </div>
                        <div className="col-span-1 grid gap-2">
                            <Label htmlFor="port">{t("port", {ns: "common"})}</Label>
                            <Input
                                id="port"
                                type="number"
                                required
                                value={formData.port === undefined ? "" : formData.port}
                                onChange={(e) => {
                                    const val = parseInt(e.target.value);
                                    setFormData({...formData, port: isNaN(val) ? undefined : val});
                                }}
                            />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="username">{t("username", {ns: "common"})}</Label>
                        <Input
                            id="username"
                            required
                            value={formData.username || ""}
                            onChange={(e) =>
                                setFormData({...formData, username: e.target.value})}
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password">{t("password_optional")}</Label>
                        <Input
                            id="password"
                            type="password"
                            placeholder={t("password_placeholder")}
                            value={formData.password || ""}
                            onChange={(e) =>
                                setFormData({...formData, password: e.target.value})}
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label>{t("ssh_key_label")}</Label>
                        <Select
                            value={formData.keyId || "none"}
                            onValueChange={(val) =>
                                setFormData({...formData, keyId: val === "none" ? undefined : val})}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder={t("select_key_placeholder")}/>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">{t("none_use_password")}</SelectItem>
                                {keys?.map((key) => (
                                    <SelectItem key={key.id} value={key.id}>
                                        {key.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="mt-4 flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
                            {t("cancel", {ns: "common"})}
                        </Button>
                        <Button type="submit" disabled={isSaving}>
                            {isSaving ? t("saving", {ns: "common"}) : t("save_host")}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}