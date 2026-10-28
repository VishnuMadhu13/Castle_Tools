import { db } from '@/db'
import { categories, tags } from '@/db/schema'
import { ToolForm } from '@/components/ToolForm'

export default async function NewToolPage() {
  const allCategories = await db.select().from(categories).orderBy(categories.name)
  const allTags = await db.select().from(tags).orderBy(tags.name)

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Add New Tool</h1>
        <p className="text-sm text-muted-foreground mt-1">Fill in the details below to add a tool or document to the dashboard.</p>
      </div>
      <ToolForm initialCategories={allCategories} initialTags={allTags} />
    </div>
  )
}
