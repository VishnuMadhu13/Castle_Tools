import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { SignInButton } from '@/components/SignInButton'
import { Castle } from 'lucide-react'

export default async function LandingPage() {
  const session = await auth()
  if (session?.user) redirect('/dashboard')

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-8 px-4 text-center">
        <div className="flex items-center gap-3">
          <Castle className="h-12 w-12 text-primary" />
          <h1 className="text-4xl font-bold text-foreground">WebCastle Tools</h1>
        </div>
        <p className="text-muted-foreground text-lg max-w-sm">
          WebCastle internal tools and credential management. Request tool credentials delivered to your inbox via Gmail Confidential Mode.
        </p>
        <SignInButton />
      </div>
    </div>
  )
}
