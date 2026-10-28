import { auth } from '@/lib/auth'
import { db } from '@/db'
import { credentials, tools, credentialRequests } from '@/db/schema'
import { eq, and, gte } from 'drizzle-orm'
import { decrypt } from '@/lib/crypto'
import { sendCredentialEmail } from '@/lib/gmail'
import { createViewToken } from '@/lib/viewToken'

export async function POST(_req: Request, { params }: { params: Promise<{ toolId: string }> }) {
  const session = await auth()
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { toolId } = await params

  // Rate limit: once per tool per user per 10 minutes
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000)
  const recentRequests = await db
    .select()
    .from(credentialRequests)
    .where(
      and(
        eq(credentialRequests.userId, session.user.id),
        eq(credentialRequests.toolId, toolId),
        gte(credentialRequests.requestedAt, tenMinutesAgo)
      )
    )

  if (recentRequests.length > 0) {
    return Response.json(
      { error: 'Rate limit: you can only request credentials once every 10 minutes per tool.' },
      { status: 429 }
    )
  }

  const [tool] = await db.select().from(tools).where(eq(tools.id, toolId))
  if (!tool || !tool.isActive) return Response.json({ error: 'Tool not found' }, { status: 404 })

  const [cred] = await db.select().from(credentials).where(eq(credentials.toolId, toolId))

  // If no credential but tool has a URL, return the URL
  if (!cred) {
    if (tool.url) {
      return Response.json({ success: true, toolUrl: tool.url })
    }
    return Response.json({ error: 'No credentials configured for this tool.' }, { status: 404 })
  }

  const password = cred.passwordEnc ? decrypt(cred.passwordEnc) : null

  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)
  const token = await createViewToken(toolId, session.user.id)
  const baseUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3000'
  const viewUrl = `${baseUrl}/credentials/view?token=${token}`

  let status: 'sent' | 'failed' = 'sent'
  try {
    await sendCredentialEmail({
      to: session.user.email!,
      toolName: tool.name,
      viewUrl,
      expiresAt,
    })
  } catch {
    status = 'failed'
  }

  await db.insert(credentialRequests).values({
    userId: session.user.id,
    toolId,
    status,
  })

  if (status === 'failed') {
    return Response.json({ error: 'Failed to send email. Credentials shown below.' }, { status: 500 })
  }

  return Response.json({ success: true, username: cred.username ?? null, password })
}
