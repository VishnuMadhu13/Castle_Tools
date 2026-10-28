'use client'
import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { ToolCard } from '@/components/ToolCard'
import { Skeleton } from '@/components/ui/skeleton'
import { Search, PackageOpen } from 'lucide-react'

interface ToolTag {
  id: string
  name: string
  color: string
}

interface Tool {
  id: string
  name: string
  type: string
  description?: string | null
  iconUrl?: string | null
  url?: string | null
  instructions?: string | null
  categoryId?: string | null
  categoryName?: string | null
  tags: ToolTag[]
  hasCredentials: boolean
}

interface User {
  name?: string | null
}

type TypeTab = 'all' | 'tool' | 'document'

export function DashboardClient({ user }: { user: User }) {
  const [tools, setTools] = useState<Tool[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState<TypeTab>('all')
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/tools')
      .then((r) => r.json())
      .then((data) => {
        setTools(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  // Derive unique categories from tools
  const categories = Array.from(
    new Map(
      tools
        .filter((t) => t.categoryId && t.categoryName)
        .map((t) => [t.categoryId!, t.categoryName!])
    ).entries()
  )

  const filtered = tools.filter((t) => {
    if (activeTab !== 'all' && t.type !== activeTab) return false
    if (activeCategoryId && t.categoryId !== activeCategoryId) return false
    if (search && !t.name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const tabs: { key: TypeTab; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'tool', label: 'Tools' },
    { key: 'document', label: 'Documents' },
  ]

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">Tools &amp; Documents</h1>
          <p className="text-muted-foreground mt-1">Welcome back, {user.name}</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Type tabs */}
      <div className="flex items-center gap-1 mb-4 border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.key
                ? 'border-primary text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Category filter */}
      {categories.length > 0 && (
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveCategoryId(null)}
            className={`shrink-0 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
              activeCategoryId === null
                ? 'bg-primary text-primary-foreground border-primary'
                : 'border-border text-muted-foreground hover:border-foreground hover:text-foreground'
            }`}
          >
            All Categories
          </button>
          {categories.map(([id, name]) => (
            <button
              key={id}
              onClick={() => setActiveCategoryId(activeCategoryId === id ? null : id)}
              className={`shrink-0 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                activeCategoryId === id
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'border-border text-muted-foreground hover:border-foreground hover:text-foreground'
              }`}
            >
              {name}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-44 rounded-lg" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-muted-foreground">
          <PackageOpen className="h-12 w-12" />
          <p className="text-lg">
            {search ? 'No results match your search.' : 'No items found.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      )}
    </div>
  )
}
