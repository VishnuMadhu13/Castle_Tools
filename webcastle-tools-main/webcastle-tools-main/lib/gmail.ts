import { google } from 'googleapis'

const oauth2Client = new google.auth.OAuth2(
  process.env.GMAIL_CLIENT_ID,
  process.env.GMAIL_CLIENT_SECRET,
)
oauth2Client.setCredentials({ refresh_token: process.env.GMAIL_REFRESH_TOKEN })

const gmail = google.gmail({ version: 'v1', auth: oauth2Client })

export async function sendCredentialEmail({
  to,
  toolName,
  viewUrl,
  expiresAt,
}: {
  to: string
  toolName: string
  viewUrl: string
  expiresAt: Date
}) {
  const expiryStr = expiresAt.toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'UTC',
  }) + ' UTC'

  const htmlBody = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#090c10;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#090c10;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="520" cellpadding="0" cellspacing="0" style="max-width:520px;width:100%;">

          <!-- Header / Brand -->
          <tr>
            <td style="background:#101319;border-radius:12px 12px 0 0;padding:24px 32px;border-bottom:1px solid #212730;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="width:36px;height:36px;background:#1d3522;border-radius:8px;text-align:center;vertical-align:middle;font-size:20px;line-height:36px;">
                    🏰
                  </td>
                  <td style="padding-left:10px;vertical-align:middle;">
                    <span style="font-size:18px;font-weight:700;color:#f2f5f3;letter-spacing:-0.01em;">WebCastle Tools</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background:#101319;padding:32px 32px 24px;">
              <h2 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#f2f5f3;line-height:1.3;">
                Credentials ready for<br>
                <span style="color:#29b748;">${toolName}</span>
              </h2>
              <p style="margin:0 0 28px;font-size:14px;color:#848b9a;line-height:1.6;">
                Your secure credential link is ready. Click the button below to view your credentials.
              </p>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                <tr>
                  <td align="center">
                    <a href="${viewUrl}"
                       style="display:inline-block;background:#29b748;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:600;font-size:15px;letter-spacing:0.01em;">
                      View My Credentials &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Expiry Notice -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
                <tr>
                  <td style="background:#1d2130;border-radius:8px;padding:14px 16px;border-left:3px solid #29b748;">
                    <p style="margin:0;font-size:13px;color:#848b9a;line-height:1.6;">
                      <strong style="color:#f2f5f3;">&#9200; Expires at ${expiryStr}</strong><br>
                      After expiry, this link will no longer work.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Security Notice -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:#1d2130;border-radius:8px;padding:14px 16px;">
                    <p style="margin:0;font-size:12px;color:#848b9a;line-height:1.6;">
                      <strong style="color:#f2f5f3;">&#128274; Security notice</strong><br>
                      This link is tied to your account. Do not share it with others.
                      If you did not request this, please ignore this email.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#0f1219;border-radius:0 0 12px 12px;padding:18px 32px;border-top:1px solid #212730;text-align:center;">
              <p style="margin:0;font-size:12px;color:#848b9a;">
                WebCastle Tools &mdash; Internal credential management platform
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`

  const subjectText = `Your credentials for ${toolName} — expires in 24h`
  const encodedSubject = `=?UTF-8?B?${Buffer.from(subjectText).toString('base64')}?=`

  const raw = Buffer.from(
    `From: WebCastle Tools <${process.env.GMAIL_SENDER_EMAIL}>\n` +
    `To: ${to}\n` +
    `Subject: ${encodedSubject}\n` +
    `MIME-Version: 1.0\n` +
    `Content-Type: text/html; charset=utf-8\n\n` +
    htmlBody
  ).toString('base64url')

  await gmail.users.messages.send({
    userId: 'me',
    requestBody: { raw },
  })
}
