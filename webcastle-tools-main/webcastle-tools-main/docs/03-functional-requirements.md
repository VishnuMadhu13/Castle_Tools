# 3. Functional Requirements

---

## 3.1 Authentication (FR-AUTH)

| ID | Requirement | Description | Priority |
|----|-------------|-------------|----------|
| FR-AUTH-01 | Google Login | The app shall provide a "Sign in with Google" button on the landing page (`/`). On click, NextAuth initiates the Google OAuth 2.0 flow. | Must Have |
| FR-AUTH-02 | Session Management | NextAuth shall create a JWT session on successful Google auth. Session persists for 30 days (configurable). Each request checks session validity. | Must Have |
| FR-AUTH-03 | Redirect After Login | After successful login, users are redirected to `/dashboard`. | Must Have |
| FR-AUTH-04 | Sign Out | A "Sign Out" option in the navbar shall invalidate the session and redirect to `/`. | Must Have |
| FR-AUTH-05 | First Login Provisioning | On first login, a `User` record is created in the DB with `isAdmin = false` by default. | Must Have |

---

## 3.2 Tools Dashboard (FR-DASH)

| ID | Requirement | Description | Priority |
|----|-------------|-------------|----------|
| FR-DASH-01 | Tools List Page | Authenticated users at `/dashboard` shall see a grid/list of all active Tools with name, icon/logo, and short description. | Must Have |
| FR-DASH-02 | Tool Card | Each tool card shall show: Tool Name, Tool Icon, Short Description, and a "Get Credentials" button. | Must Have |
| FR-DASH-03 | Empty State | If no tools are configured, show an informative empty state message. | Should Have |
| FR-DASH-04 | Search / Filter | Users should be able to search tools by name in real-time. | Should Have |

---

## 3.3 Credential Request Flow (FR-CRED)

| ID | Requirement | Description | Priority |
|----|-------------|-------------|----------|
| FR-CRED-01 | Request Modal / Page | Clicking "Get Credentials" opens a modal (or navigates to `/tools/[id]`) showing the Tool name and a confirmation to send credentials. | Must Have |
| FR-CRED-02 | Send Credentials Button | A "Send to My Email" button triggers credential delivery via Gmail API. | Must Have |
| FR-CRED-03 | Gmail Confidential Mode | The email shall be sent using **Gmail Confidential Mode**, set to expire in **1 day (24 hours)**. | Must Have |
| FR-CRED-04 | Email Content | The email shall contain: Tool name, username, password, and a note about the expiry. | Must Have |
| FR-CRED-05 | Success Feedback | After sending, show a success toast/message indicating the email was sent to the user's address. | Must Have |
| FR-CRED-06 | Error Feedback | On failure (e.g. Gmail API error), show a descriptive error message. | Must Have |
| FR-CRED-07 | Inline Credential View | After clicking "Send to My Email", also display the credentials **inline** in the modal/page for immediate reference. | Must Have |
| FR-CRED-08 | Rate Limiting | Limit credential send to **once per tool per user per 10 minutes** to prevent abuse. | Should Have |

---

## 3.4 Admin Panel (FR-ADMIN)

| ID | Requirement | Description | Priority |
|----|-------------|-------------|----------|
| FR-ADMIN-01 | Access Control | `/admin` and all sub-routes are only accessible to users where `isAdmin = true`. Others receive a 403 or are redirected to `/`. | Must Have |
| FR-ADMIN-02 | Admin Nav | Admin panel has a sidebar/nav with sections: **Tools**, **Credentials**, **Users**. | Must Have |
| FR-ADMIN-03 | Add Tool | Admin can create a new Tool with: name (required), description, icon URL/upload, `isActive` flag. | Must Have |
| FR-ADMIN-04 | Edit Tool | Admin can edit any field of an existing Tool. | Must Have |
| FR-ADMIN-05 | Delete Tool | Admin can soft-delete (deactivate) a Tool. Soft-deleted tools disappear from `/dashboard`. | Must Have |
| FR-ADMIN-06 | Add Credential | Admin can attach a credential set (username + password) to a Tool. | Must Have |
| FR-ADMIN-07 | Edit Credential | Admin can update the credential set for any Tool. | Must Have |
| FR-ADMIN-08 | User List | Admin can see a list of all registered users: name, email, avatar, `isAdmin` status, joined date. | Must Have |
| FR-ADMIN-09 | Toggle isAdmin | Admin can edit a user record to toggle `isAdmin` on/off. **A user cannot revoke their own admin.** | Must Have |
| FR-ADMIN-10 | Credential Visibility | Admin can view stored credentials (username + password) for any tool from the admin panel. | Must Have |
