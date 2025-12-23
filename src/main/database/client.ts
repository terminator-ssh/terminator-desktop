import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import path from 'path'
import { app } from 'electron'

// FIX: Import directly from our custom generated location
// @ts-ignore - Typescript might complain it can't find it, but it exists
import { PrismaClient } from '.prisma-client'

const dbPath = app.isPackaged
  ? path.join(app.getPath('userData'), 'app.db')
  : path.join(__dirname, '../../prisma/dev.db')

const adapter = new PrismaBetterSqlite3({
  url: `file:${dbPath}`
})

export const prisma = new PrismaClient({ adapter })
