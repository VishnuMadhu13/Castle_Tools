# 9. Environment Variables

Copy `.env.example` to `.env.local` and fill in all values before running.

```env
# ─────────────────────────────────────────
# Database
# ─────────────────────────────────────────
DATABASE_URL=postgresql://user:password@localhost:5432/credvault

# ─────────────────────────────────────────
# NextAuth
# ─────────────────────────────────────────
NEXTAUTH_SECRET=<random-32-char-string>
NEXTAUTH_URL=http://localhost:3000

# ─────────────────────────────────────────
# Google OAuth — for NextAuth login
# Create at: https://console.cloud.google.com/apis/credentials
# ─────────────────────────────────────────
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>

# ─────────────────────────────────────────
# Gmail API — for sending credential emails
# Requires gmail.send scope
# Create at: https://console.cloud.google.com/apis/credentials
# ─────────────────────────────────────────
GMAIL_CLIENT_ID=<gmail-api-oauth-client-id>
GMAIL_CLIENT_SECRET=<gmail-api-oauth-client-secret>
GMAIL_REFRESH_TOKEN=<refresh-token-with-gmail.send-scope>
GMAIL_SENDER_EMAIL=credentials@yourdomain.com

# ─────────────────────────────────────────
# Credential Encryption
# 32-byte (64 hex char) key for AES-256-GCM
# Generate with: openssl rand -hex 32
# ─────────────────────────────────────────
CREDENTIAL_ENCRYPTION_KEY=<64-hex-character-key>
```

---

## Notes

| Variable | How to Get |
|----------|-----------|
| `NEXTAUTH_SECRET` | Run `openssl rand -base64 32` |
| `GOOGLE_CLIENT_ID/SECRET` | [Google Cloud Console](https://console.cloud.google.com) → APIs & Services → Credentials → OAuth 2.0 Client |
| `GMAIL_REFRESH_TOKEN` | Use [OAuth Playground](https://developers.google.com/oauthplayground) with `https://mail.google.com/` scope |
| `CREDENTIAL_ENCRYPTION_KEY` | Run `openssl rand -hex 32` |
