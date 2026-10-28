# 13. Open Items & Future Scope

---

## Open Items (Needs Decision Before Build)

| Item | Question |
|------|----------|
| Modal vs page | Should "Get Credentials" open a modal or navigate to `/tools/[id]`? Modal recommended for better UX. |
| Icon storage | Tool icons — external URL or file upload to object storage (e.g. S3 / Cloudflare R2)? |
| Gmail sender | Use a dedicated service Gmail account or the admin's own Gmail for sending? |
| Rate limit store | Rate limiting for credential send — use DB (`credentialRequests` table) or Redis? |

---

## Future Scope

### Short-term (next iteration)
- **Audit log page** in admin panel — table of who requested which tool's credentials and when
- **Multiple credentials per tool** — e.g. dev vs prod accounts, selectable before sending
- **Tool categories / tags** — group tools for easier browsing

### Medium-term
- **Credential expiry & rotation reminders** — alert admin when a credential hasn't been rotated in X days
- **SMS passcode enforcement** — prompt for phone number to receive Gmail Confidential Mode passcode
- **Admin analytics dashboard** — charts of requests per tool, most active users

### Long-term
- **Webhook notifications** — notify Slack / Teams when credentials are sent
- **TOTP / 2FA for admin panel** — extra security layer for admin access
- **Self-service credential rotation** — tools can push new credentials via webhook
- **Mobile app** — React Native companion for credential access on the go
