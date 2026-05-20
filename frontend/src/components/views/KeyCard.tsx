import { Key, MoreHorizontal, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SavedKey, KeyKind } from "../../../bindings/terminator-desktop/backend/internal/services/blob";
import { useTranslation } from "react-i18next";

interface KeyCardProps {
    savedKey: SavedKey;
    onEdit: (key: SavedKey) => void;
    onDelete: (key: SavedKey) => void;
}

export function KeyCard({savedKey, onEdit, onDelete}: KeyCardProps) {
    const {t} = useTranslation();
    return (
        <div
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === "Enter" && e.target === e.currentTarget) {
                    e.preventDefault();
                    onEdit(savedKey);
                }
            }}
            className="group flex flex-row justify-between bg-card shadow-sm transition-all
                       rounded-xl border border-border
                       hover:border-primary/40 hover:shadow-md
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
            <div
                onClick={() => onEdit(savedKey)}
                className="flex min-w-0 flex-1 cursor-pointer items-center gap-4 p-5"
            >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg
                                bg-primary/10 text-primary">
                    <Key className="size-5" />
                </div>
                <div className="flex min-w-0 flex-col pr-4">
                    <h3 className="truncate font-semibold text-card-foreground">
                        {savedKey.name}
                    </h3>
                    <p className="truncate text-xs text-muted-foreground">
                        {savedKey.kind === KeyKind.KeyKindHardwareKey ? t("key_type_hardware_key", {ns: "keys"}) : t("ssh_private_key", {ns: "keys"})}
                    </p>
                </div>
            </div>

            <div className="flex shrink-0 items-center pr-4">
                <DropdownMenu modal={false}>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon-sm"
                            className="opacity-0 transition-opacity group-hover:opacity-100
                                       data-[state=open]:opacity-100
                                       focus-visible:opacity-100"
                        >
                            <MoreHorizontal className="size-4 text-muted-foreground"/>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40 z-50">
                        <DropdownMenuItem onClick={() => onEdit(savedKey)}>
                            <Edit className="mr-2 size-4"/>
                            {t("edit")}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator/>
                        <DropdownMenuItem
                            onClick={() => onDelete(savedKey)}
                            className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                        >
                            <Trash2 className="mr-2 size-4"/>
                            {t("delete")}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
}