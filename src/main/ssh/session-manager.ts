import { Client, ClientChannel } from 'ssh2'
import { ipcMain, WebContents } from 'electron'

export interface SshConnectionConfig {
  id: string;
  host: string;
  port: number;
  username: string;
  password?: string;
  privateKey?: string;
}

type ExtendedClient = Client & {
  _shellStream?: ClientChannel;
}

class SessionManager {
  private sessions = new Map<string, ExtendedClient>()

  constructor() {
    this.setupIpc()
  }

  private setupIpc() {
    ipcMain.handle('ssh:connect', async (event, config: SshConnectionConfig) => {
      return this.createSession(config, event.sender)
    })

    ipcMain.on('ssh:input', (_, { id, data }: { id: string, data: string }) => {
      const session = this.sessions.get(id)
      if (session && session._shellStream) {
        session._shellStream.write(data)
      }
    })

    ipcMain.on('ssh:resize', (_, { id, rows, cols }: { id: string, rows: number, cols: number }) => {
      const session = this.sessions.get(id)
      if (session && session._shellStream) {
        session._shellStream.setWindow(rows, cols, 0, 0)
      }
    })

    ipcMain.on('ssh:disconnect', (_, id: string) => {
      this.sessions.get(id)?.end()
      this.sessions.delete(id)
    })
  }

  private createSession(config: SshConnectionConfig, sender: WebContents): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const conn = new Client() as ExtendedClient

      conn.on('ready', () => {
        conn.shell((err, stream) => {
          if (err) {
            conn.end()
            return reject(err)
          }

          conn._shellStream = stream
          this.sessions.set(config.id, conn)

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

      try {
        conn.connect({
          host: config.host,
          port: config.port,
          username: config.username,
          password: config.password,
          privateKey: config.privateKey,
          keepaliveInterval: 10000,
          readyTimeout: 20000,
        })
      } catch (error) {
        reject(error)
      }
    })
  }
}

export const sshManager = new SessionManager()
