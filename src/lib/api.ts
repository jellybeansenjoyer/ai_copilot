function trimTrailingSlash(url: string): string {
  return url.replace(/\/$/, '');
}

/** Known production pair — used only when env clearly targets the wrong host. */
const DEFAULT_NEST_ORIGIN = 'https://ai-copilot-backend.vercel.app';
const DEFAULT_PRODUCTION_APP_HOST = 'reimage-three.vercel.app';
const NEST_API_HOST = 'ai-copilot-backend.vercel.app';

/**
 * Strip accidental Next.js URL suffixes. Nest signup is `/auth/signup`, not `/api/auth/signup`.
 * Handles `…/api`, `…/api/auth`, and repeats until stable.
 */
function normalizePublicApiBase(url: string): string {
  let u = trimTrailingSlash(url);
  const suffixes = ['/api/auth', '/api'];
  let changed = true;
  while (changed) {
    changed = false;
    for (const suf of suffixes) {
      const lower = u.toLowerCase();
      const s = suf.toLowerCase();
      if (lower.endsWith(s)) {
        u = u.slice(0, -suf.length);
        changed = true;
      }
    }
    u = trimTrailingSlash(u);
  }
  return u;
}

function hostnameOf(url: string): string | null {
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

/**
 * When the SPA is served from Vercel but `NEXT_PUBLIC_API_BASE_URL` still points at another
 * `*.vercel.app` host (often a preview URL or the Next app), API calls hit Next.js and CORS fails.
 * Force the known Nest origin unless the user opts out.
 */
function guardBrowserApiBase(normalized: string): string {
  if (process.env.NEXT_PUBLIC_DISABLE_NEST_ORIGIN_GUARD === 'true') {
    return normalized;
  }

  const pageHost = window.location.hostname;
  const apiHost = hostnameOf(normalized);
  if (!apiHost) return normalized;

  if (apiHost === NEST_API_HOST) {
    return normalized;
  }

  const pageIsVercel = pageHost.endsWith('.vercel.app');
  const apiIsVercel = apiHost.endsWith('.vercel.app');
  const apiPointsAtSameDeployment = apiHost === pageHost;
  const prodSiteWrongApi =
    pageHost === DEFAULT_PRODUCTION_APP_HOST && apiHost !== NEST_API_HOST;

  if (pageIsVercel && apiIsVercel && (apiPointsAtSameDeployment || prodSiteWrongApi)) {
    console.warn(
      '[getApiBaseUrl] API base pointed at a Vercel app that is not the Nest API; using',
      DEFAULT_NEST_ORIGIN,
    );
    return DEFAULT_NEST_ORIGIN;
  }

  return normalized;
}

function guardServerApiBase(normalized: string): string {
  if (process.env.NEXT_PUBLIC_DISABLE_NEST_ORIGIN_GUARD === 'true') {
    return normalized;
  }
  const authUrl = process.env.NEXTAUTH_URL;
  if (!authUrl) return normalized;
  const authHost = hostnameOf(authUrl);
  const apiHost = hostnameOf(normalized);
  if (!authHost || !apiHost) return normalized;

  if (apiHost === NEST_API_HOST) return normalized;

  const authIsProdSite = authHost === DEFAULT_PRODUCTION_APP_HOST;
  const apiIsVercel = apiHost.endsWith('.vercel.app');
  if (authIsProdSite && apiIsVercel && apiHost !== NEST_API_HOST) {
    console.warn(
      '[getApiBaseUrl] API_BASE_URL does not point at Nest while NEXTAUTH_URL is production; using',
      DEFAULT_NEST_ORIGIN,
    );
    return DEFAULT_NEST_ORIGIN;
  }

  return normalized;
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
    return guardBrowserApiBase(normalizePublicApiBase(raw));
  }

  const raw = process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL;
  if (raw) {
    return guardServerApiBase(normalizePublicApiBase(raw));
  }

  if (process.env.NODE_ENV !== 'production') {
    return DEFAULT_SERVER_DEV_API;
  }

  throw new Error(
    'Set API_BASE_URL or NEXT_PUBLIC_API_BASE_URL for server-side calls to the Nest API.',
  );
}
