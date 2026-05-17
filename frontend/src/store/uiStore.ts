import { create } from "zustand";

export enum ViewType {
    Hosts = "hosts",
    Keys = "keys",
    Settings = "settings",
    Terminal = "terminal",
}

interface UIState {
    activeView: ViewType;
    isSidebarVisible: boolean;
    updateVersionReady: string | null;
    setActiveView: (view: ViewType) => void;
    toggleSidebar: () => void;
    setUpdateVersionReady: (version: string | null) => void;
}

export const useUIStore = create<UIState>((set) => ({
    activeView: ViewType.Hosts,
    isSidebarVisible: true,
    updateVersionReady: null,
    setActiveView: (view) => set({activeView: view}),
    toggleSidebar: () => set((state) => ({isSidebarVisible: !state.isSidebarVisible})),
    setUpdateVersionReady: (version) => set({ updateVersionReady: version }),
}));