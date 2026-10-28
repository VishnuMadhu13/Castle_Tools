# 1. Introduction

## 1.1 Purpose

This Software Requirements Specification (SRS) defines the complete functional and non-functional requirements for **CredVault** — a web-based platform that enables authenticated users to request login credentials for registered tools, delivered securely via Gmail's Confidential Mode with a 24-hour expiry.

---

## 1.2 Project Scope

CredVault provides:

- A **Google OAuth login flow** via NextAuth.js
- A **tools dashboard** where users browse available tools
- A **secure credential request flow** — credentials are emailed via Gmail Confidential Mode and expire in 1 day
- An **admin panel** (`/admin`) to manage tools, credentials, and users
- **Role-based access** — `isAdmin` flag per user, togglable from the admin panel

---

## 1.3 Definitions & Acronyms

| Term | Definition |
|------|------------|
| **CredVault** | The platform described in this SRS |
| **Tool** | A third-party service/app whose credentials are stored in CredVault |
| **Credential** | Username/password pair stored against a Tool |
| **NextAuth** | Authentication library for Next.js |
| **Drizzle ORM** | TypeScript-first ORM for PostgreSQL |
| **isAdmin** | Boolean flag on the User record granting admin access |
| **Confidential Mode** | Gmail feature that prevents forwarding and sets message expiry |
| **shadcn/ui** | Unstyled accessible component library for React |

---

## 1.4 Tech Stack

| Technology | Role |
|------------|------|
| **Next.js 15** (App Router) | Full-stack React framework |
| **Bun** | JavaScript runtime & package manager |
| **NextAuth.js v5** | Authentication (Google OAuth provider) |
| **Drizzle ORM** | Database access layer |
| **PostgreSQL** | Primary relational database |
| **shadcn/ui + Tailwind CSS** | UI component library (dark theme) |
| **Gmail API (Confidential)** | Credential delivery via email |
| **TypeScript** | Language throughout |
