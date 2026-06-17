import path from 'node:path'
import { defineConfig } from 'prisma/config'

// โหลด .env.local ก่อน (local dev secrets มี priority สูงกว่า)
// ถ้าใช้ dotenv-cli -e .env.production env vars จะถูก set ก่อน loadEnvFile จึงไม่ override
try { process.loadEnvFile('.env.local') } catch {}
try { process.loadEnvFile() } catch {}

export default defineConfig({
  schema: path.join('prisma', 'schema.prisma'),
  datasource: {
    // CLI commands (db push, migrate) ใช้ DIRECT_URL เสมอเพื่อ bypass PgBouncer
    // ถ้าไม่มี DIRECT_URL (local Docker) ใช้ DATABASE_URL ปกติ
    url: process.env.DIRECT_URL ?? process.env.DATABASE_URL,
  },
})
