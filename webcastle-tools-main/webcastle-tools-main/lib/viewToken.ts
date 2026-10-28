import { SignJWT, jwtVerify } from 'jose'

function getSecret() {
  const s = process.env.AUTH_SECRET
  if (!s) throw new Error('AUTH_SECRET is not set')
  return new TextEncoder().encode(s)
}

export async function createViewToken(toolId: string, userId: string): Promise<string> {
  return new SignJWT({ toolId, userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('24h')
    .setIssuedAt()
    .sign(getSecret())
}

export async function verifyViewToken(token: string): Promise<{ toolId: string; userId: string }> {
  const { payload } = await jwtVerify(token, getSecret())
  return payload as { toolId: string; userId: string }
}
