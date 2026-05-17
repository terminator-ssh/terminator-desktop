import { create } from "zustand";
import { Events } from "@wailsio/runtime";
import { SyncStatus } from "../../bindings/terminator-desktop/backend/internal/services/sync";
import { AppEvent } from "@/lib/events.ts";
import { AppClientError, parseAppError } from "@/lib/error.ts";

interface SyncState {
    status: SyncStatus;
    lastError: AppClientError | null;
    setStatus: (status: SyncStatus) => void;
}

export const useSyncStore = create<SyncState>((set) => {
    Events.On(AppEvent.SyncStatus, (event) => {
        const status = event.data as SyncStatus;
        set((state) => ({
            status,
            lastError: (status === SyncStatus.SyncStatusSuccess)
                ? null
                : state.lastError
        }));
    });

    Events.On(AppEvent.SyncError, (event) => {
        const parsedError = parseAppError(event.data);
        set({
            status: SyncStatus.SyncStatusError,
            lastError: parsedError
        });
    });

    return {
        status: SyncStatus.SyncStatusIdle,
        lastError: null,
        setStatus: (status) => set({ status }),
    };
});