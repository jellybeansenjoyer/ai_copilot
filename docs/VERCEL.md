# Vercel (this repo: Next.js only)

Production site: **https://reimage-three.vercel.app**  
Production API (separate repo): **https://ai-copilot-backend.vercel.app**

Import **this GitHub repo** into Vercel; root directory is the app root (where `package.json` lives).

## Vercel → Environment variables (Production)

Paste the same values you keep in `.env.production.example` (secrets only in Vercel, not in git).

| Variable | Example value |
|----------|----------------|
| `NEXT_PUBLIC_API_BASE_URL` | `https://ai-copilot-backend.vercel.app` |
| `API_BASE_URL` | `https://ai-copilot-backend.vercel.app` |
| `NEXTAUTH_URL` | `https://reimage-three.vercel.app` |
| `NEXTAUTH_SECRET` | Strong random string |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google OAuth Web client |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Profile uploads (optional) |
| `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` | Unsigned preset (optional) |

`NEXT_PUBLIC_*` are inlined at **build** time — change them → **Redeploy**.

## Google Cloud Console

- **Authorized JavaScript origins:** `https://reimage-three.vercel.app`
- **Authorized redirect URIs:** `https://reimage-three.vercel.app/api/auth/callback/google`

## Backend CORS

The API project must include `https://reimage-three.vercel.app` in `CORS_ORIGINS` (see the backend repo `docs/VERCEL.md`).
