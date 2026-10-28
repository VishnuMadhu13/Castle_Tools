import { auth } from '@/lib/auth'
import { db } from '@/db'
import { categories } from '@/db/schema'
import { z } from 'zod'

export async function GET() {
  const session = await auth()
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const all = await db.select().from(categories).orderBy(categories.name)
  return Response.json(all)
}

const createCategorySchema = z.object({
  name: z.string().min(1),
  color: z.string().optional().default('#6366f1'),
})

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  if (!session.user.isAdmin) return Response.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const parsed = createCategorySchema.safeParse(body)
  if (!parsed.success) return Response.json({ error: parsed.error.issues }, { status: 400 })

  const [category] = await db
    .insert(categories)
    .values({ name: parsed.data.name, color: parsed.data.color })
    .returning()

  return Response.json(category, { status: 201 })
}
