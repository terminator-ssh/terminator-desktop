import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { KeyCard } from "@/components/views/KeyCard";
import { KeyModal } from "@/components/views/KeyModal";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { useKeys, useSaveKey, useDeleteKey } from "@/hooks/useKeys";
import { SavedKey } from "../../../bindings/terminator-desktop/backend/internal/services/blob";

export function KeysPage() {
    const {t} = useTranslation(["keys", "common"]);
    const {data: keys, isLoading} = useKeys();
    const saveMutation = useSaveKey();
    const deleteMutation = useDeleteKey();

    const [searchQuery, setSearchQuery] = useState("");
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingKey, setEditingKey] = useState<SavedKey | null>(null);
    const [keyToDelete, setKeyToDelete] = useState<SavedKey | null>(null);

    const handleCreateNew = () => {
        setEditingKey(null);
        setIsEditModalOpen(true);
    };

    const handleEdit = (key: SavedKey) => {
        setEditingKey(key);
        setIsEditModalOpen(true);
    };

    const handleDeletePrompt = (key: SavedKey) => {
        setKeyToDelete(key);
    };

    const handleConfirmDelete = () => {
        if (keyToDelete) deleteMutation.mutate(keyToDelete.id);
        setKeyToDelete(null);
    };

    const handleSave = (key: SavedKey) => {
        saveMutation.mutate(key, {onSuccess: () => setIsEditModalOpen(false)});
    };

    const filteredKeys = useMemo(() => {
        const query = searchQuery.toLowerCase();
        return keys?.filter((k) => k.name.toLowerCase().includes(query));
    }, [keys, searchQuery]);

    return (
        <div className="flex h-full w-full flex-col overflow-y-auto p-8">

            <div className="mb-8 flex w-full items-center gap-4">
                <h1 className="shrink-0 text-2xl font-bold tracking-tight text-foreground">
                    {t("page_title")}
                </h1>
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"/>
                    <Input
                        placeholder={t("search_keys")}
                        className="w-full border-border bg-input/50 pl-9"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <Button onClick={handleCreateNew} className="shrink-0">
                    <Plus/>
                    {t("new_key")}
                </Button>
            </div>

            {isLoading && <div className="text-sm text-muted-foreground">{t("loading_keys")}</div>}

            {!isLoading && keys?.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-center
                                border border-dashed border-border rounded-xl">
                    <h3 className="text-lg font-semibold text-foreground">{t("empty_title")}</h3>
                    <p className="mb-4 mt-2 text-sm text-muted-foreground">{t("empty_desc")}</p>
                    <Button variant="outline" onClick={handleCreateNew}>{t("import_key")}</Button>
                </div>
            )}

            <div
                className="grid w-full gap-4"
                style={{gridTemplateColumns: "repeat(auto-fit, minmax(20rem, 1fr))"}}
            >
                {filteredKeys?.map((key) => (
                    <KeyCard
                        key={key.id}
                        savedKey={key}
                        onEdit={handleEdit}
                        onDelete={handleDeletePrompt}
                    />
                ))}
            </div>

            <KeyModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSave={handleSave}
                initialData={editingKey}
                isSaving={saveMutation.isPending}
            />

            <ConfirmModal
                isOpen={!!keyToDelete}
                onClose={() => setKeyToDelete(null)}
                onConfirm={handleConfirmDelete}
                title={t("delete_title")}
                description={t("delete_desc", {name: keyToDelete?.name})}
                confirmText={t("delete", {ns: "common"})}
                isDestructive={true}
            />
        </div>
    );
}