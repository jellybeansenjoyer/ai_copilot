function trimTrailingSlash(url: string): string {
  return url.replace(/\/$/, '');
}

/**
 * Some deployments mistakenly set `NEXT_PUBLIC_API_BASE_URL` to the Next.js app
 * (often with a trailing `/api`), which turns `/auth/signup` into `/api/auth/signup`
 * and triggers CORS against the wrong host. Strip that suffix.
 */
function normalizePublicApiBase(url: string): string {
  let u = trimTrailingSlash(url);
  if (/\/api$/i.test(u)) {
    u = u.replace(/\/api$/i, '');
  }
  return u;
}

const DEFAULT_SERVER_DEV_API = 'http://127.0.0.1:2999';

/**
 * Base URL for the Nest API.
 *
 * - **Browser + `next dev`**: uses same-origin `/nest/...` (rewritten to Nest) so requests are not cross-origin and are not blocked by CORS.
 * - **Browser + production**: requires `NEXT_PUBLIC_API_BASE_URL`.
 * - **Server** (Route Handlers, `getServerSession`, etc.): `API_BASE_URL` or `NEXT_PUBLIC_API_BASE_URL`, else `http://127.0.0.1:2999` in dev.
 */
export function getApiBaseUrl(): string {
  const isBrowser = typeof window !== 'undefined';

  if (isBrowser && process.env.NODE_ENV === 'development') {
    return '/nest';
  }

  if (isBrowser) {
    const raw = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!raw) {
      throw new Error(
        'Set NEXT_PUBLIC_API_BASE_URL to your deployed Nest API origin (production).',
      );
    }
    return normalizePublicApiBase(raw);
  }

  const raw = process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL;
  if (raw) {
    return normalizePublicApiBase(raw);
  }

  if (process.env.NODE_ENV !== 'production') {
    return DEFAULT_SERVER_DEV_API;
  }

  throw new Error(
    'Set API_BASE_URL or NEXT_PUBLIC_API_BASE_URL for server-side calls to the Nest API.',
  );
}
