import { create } from 'zustand';
import { Host } from '../../../shared/types';

export type TabType = 'hosts' | 'keys' | 'terminal';

export interface TerminalSession {
  id: string;
  connection: Host;
  title: string;
}

interface AppState {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;

  isUnlocked: boolean;
  hasUser: boolean;
  setUnlocked: (val: boolean) => void;
  setHasUser: (val: boolean) => void;

  sessions: TerminalSession[];
  activeSessionId: string | null;

  addSession: (connection: Host) => void;
  removeSession: (sessionId: string) => void;
  setActiveSession: (sessionId: string) => void;
}

export const useStore = create<AppState>((set) => ({
  activeTab: 'hosts',
  setActiveTab: (tab) => set({ activeTab: tab }),

  isUnlocked: false,
  hasUser: false,
  setUnlocked: (val) => set({ isUnlocked: val }),
  setHasUser: (val) => set({ hasUser: val }),

  sessions: [],
  activeSessionId: null,

  addSession: (connection) => {
    const newSessionId = crypto.randomUUID();
    set((state) => ({
      sessions: [...state.sessions, {
        id: newSessionId,
        connection: connection,
        title: connection.name || connection.host
      }],
      activeSessionId: newSessionId,
      activeTab: 'terminal'
    }));
  },

  removeSession: (sessionId) => set((state) => {
    const newSessions = state.sessions.filter(s => s.id !== sessionId);

    let newActiveId = state.activeSessionId;
    let newTab = state.activeTab;

    if (sessionId === state.activeSessionId) {
      if (newSessions.length > 0) {
        newActiveId = newSessions[newSessions.length - 1].id;
      } else {
        newActiveId = null;
        newTab = 'hosts';
      }
    }

    return { sessions: newSessions, activeSessionId: newActiveId, activeTab: newTab };
  }),

  setActiveSession: (sessionId) => set({ activeSessionId: sessionId })
}));
