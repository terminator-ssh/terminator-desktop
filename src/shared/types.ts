export interface Host {
  id: string;
  type?: 'host';
  name: string;
  host: string;
  port: number;
  username: string;
  password?: string;
  keyId?: string;
}

export interface SavedKey {
  id: string;
  type?: 'key';
  name: string;
  privateKey: string;
}

export const IPC = {
  HOSTS: {
    GET: 'db:hosts:get',
    SAVE: 'db:hosts:save',
    DELETE: 'db:hosts:delete',
  },
  KEYS: {
    GET: 'db:keys:get',
    SAVE: 'db:keys:save',
    DELETE: 'db:keys:delete',
  },
  SSH: {
    CONNECT: 'ssh:connect',
    INPUT: 'ssh:input',
    DATA: 'ssh:data',
    RESIZE: 'ssh:resize',
    DISCONNECT: 'ssh:disconnect',
  }
}

export type SyncStatus = 'idle' | 'syncing' | 'success' | 'error' | 'offline' | 'unauthenticated';
