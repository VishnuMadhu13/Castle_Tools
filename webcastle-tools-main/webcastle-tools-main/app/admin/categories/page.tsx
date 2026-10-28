import { db } from '@/db'
import { categories, tags } from '@/db/schema'
import { AdminCategoriesClient } from '@/components/AdminCategoriesClient'

export default async function AdminCategoriesPage() {
  const allCategories = await db.select().from(categories).orderBy(categories.name)
  const allTags = await db.select().from(tags).orderBy(tags.name)

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Categories &amp; Tags</h1>
      </div>
      <AdminCategoriesClient initialCategories={allCategories} initialTags={allTags} />
    </div>
  )
}
