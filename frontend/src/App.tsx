import { Sidebar } from "@/components/layout/Sidebar";
import { TitleBar } from "@/components/layout/TitleBar";
import { ContentView } from "@/components/layout/ContentView";
import { LockScreen } from "@/components/views/LockScreen";
import { Toaster } from "@/components/ui/sonner";
import { useAuthStore } from "@/store/authStore";
import { Events } from "@wailsio/runtime";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { HOSTS_QUERY_KEY } from "@/hooks/useHosts.ts";
import { KEYS_QUERY_KEY } from "@/hooks/useKeys.ts";
import { SettingsService } from "../bindings/terminator-desktop/backend/internal/services/settings";
import { useTranslation } from "react-i18next";
import { AppEvent } from "@/lib/events.ts";
import { useSessionStore } from "@/store/sessionStore.ts";

export default function App() {
    const {isUnlocked} = useAuthStore();
    const {removeSession} = useSessionStore();
    const queryClient = useQueryClient();
    const {i18n} = useTranslation();

    useEffect(() => {
        SettingsService.GetSettings()
            .then((settings) => {
                if (settings.language && settings.language !== i18n.language) {
                    void i18n.changeLanguage(settings.language);
                }
            })
            .catch(console.error);
    }, [i18n]);

    useEffect(() => {
        const unsubscribe = Events.On(AppEvent.SshClosed, (event) => {
            // setTimeout(() => {
            //     removeSession(event.data.id);
            // }, 500);
            removeSession(event.data.id);
        });

        return () => unsubscribe();
    }, [removeSession]);

    useEffect(() => {
        if (!isUnlocked) return;

        const unsubscribe = Events.On(AppEvent.SyncUpdatesAvailable, () => {
            console.debug(`${AppEvent.SyncUpdatesAvailable}: invalidating queries`);

            void queryClient.invalidateQueries({queryKey: HOSTS_QUERY_KEY});
            void queryClient.invalidateQueries({queryKey: KEYS_QUERY_KEY});
        });

        return () => unsubscribe();
    }, [isUnlocked, queryClient]);

    return (
        <div className="flex h-screen w-screen flex-col overflow-hidden bg-background text-foreground">
            <TitleBar/>
            <div className="flex flex-1 overflow-hidden relative">

                {!isUnlocked ? (
                    <LockScreen/>
                ) : (
                    <>
                        <Sidebar/>
                        <ContentView/>
                    </>
                )}

            </div>
            <Toaster position="bottom-right" theme="dark" richColors/>
        </div>
    );
}