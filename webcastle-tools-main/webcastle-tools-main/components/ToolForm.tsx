'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Loader2, Wrench, FileText, Info, Link2, Tag, KeyRound,
  ImageIcon, Globe, AlignLeft, FolderOpen, Eye, EyeOff,
} from 'lucide-react'

interface Tool {
  id: string
  name: string
  description?: string | null
  iconUrl?: string | null
  isActive: boolean
  type?: string
  url?: string | null
  instructions?: string | null
  categoryId?: string | null
}

interface Credential {
  username?: string | null
}

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

export function ToolForm({
  tool,
  credential,
  initialCategories,
  initialTags,
  initialTagIds,
}: {
  tool?: Tool
  credential?: Credential
  initialCategories?: Category[]
  initialTags?: Tag[]
  initialTagIds?: string[]
}) {
  const router = useRouter()
  const isEdit = !!tool

  const [name, setName] = useState(tool?.name ?? '')
  const [description, setDescription] = useState(tool?.description ?? '')
  const [iconUrl, setIconUrl] = useState(tool?.iconUrl ?? '')
  const [isActive, setIsActive] = useState(tool?.isActive ?? true)
  const [type, setType] = useState<'tool' | 'document'>((tool?.type as 'tool' | 'document') ?? 'tool')
  const [url, setUrl] = useState(tool?.url ?? '')
  const [instructions, setInstructions] = useState(tool?.instructions ?? '')
  const [categoryId, setCategoryId] = useState(tool?.categoryId ?? '')
  const [selectedTagIds, setSelectedTagIds] = useState<Set<string>>(new Set(initialTagIds ?? []))
  const [username, setUsername] = useState(credential?.username ?? '')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [iconError, setIconError] = useState(false)

  const [categories, setCategories] = useState<Category[]>(initialCategories ?? [])
  const [tags, setTags] = useState<Tag[]>(initialTags ?? [])

  useEffect(() => {
    if (!initialCategories) {
      fetch('/api/admin/categories')
        .then((r) => r.json())
        .then((data) => { if (Array.isArray(data)) setCategories(data) })
        .catch(() => {})
    }
    if (!initialTags) {
      fetch('/api/admin/tags')
        .then((r) => r.json())
        .then((data) => { if (Array.isArray(data)) setTags(data) })
        .catch(() => {})
    }
  }, [initialCategories, initialTags])

  useEffect(() => { setIconError(false) }, [iconUrl])

  function toggleTag(tagId: string) {
    setSelectedTagIds((prev) => {
      const next = new Set(prev)
      if (next.has(tagId)) next.delete(tagId)
      else next.add(tagId)
      return next
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) {
      toast.error(`${type === 'document' ? 'Document' : 'Tool'} name is required`)
      return
    }
    setLoading(true)
    try {
      let toolId = tool?.id
      const toolPayload = {
        name,
        description,
        iconUrl,
        isActive,
        type,
        url: url || null,
        instructions: instructions || null,
        categoryId: categoryId || null,
        tagIds: Array.from(selectedTagIds),
      }

      if (isEdit) {
        const res = await fetch(`/api/tools/${toolId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(toolPayload),
        })
        if (!res.ok) throw new Error('Failed to update tool')
      } else {
        const res = await fetch('/api/tools', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(toolPayload),
        })
        if (!res.ok) throw new Error('Failed to create tool')
        const data = await res.json()
        toolId = data.id
      }

      if ((username || password) && toolId) {
        const credRes = await fetch(`/api/credentials/${toolId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: username || undefined,
            password: password || undefined,
          }),
        })
        if (!credRes.ok) {
          const errData = await credRes.json()
          console.warn('Credentials save warning:', errData)
        }
      }

      toast.success(isEdit ? 'Saved successfully' : 'Created successfully')
      router.push('/admin/tools')
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const itemLabel = type === 'document' ? 'Document' : 'Tool'

  return (
    <form onSubmit={handleSubmit} className="space-y-4">

      {/* Section: Type */}
      <div className="rounded-xl border border-border bg-card p-5">
        <SectionHeader icon={<Wrench className="h-4 w-4" />} title="Type" />
        <div className="grid grid-cols-2 gap-3 mt-4">
          {([
            { value: 'tool', label: 'Tool', icon: Wrench, desc: 'App, service, or platform' },
            { value: 'document', label: 'Document', icon: FileText, desc: 'File, link, or reference' },
          ] as const).map(({ value, label, icon: Icon, desc }) => (
            <button
              key={value}
              type="button"
              onClick={() => setType(value)}
              className={`flex flex-col gap-1.5 rounded-lg border-2 p-4 text-left transition-all ${
                type === value
                  ? 'border-primary bg-primary/10 text-foreground'
                  : 'border-border bg-background text-muted-foreground hover:border-border/80 hover:text-foreground'
              }`}
            >
              <Icon className={`h-5 w-5 ${type === value ? 'text-primary' : ''}`} />
              <span className="font-semibold text-sm">{label}</span>
              <span className="text-xs opacity-70">{desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Section: Basic Info */}
      <div className="rounded-xl border border-border bg-card p-5">
        <SectionHeader icon={<Info className="h-4 w-4" />} title="Basic Info" />
        <div className="mt-4 space-y-4">

          {/* Icon preview + URL */}
          <div className="flex gap-3 items-start">
            <div className="flex-shrink-0">
              <div className="h-14 w-14 rounded-xl border border-border bg-background flex items-center justify-center overflow-hidden">
                {iconUrl && !iconError ? (
                  <Image
                    src={iconUrl}
                    alt=""
                    width={48}
                    height={48}
                    className="object-contain"
                    onError={() => setIconError(true)}
                    unoptimized
                  />
                ) : (
                  <ImageIcon className="h-6 w-6 text-muted-foreground/40" />
                )}
              </div>
            </div>
            <div className="flex-1 space-y-1.5">
              <Label htmlFor="iconUrl" className="text-xs text-muted-foreground uppercase tracking-wide">Icon URL</Label>
              <Input
                id="iconUrl"
                type="url"
                value={iconUrl}
                onChange={(e) => setIconUrl(e.target.value)}
                placeholder="https://example.com/logo.png"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-xs text-muted-foreground uppercase tracking-wide">
              Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={type === 'document' ? 'e.g. Employee Handbook' : 'e.g. GitHub'}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description" className="text-xs text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
              <AlignLeft className="h-3 w-3" /> Description
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short description shown on the dashboard card"
              rows={2}
              className="resize-none"
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border bg-background px-4 py-3">
            <div>
              <p className="text-sm font-medium">Visible on dashboard</p>
              <p className="text-xs text-muted-foreground">Users can see and request this {itemLabel.toLowerCase()}</p>
            </div>
            <Switch id="isActive" checked={isActive} onCheckedChange={setIsActive} />
          </div>
        </div>
      </div>

      {/* Section: Access & Links */}
      <div className="rounded-xl border border-border bg-card p-5">
        <SectionHeader icon={<Link2 className="h-4 w-4" />} title="Access & Links" />
        <div className="mt-4 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="url" className="text-xs text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
              <Globe className="h-3 w-3" /> {type === 'document' ? 'Document URL' : 'URL / Link'}
            </Label>
            <Input
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder={type === 'document' ? 'https://docs.example.com/handbook.pdf' : 'https://app.example.com'}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="instructions" className="text-xs text-muted-foreground uppercase tracking-wide">Instructions</Label>
            <Textarea
              id="instructions"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Step-by-step instructions for accessing or using this resource…"
              rows={3}
              className="resize-none"
            />
          </div>
        </div>
      </div>

      {/* Section: Organisation */}
      {(categories.length > 0 || tags.length > 0) && (
        <div className="rounded-xl border border-border bg-card p-5">
          <SectionHeader icon={<FolderOpen className="h-4 w-4" />} title="Organisation" />
          <div className="mt-4 space-y-4">
            {categories.length > 0 && (
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground uppercase tracking-wide">Category</Label>
                <Select value={categoryId || '__none__'} onValueChange={(v) => setCategoryId(v === '__none__' ? '' : v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="No category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">— No category —</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {tags.length > 0 && (
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                  <Tag className="h-3 w-3" /> Tags
                </Label>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => {
                    const selected = selectedTagIds.has(tag.id)
                    return (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => toggleTag(tag.id)}
                        className="flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-all"
                        style={{
                          borderColor: tag.color,
                          backgroundColor: selected ? tag.color + '22' : 'transparent',
                          color: tag.color,
                          opacity: selected ? 1 : 0.55,
                        }}
                      >
                        <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: tag.color }} />
                        {tag.name}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Section: Credentials */}
      <div className="rounded-xl border border-border bg-card p-5">
        <SectionHeader icon={<KeyRound className="h-4 w-4" />} title="Credentials" />
        <p className="mt-1 text-xs text-muted-foreground">
          Optional — leave blank if no login is needed. Passwords are encrypted with AES-256-GCM.
        </p>
        <div className="mt-4 space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="username" className="text-xs text-muted-foreground uppercase tracking-wide">Username / Email</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin@example.com"
              autoComplete="off"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-xs text-muted-foreground uppercase tracking-wide">
              Password {isEdit && credential && <span className="normal-case font-normal">(leave blank to keep current)</span>}
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-1">
        <Button type="submit" disabled={loading} className="min-w-32">
          {loading ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving…</>
          ) : isEdit ? (
            'Save Changes'
          ) : (
            `Create ${itemLabel}`
          )}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  )
}

function SectionHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-primary">{icon}</span>
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
    </div>
  )
}
