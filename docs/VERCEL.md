# Vercel (this repo: Next.js only)

Production site: **https://reimage-three.vercel.app**  
Production API (separate repo): **https://ai-copilot-backend.vercel.app**

Import **this GitHub repo** into Vercel; root directory is the app root (where `package.json` lives).

## Vercel → Environment variables (Production)

Paste the same values you keep in `.env.production.example` (secrets only in Vercel, not in git).

| Variable | Example value |
|----------|----------------|
| `NEXT_PUBLIC_API_BASE_URL` | `https://ai-copilot-backend.vercel.app` — **Nest API host only** (no `/api` suffix; using the Next URL breaks signup with CORS). |
| `API_BASE_URL` | Same as `NEXT_PUBLIC_API_BASE_URL`. |
| `NEXTAUTH_URL` | `https://reimage-three.vercel.app` |
| `NEXTAUTH_SECRET` | Strong random string |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google OAuth Web client |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Profile uploads (optional) |
| `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` | Unsigned preset (optional) |

`NEXT_PUBLIC_*` are inlined at **build** time — change them → **Redeploy**.

If `NEXT_PUBLIC_API_BASE_URL` is accidentally set to another `*.vercel.app` URL (often a preview deployment or the Next app), the client still calls the wrong host and you see CORS on `/api/auth/...`. The app **detects that at runtime** on `reimage-three.vercel.app` (and when the API host equals the page host on Vercel) and **falls back** to `https://ai-copilot-backend.vercel.app` unless you set `NEXT_PUBLIC_DISABLE_NEST_ORIGIN_GUARD=true`. You should still set the env vars correctly in Vercel.

## Google Cloud Console

- **Authorized JavaScript origins:** `https://reimage-three.vercel.app`
- **Authorized redirect URIs:** `https://reimage-three.vercel.app/api/auth/callback/google`

## Backend CORS

The API project must include `https://reimage-three.vercel.app` in `CORS_ORIGINS`. For **preview** frontends (`*.vercel.app`), set `CORS_ALLOW_VERCEL_PREVIEW=true` on the API (see backend `docs/VERCEL.md`).
