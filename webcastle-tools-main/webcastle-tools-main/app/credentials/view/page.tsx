'use client'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Copy, Eye, EyeOff, ShieldCheck, AlertTriangle, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

interface CredData {
  toolName: string
  username: string | null
  password: string | null
  toolUrl?: string
}

export default function ViewCredentialsPage() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [data, setData] = useState<CredData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    if (!token) {
      setError('No token provided.')
      setLoading(false)
      return
    }
    fetch(`/api/credentials/view?token=${encodeURIComponent(token)}`)
      .then(async (res) => {
        const json = await res.json()
        if (!res.ok) throw new Error(json.error ?? 'Failed to load credentials')
        setData(json)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [token])

  function copy(text: string, label: string) {
    navigator.clipboard.writeText(text)
    toast.success(`${label} copied`)
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
        <div className="flex items-center gap-2 justify-center mb-2">
          <ShieldCheck className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg">CredVault</span>
        </div>

        {loading && (
          <Card className="bg-card border-border">
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64 mt-2" />
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </CardContent>
          </Card>
        )}

        {error && !loading && (
          <Card className="bg-card border-destructive">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                <CardTitle className="text-base text-destructive">Link Invalid or Expired</CardTitle>
              </div>
              <CardDescription>{error}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full">
                <Link href="/dashboard">Go to Dashboard</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {data && !loading && (
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Credentials for {data.toolName}</CardTitle>
              <CardDescription>
                This link expires 24 hours from when it was sent. Keep these credentials safe.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* URL link if present */}
              {data.toolUrl && (
                <a
                  href={data.toolUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full rounded-lg border border-border bg-secondary hover:bg-secondary/80 px-4 py-3 text-sm font-medium transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                  Visit {data.toolName}
                </a>
              )}

              {data.username !== null && (
                <div className="flex items-center justify-between bg-secondary rounded-lg px-4 py-3">
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">Username</p>
                    <p className="font-mono text-sm">{data.username}</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => copy(data.username!, 'Username')}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {data.password !== null && (
                <div className="flex items-center justify-between bg-secondary rounded-lg px-4 py-3">
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">Password</p>
                    <p className="font-mono text-sm">{showPassword ? data.password : '••••••••••••'}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => setShowPassword((v) => !v)}>
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => copy(data.password!, 'Password')}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {data.username === null && data.password === null && !data.toolUrl && (
                <p className="text-sm text-muted-foreground text-center py-2">
                  No credential details available.
                </p>
              )}

              <p className="text-xs text-muted-foreground text-center pt-1">
                Do not share this page or these credentials.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
