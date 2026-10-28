'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Loader2, Trash2, Plus } from 'lucide-react'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

interface Category {
  id: string
  name: string
  color: string
}

interface Tag {
  id: string
  name: string
  color: string
}

const PRESET_COLORS = [
  '#6366f1', // indigo
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#ef4444', // red
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#06b6d4', // cyan
]

function ColorPicker({ value, onChange }: { value: string; onChange: (c: string) => void }) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {PRESET_COLORS.map((c) => (
        <button
          key={c}
          type="button"
          onClick={() => onChange(c)}
          className="h-6 w-6 rounded-full border-2 transition-transform hover:scale-110"
          style={{
            backgroundColor: c,
            borderColor: value === c ? 'white' : 'transparent',
          }}
          title={c}
        />
      ))}
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-6 w-6 rounded cursor-pointer border border-border bg-transparent"
        title="Custom color"
      />
    </div>
  )
}

export function AdminCategoriesClient({
  initialCategories,
  initialTags,
}: {
  initialCategories: Category[]
  initialTags: Tag[]
}) {
  const router = useRouter()

  const [categories, setCategories] = useState<Category[]>(initialCategories)
  const [tags, setTags] = useState<Tag[]>(initialTags)

  const [catName, setCatName] = useState('')
  const [catColor, setCatColor] = useState('#6366f1')
  const [catLoading, setCatLoading] = useState(false)

  const [tagName, setTagName] = useState('')
  const [tagColor, setTagColor] = useState('#6366f1')
  const [tagLoading, setTagLoading] = useState(false)

  const [deletingCat, setDeletingCat] = useState<string | null>(null)
  const [deletingTag, setDeletingTag] = useState<string | null>(null)

  async function handleAddCategory(e: React.FormEvent) {
    e.preventDefault()
    if (!catName.trim()) return
    setCatLoading(true)
    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: catName.trim(), color: catColor }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to create category')
      setCategories((prev) => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)))
      setCatName('')
      setCatColor('#6366f1')
      toast.success('Category created')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create category')
    } finally {
      setCatLoading(false)
    }
  }

  async function handleDeleteCategory(id: string) {
    setDeletingCat(id)
    try {
      const res = await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete category')
      setCategories((prev) => prev.filter((c) => c.id !== id))
      toast.success('Category deleted')
      router.refresh()
    } catch {
      toast.error('Failed to delete category')
    } finally {
      setDeletingCat(null)
    }
  }

  async function handleAddTag(e: React.FormEvent) {
    e.preventDefault()
    if (!tagName.trim()) return
    setTagLoading(true)
    try {
      const res = await fetch('/api/admin/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: tagName.trim(), color: tagColor }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to create tag')
      setTags((prev) => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)))
      setTagName('')
      setTagColor('#6366f1')
      toast.success('Tag created')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create tag')
    } finally {
      setTagLoading(false)
    }
  }

  async function handleDeleteTag(id: string) {
    setDeletingTag(id)
    try {
      const res = await fetch(`/api/admin/tags/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete tag')
      setTags((prev) => prev.filter((t) => t.id !== id))
      toast.success('Tag deleted')
    } catch {
      toast.error('Failed to delete tag')
    } finally {
      setDeletingTag(null)
    }
  }

  return (
    <div className="max-w-2xl space-y-10">
      {/* Categories Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Categories</h2>
        <p className="text-sm text-muted-foreground">Group tools and documents into categories for easier navigation.</p>

        <form onSubmit={handleAddCategory} className="flex flex-col gap-3 p-4 rounded-lg border border-border bg-card">
          <div className="flex gap-3">
            <div className="flex-1 space-y-1">
              <Label htmlFor="cat-name">Name</Label>
              <Input
                id="cat-name"
                value={catName}
                onChange={(e) => setCatName(e.target.value)}
                placeholder="e.g. Development"
                required
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label>Color</Label>
            <ColorPicker value={catColor} onChange={setCatColor} />
          </div>
          <Button type="submit" disabled={catLoading} className="self-start">
            {catLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
            Add Category
          </Button>
        </form>

        <div className="rounded-lg border border-border overflow-hidden">
          {categories.length === 0 ? (
            <div className="text-center text-muted-foreground py-8 text-sm">No categories yet.</div>
          ) : (
            <div className="divide-y divide-border">
              {categories.map((cat) => (
                <div key={cat.id} className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-4 w-4 rounded-full" style={{ backgroundColor: cat.color }} />
                    <span className="text-sm font-medium">{cat.name}</span>
                    <Badge variant="outline" className="text-xs font-mono" style={{ borderColor: cat.color, color: cat.color }}>
                      {cat.color}
                    </Badge>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" disabled={deletingCat === cat.id}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete &quot;{cat.name}&quot;?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tools assigned to this category will be uncategorized. This cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteCategory(cat.id)}>Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Separator />

      {/* Tags Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Tags</h2>
        <p className="text-sm text-muted-foreground">Add colored tags to tools for fine-grained labelling.</p>

        <form onSubmit={handleAddTag} className="flex flex-col gap-3 p-4 rounded-lg border border-border bg-card">
          <div className="flex gap-3">
            <div className="flex-1 space-y-1">
              <Label htmlFor="tag-name">Name</Label>
              <Input
                id="tag-name"
                value={tagName}
                onChange={(e) => setTagName(e.target.value)}
                placeholder="e.g. Internal"
                required
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label>Color</Label>
            <ColorPicker value={tagColor} onChange={setTagColor} />
          </div>
          <Button type="submit" disabled={tagLoading} className="self-start">
            {tagLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
            Add Tag
          </Button>
        </form>

        <div className="rounded-lg border border-border overflow-hidden">
          {tags.length === 0 ? (
            <div className="text-center text-muted-foreground py-8 text-sm">No tags yet.</div>
          ) : (
            <div className="flex flex-wrap gap-2 p-4">
              {tags.map((tag) => (
                <div key={tag.id} className="flex items-center gap-1 rounded-full border px-3 py-1" style={{ borderColor: tag.color }}>
                  <div className="h-2 w-2 rounded-full" style={{ backgroundColor: tag.color }} />
                  <span className="text-xs font-medium" style={{ color: tag.color }}>{tag.name}</span>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <button
                        type="button"
                        disabled={deletingTag === tag.id}
                        className="ml-1 opacity-60 hover:opacity-100 transition-opacity"
                        title="Delete tag"
                      >
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete tag &quot;{tag.name}&quot;?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This tag will be removed from all tools. This cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteTag(tag.id)}>Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
