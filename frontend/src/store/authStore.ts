import { create } from "zustand";

interface AuthState {
    isUnlocked: boolean;
    hasUser: boolean;
    setUnlocked: (val: boolean) => void;
    setHasUser: (val: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    isUnlocked: false,
    hasUser: false,
    setUnlocked: (val) => set({isUnlocked: val}),
    setHasUser: (val) => set({hasUser: val}),
}));