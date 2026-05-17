# ReImage

> Your personal AI assistant to refactor, optimize, and explain your code with one click. 

---

## 🚀 Live Demo

🔗 [Frontend Walkthrough](https://your-deployed-frontend-url.com) *(placeholder)*

🎥 [Video Demo Walkthrough](https://your-youtube-demo-link.com) *(placeholder)*

---

## 🧠 Features

- ✅ Paste or write code snippets.
- ✅ Describe changes you want (e.g. optimize, refactor).
- ✅ View AI-generated updated code.
- ✅ Beautiful **diff viewer** to show what changed.
- ✅ Save sessions per user.
- ✅ View session history from sidebar.
- ✅ Auth via email-password or Google OAuth.
- ✅ Quota-based usage system (deducted per generation).
- ✅ Upload a profile picture during onboarding.

---

## 🧱 Tech Stack

| Layer          | Tech Stack                               | Icon                              |
|----------------|--------------------------------------------|------------------------------------|
| Frontend       | Next.js 14, Tailwind CSS, React           | ![Next.js](https://img.shields.io/badge/-Next.js-black?logo=next.js&logoColor=white) ![Tailwind](https://img.shields.io/badge/-TailwindCSS-06B6D4?logo=tailwindcss&logoColor=white) |
| Backend        | NestJS, TypeScript                        | ![NestJS](https://img.shields.io/badge/-NestJS-E0234E?logo=nestjs&logoColor=white) |
| AI             | OpenAI GPT-4o API                         | ![OpenAI](https://img.shields.io/badge/-OpenAI-412991?logo=openai&logoColor=white) |
| Database       | PostgreSQL via Prisma ORM                 | ![PostgreSQL](https://img.shields.io/badge/-PostgreSQL-336791?logo=postgresql&logoColor=white) |
| Auth           | NextAuth.js (JWT + OAuth)                 | ![NextAuth](https://img.shields.io/badge/-NextAuth.js-black?logo=next.js&logoColor=white) |
| Diff Viewer    | `diff` + custom Tailwind UI               |                                  |
| Deployment     | Frontend → Vercel / Backend → Fly.io/Render | ![Vercel](https://img.shields.io/badge/-Vercel-black?logo=vercel) |

---

## 🏗️ Architecture


graph TD
  A[Frontend - Next.js] -->|REST API| B[Backend - NestJS]
  B --> C[OpenAI GPT API]
  B --> D[PostgreSQL DB (Prisma)]
  A --> E[Auth - NextAuth.js]
  B --> E
  B -->|Quota Deduction| D


---

## 📁 Folder Structure (this workspace)

```bash
ai_copilot/                    # Next.js frontend (this package)
ai_copilot_backend/            # NestJS API + Prisma schema
```

---

## ✨ Core Workflows

### 🧪 Code Diffing Flow

1. User enters **original code** + **requirements**
2. Clicks "Generate Diff"
3. Client checks session access token
4. Sends request to NestJS API `/sessions/diff`
5. Backend:
    - Deducts `1000` units from quota via `PATCH /user/profile`
    - Calls OpenAI API → Gets updated code
    - Stores both in DB (Session model)
6. Returns result
7. Frontend:
    - Renders `diffLines(original, updated)` using color-coded spans
    - Allows user to **Copy Original / Updated**
    - Saves latest session into sidebar history

### ⚠️ Quota Check

- If quota reaches `<= 0`, show alert: `"Please recharge, you have exhausted your daily quota."`

---

## 🔐 Auth System

- Email + Password via `CredentialsProvider`
- Google OAuth via `GoogleProvider`
- JWT strategy to issue token
- Backend receives token and authorizes request via bearer token

---

## 🖼️ Dashboard

- Sidebar:
    - Shows all previous sessions.
    - Clicking session loads original + updated code.
    - Highlights current selection.

- Top right:
    - Profile picture (clickable to update).
    - Logout button.

- Main area:
    - Left: Original Code input
    - Right: Requirements
    - Bottom: Diff Output View (color-coded)

---

## 🧠 Models (Prisma)

```ts
model User {
  id        String    @id @default(uuid())
  email     String    @unique
  password  String?
  quota     Int       @default(1000)
  provider  String?
  name      String?
  picture   String?
  sessions  Session[]
}

model Session {
  id        String   @id @default(uuid())
  user      User     @relation(fields: [userId], references: [id])
  userId    String
  codeInput String
  codeOutput String
  createdAt DateTime @default(now())
}
```

## 🧪 Environment Variables

During `next dev`, the app calls the API via **`/nest/...`** (Next.js rewrites to your Nest server) so the browser does not hit cross-origin CORS. Ensure the API is listening on **`http://127.0.0.1:2999`** (default) or set **`BACKEND_PROXY_TARGET`** in the environment used when starting Next.

```
# Frontend (ai_copilot/)
NEXTAUTH_SECRET=
NEXTAUTH_URL=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
NEXT_PUBLIC_API_BASE_URL=http://localhost:2999
# Optional: server-only override for NextAuth route handlers
# API_BASE_URL=http://localhost:2999
# Optional: if Nest runs on another host/port during `next dev`, set rewrite target (default 127.0.0.1:2999)
# BACKEND_PROXY_TARGET=http://127.0.0.1:2999
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=

# Backend (ai_copilot_backend/) — see ai_copilot_backend/docs/LLM_SETUP.md
# LLM: set ONE of the following (or LLM_PROVIDER to force)
# GROQ_API_KEY=
# GROQ_MODEL=llama-3.3-70b-versatile
# GEMINI_API_KEY=
# GEMINI_MODEL=gemini-2.0-flash
# OPENAI_API_KEY=
# OPENAI_MODEL=gpt-4o-mini
# LLM_PROVIDER=groq
DATABASE_URL=
JWT_SECRET=
JWT_EXPIRES_IN=7d
PORT=2999
CORS_ORIGINS=http://localhost:3000,https://your-frontend.example
# Optional single-origin alias for CORS
# FRONTEND_URL=http://localhost:3000
GOOGLE_CLIENT_ID=
```

---

## 🚀 Deployment

- **Vercel (this app + API repo):** [`docs/VERCEL.md`](./docs/VERCEL.md)  
- **API repo (Nest + Neon):** [`https://github.com/jellybeansenjoyer/ai_copilot_backend`](https://github.com/jellybeansenjoyer/ai_copilot_backend) — see its `docs/VERCEL.md` for `DATABASE_URL`, `CORS_ORIGINS`, and migrations.

### 🧩 Frontend (Vercel)

- This repository is the Next.js root (no extra “Root Directory” subfolder).
- Copy [`./.env.example`](./.env.example) / [`.env.production.example`](./.env.production.example) into Vercel env, then deploy.

### 🧩 Backend

- Deployed separately from the `ai_copilot_backend` repository (Docker / Vercel serverless per that repo’s README and `docs/VERCEL.md`).

---

## 📦 Future Additions

- Stripe for paid quotas
- GitHub/GitLab repo integration
- Multi-file editor support
- Admin dashboard (view users, usage, abuse reports)
- Dark mode toggle
- Notification system

---

## ❤️ Built By

**Raghav Kashyap** – Full-stack Engineer passionate about devtools & AI.

Want to contribute or collaborate? [Email Me](mailto:raghavkash26@gmail.com) or [LinkedIn](https://www.linkedin.com/in/raghavkashyap26/)

> © Refactor. All rights reserved.
