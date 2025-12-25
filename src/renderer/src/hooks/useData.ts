import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Host, SavedKey, IPC } from '../../../shared/types';

export const useHosts = () => {
  return useQuery({
    queryKey: ['hosts'],
    queryFn: async (): Promise<Host[]> => {
      return await window.electron.ipcRenderer.invoke(IPC.HOSTS.GET);
    }
  });
};

export const useSaveHost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (host: Partial<Host>) => {
      return await window.electron.ipcRenderer.invoke(IPC.HOSTS.SAVE, host);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hosts'] });
    }
  });
};

export const useDeleteHost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      return await window.electron.ipcRenderer.invoke(IPC.HOSTS.DELETE, id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hosts'] });
    }
  });
};

export const useKeys = () => {
  return useQuery({
    queryKey: ['keys'],
    queryFn: async (): Promise<SavedKey[]> => {
      return await window.electron.ipcRenderer.invoke(IPC.KEYS.GET);
    }
  });
};

export const useSaveKey = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (key: Partial<SavedKey>) => {
      return await window.electron.ipcRenderer.invoke(IPC.KEYS.SAVE, key);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['keys'] });
    }
  });
};

export const useDeleteKey = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      return await window.electron.ipcRenderer.invoke(IPC.KEYS.DELETE, id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['keys'] });
    }
  });
};

export const useCurrentUser = () => {
  return useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      return await window.electron.ipcRenderer.invoke('auth:me');
    }
  });
};
