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
    setActiveView: (view: ViewType) => void;
    toggleSidebar: () => void;
}

export const useUIStore = create<UIState>((set) => ({
    activeView: ViewType.Hosts,
    isSidebarVisible: true,
    setActiveView: (view) => set({activeView: view}),
    toggleSidebar: () => set((state) => ({isSidebarVisible: !state.isSidebarVisible})),
}));