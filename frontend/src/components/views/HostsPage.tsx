import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HostCard } from "@/components/views/HostCard";
import { HostModal } from "@/components/views/HostModal";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { useHosts, useSaveHost, useDeleteHost } from "@/hooks/useHosts";
import { useKeys } from "@/hooks/useKeys";
import { useSessionStore } from "@/store/sessionStore";
import { Host } from "../../../bindings/terminator-desktop/backend/internal/services/blob";

export function HostsPage() {
    const {t} = useTranslation(["hosts", "common"]);
    const {data: hosts, isLoading} = useHosts();
    const {data: keys} = useKeys();

    const saveMutation = useSaveHost();
    const deleteMutation = useDeleteHost();
    const {addSession} = useSessionStore();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingHost, setEditingHost] = useState<Host | null>(null);
    const [hostToDelete, setHostToDelete] = useState<Host | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

    const handleCreateNew = () => {
        setEditingHost(null);
        setIsModalOpen(true);
    };

    const handleEdit = (host: Host) => {
        setEditingHost(host);
        setIsModalOpen(true);
    };

    const handleDeletePrompt = (host: Host) => {
        setHostToDelete(host);
    };

    const handleConfirmDelete = () => {
        if (hostToDelete) deleteMutation.mutate(hostToDelete.id);
        setHostToDelete(null);
    };

    const handleSave = (host: Host) => {
        saveMutation.mutate(host, {onSuccess: () => setIsModalOpen(false)});
    };

    const handleConnect = (host: Host) => {
        let keyString: string | undefined = undefined;

        if (host.keyId && keys) {
            const foundKey = keys.find(k => k.id === host.keyId);
            if (foundKey) keyString = foundKey.privateKey;
        }

        addSession({
            host: host.host,
            port: host.port,
            username: host.username,
            password: host.password,
            privateKey: keyString,
            title: host.name || host.host,
        });
    };

    const filteredHosts = useMemo(() => {
        const query = searchQuery.toLowerCase();
        return hosts?.filter((h) =>
            h.name?.toLowerCase().includes(query) ||
            h.host.toLowerCase().includes(query)
        );
    }, [hosts, searchQuery]);

    return (
        <div className="flex h-full w-full flex-col overflow-y-auto p-8">
            <div className="mb-8 flex w-full items-center gap-4">
                <h1 className="shrink-0 text-2xl font-bold tracking-tight text-foreground">
                    {t("page_title")}
                </h1>
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"/>
                    <Input
                        placeholder={t("search_hosts")}
                        className="w-full border-border bg-input/50 pl-9"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <Button onClick={handleCreateNew} className="shrink-0">
                    <Plus/>
                    {t("new_host")}
                </Button>
            </div>

            {isLoading && <div className="text-sm text-muted-foreground">{t("loading_hosts")}</div>}

            {!isLoading && hosts?.length === 0 && (
                <div
                    className="flex flex-col items-center justify-center
                               py-16 text-center
                               rounded-xl border border-dashed border-border">
                    <h3 className="text-lg font-semibold text-foreground">{t("empty_title")}</h3>
                    <p className="mb-4 mt-2 text-sm text-muted-foreground">{t("empty_desc")}</p>
                    <Button variant="outline" onClick={handleCreateNew}>{t("add_first_host")}</Button>
                </div>
            )}

            <div
                className="grid w-full gap-4"
                style={{gridTemplateColumns: "repeat(auto-fit, minmax(20rem, 1fr))"}}
            >
                {filteredHosts?.map((host) => (
                    <HostCard
                        key={host.id}
                        host={host}
                        onConnect={handleConnect}
                        onEdit={handleEdit}
                        onDelete={handleDeletePrompt}
                    />
                ))}
            </div>

            <HostModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                initialData={editingHost}
                isSaving={saveMutation.isPending}
            />

            <ConfirmModal
                isOpen={!!hostToDelete}
                onClose={() => setHostToDelete(null)}
                onConfirm={handleConfirmDelete}
                title={t("delete_title")}
                description={t("delete_desc", {name: hostToDelete?.name || hostToDelete?.host})}
                confirmText={t("delete", {ns: "common"})}
                isDestructive={true}
            />
        </div>
    );
}