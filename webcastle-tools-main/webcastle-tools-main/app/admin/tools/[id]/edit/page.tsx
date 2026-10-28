import { db } from '@/db'
import { tools, credentials, categories, tags, toolTags } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import { ToolForm } from '@/components/ToolForm'

export default async function EditToolPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [tool] = await db.select().from(tools).where(eq(tools.id, id))
  if (!tool) notFound()

  const [cred] = await db.select().from(credentials).where(eq(credentials.toolId, id))
  const allCategories = await db.select().from(categories).orderBy(categories.name)
  const allTags = await db.select().from(tags).orderBy(tags.name)
  const toolTagRows = await db.select().from(toolTags).where(eq(toolTags.toolId, id))
  const tagIds = toolTagRows.map((r) => r.tagId)

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Edit Tool</h1>
        <p className="text-sm text-muted-foreground mt-1">Update the details for <span className="text-foreground font-medium">{tool.name}</span>.</p>
      </div>
      <ToolForm
        tool={tool}
        credential={cred ? { username: cred.username } : undefined}
        initialCategories={allCategories}
        initialTags={allTags}
        initialTagIds={tagIds}
      />
    </div>
  )
}
