class AppState {
  // 1. The Key to decrypt local data (AES)
  private _masterKey: Buffer | null = null;

  // 2. The Key to authenticate with the API (Argon2 derived)
  private _loginKey: string | null = null;

  setKeys(masterKey: Buffer, loginKey: string) {
    this._masterKey = masterKey;
    this._loginKey = loginKey;
  }

  getMasterKey(): Buffer {
    if (!this._masterKey) throw new Error("VAULT_LOCKED");
    return this._masterKey;
  }

  getLoginKey(): string {
    if (!this._loginKey) throw new Error("NOT_LOGGED_IN");
    return this._loginKey;
  }

  isUnlocked(): boolean {
    return this._masterKey !== null;
  }
}

export const appState = new AppState();
