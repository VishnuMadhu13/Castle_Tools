// Applies Drizzle SQL migrations using only runtime deps (drizzle-orm + postgres).
// Used by the K8s initContainer and the CI DAST stage: `node db/migrate.mjs`
import postgres from 'postgres'
import { drizzle } from 'drizzle-orm/postgres-js'
import { migrate } from 'drizzle-orm/postgres-js/migrator'

const url = process.env.DATABASE_URL
if (!url) {
  console.error('DATABASE_URL is not set')
  process.exit(1)
}

const sql = postgres(url, { max: 1, onnotice: () => {} })
try {
  await migrate(drizzle(sql), { migrationsFolder: './db/migrations' })
  console.log('Database migrations applied')
} catch (err) {
  console.error('Migration failed:', err)
  process.exitCode = 1
} finally {
  await sql.end()
}
