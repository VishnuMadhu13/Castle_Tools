# 10. Gmail Confidential Mode — Implementation Notes

---

## 10.1 How It Works

Gmail Confidential Mode prevents the recipient from forwarding, copying, printing, or downloading the email. It also allows setting an expiry after which the message body becomes inaccessible.

Confidential Mode is activated by including specific headers in the raw RFC 2822 email message sent via the Gmail API.

> ⚠️ The recipient **must open the email in Gmail** (web or mobile app). Other email clients (Outlook, Apple Mail) will only show a link to view the message in Gmail.

---

## 10.2 Required Gmail API Scopes

```
https://mail.google.com/
```

or the more limited:

```
https://www.googleapis.com/auth/gmail.send
```

---

## 10.3 Implementation (`lib/gmail.ts`)

```ts
import { google } from 'googleapis'

const oauth2Client = new google.auth.OAuth2(
  process.env.GMAIL_CLIENT_ID,
  process.env.GMAIL_CLIENT_SECRET,
)
oauth2Client.setCredentials({ refresh_token: process.env.GMAIL_REFRESH_TOKEN })

const gmail = google.gmail({ version: 'v1', auth: oauth2Client })

export async function sendConfidentialCredentials({
  to,
  toolName,
  username,
  password,
}: {
  to: string
  toolName: string
  username: string
  password: string
}) {
  const expiryDate = new Date(Date.now() + 24 * 60 * 60 * 1000) // +24 hours
  const expiryTimestamp = Math.floor(expiryDate.getTime() / 1000)

  const htmlBody = `
    <h2>Your credentials for <strong>${toolName}</strong></h2>
    <p><strong>Username:</strong> ${username}</p>
    <p><strong>Password:</strong> ${password}</p>
    <hr/>
    <p style="color:#888;font-size:12px;">
      This email was sent in Confidential Mode and expires in 24 hours.<br/>
      Do not share these credentials.
    </p>
  `

  const raw = Buffer.from(
    `From: ${process.env.GMAIL_SENDER_EMAIL}\n` +
    `To: ${to}\n` +
    `Subject: Your credentials for ${toolName}\n` +
    `MIME-Version: 1.0\n` +
    `Content-Type: text/html; charset=utf-8\n` +
    `X-Gm-Confidential-Mode: 1\n` +
    `X-Gm-Expiry: ${expiryTimestamp}\n\n` +
    htmlBody
  ).toString('base64url')

  await gmail.users.messages.send({
    userId: 'me',
    requestBody: { raw },
  })
}
```

---

## 10.4 Confidential Mode Headers

| Header | Value | Effect |
|--------|-------|--------|
| `X-Gm-Confidential-Mode` | `1` | Enables Confidential Mode |
| `X-Gm-Expiry` | Unix timestamp (seconds) | Message expires at this time |

---

## 10.5 Limitations

- Confidential Mode is a Gmail-side feature — the API does not natively expose it as a structured parameter. The headers above achieve the same effect when sending from a Gmail account.
- SMS passcode requirement can be added via the Gmail UI but is not controllable via API.
- The sender must be a Gmail or Google Workspace account.
