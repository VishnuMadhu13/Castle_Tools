import { auth } from '@/lib/auth'
import { db } from '@/db'
import { credentials, tools } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { decrypt } from '@/lib/crypto'
import { verifyViewToken } from '@/lib/viewToken'

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const token = new URL(req.url).searchParams.get('token')
  if (!token) return Response.json({ error: 'Missing token' }, { status: 400 })

  let toolId: string
  let userId: string
  try {
    const payload = await verifyViewToken(token)
    toolId = payload.toolId
    userId = payload.userId
  } catch {
    return Response.json({ error: 'Link is invalid or has expired.' }, { status: 410 })
  }

  if (userId !== session.user.id) {
    return Response.json({ error: 'This link belongs to a different account.' }, { status: 403 })
  }

  const [tool] = await db.select().from(tools).where(eq(tools.id, toolId))
  if (!tool) return Response.json({ error: 'Tool not found' }, { status: 404 })

  const [cred] = await db.select().from(credentials).where(eq(credentials.toolId, toolId))
  if (!cred) return Response.json({ error: 'No credentials found' }, { status: 404 })

  const password = cred.passwordEnc ? decrypt(cred.passwordEnc) : null

  return Response.json({
    toolName: tool.name,
    username: cred.username ?? null,
    password,
  })
}
