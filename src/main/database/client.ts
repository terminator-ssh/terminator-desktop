import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import path from 'path'
import { app } from 'electron'
import {PrismaClient} from "@prisma/client/extension";

// 1. Determine the DB path
const dbPath = app.isPackaged
  ? path.join(app.getPath('userData'), 'app.db')
  : path.join(__dirname, '../../prisma/dev.db')

// 2. Initialize the Adapter
const adapter = new PrismaBetterSqlite3({
  url: `file:${dbPath}`
})

// 3. Initialize Prisma
export const prisma = new PrismaClient({ adapter })
