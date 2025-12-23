import { Client } from 'ssh2'
import { ipcMain } from 'electron'

// Types for our connection request
export interface SshConnectionConfig {
  id: string; // Internal UUID for the tab
  host: string;
  port: number;
  username: string;
  password?: string;
  privateKey?: string;
}

class SessionManager {
  // Map<TabId, SSHClient>
  private sessions = new Map<string, Client>()

  constructor() {
    this.setupIpc()
  }

  private setupIpc() {
    // 1. Connect Request
    ipcMain.handle('ssh:connect', async (event, config: SshConnectionConfig) => {
      return this.createSession(config, event.sender)
    })

    // 2. User Input (Keystrokes from xterm)
    ipcMain.on('ssh:input', (_, { id, data }: { id: string, data: string }) => {
      const session = this.sessions.get(id)
      if (session) {
        // @ts-ignore - ssh2 types are sometimes strict about streams
        session.shellStream?.write(data)
      }
    })

    // 3. Resize (Window resized)
    ipcMain.on('ssh:resize', (_, { id, rows, cols }: { id: string, rows: number, cols: number }) => {
      const session = this.sessions.get(id)
      if (session) {
        // @ts-ignore
        session.shellStream?.setWindow(rows, cols, 0, 0)
      }
    })

    // 4. Disconnect/Close Tab
    ipcMain.on('ssh:disconnect', (_, id: string) => {
      this.sessions.get(id)?.end()
      this.sessions.delete(id)
    })
  }

  private createSession(config: SshConnectionConfig, sender: Electron.WebContents): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const conn = new Client()

      conn.on('ready', () => {
        // Start a shell
        conn.shell((err, stream) => {
          if (err) {
            conn.end()
            return reject(err)
          }

          // Attach stream to the connection object so we can write to it later
          // @ts-ignore
          conn.shellStream = stream

          this.sessions.set(config.id, conn)

          // Listen for data FROM server
          stream.on('data', (data: Buffer) => {
            sender.send('ssh:data', { id: config.id, data: data.toString('utf-8') })
          })

          stream.on('close', () => {
            conn.end()
            this.sessions.delete(config.id)
            sender.send('ssh:closed', { id: config.id })
          })

          resolve(true)
        })
      })

      conn.on('error', (err) => {
        reject(err)
      })

      // Connect logic
      try {
        conn.connect({
          host: config.host,
          port: config.port,
          username: config.username,
          password: config.password,
          privateKey: config.privateKey,
          // Common options to prevent hanging
          keepaliveInterval: 10000,
          readyTimeout: 20000,
        })
      } catch (error) {
        reject(error)
      }
    })
  }
}

// Export a singleton
export const sshManager = new SessionManager()
