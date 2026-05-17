import type { NextConfig } from 'next';

/** Nest URL for dev rewrites (browser → same-origin `/nest` → Nest, avoids CORS). */
const NEST_DEV_TARGET = process.env.BACKEND_PROXY_TARGET ?? 'http://127.0.0.1:2999';

const nextConfig: NextConfig = {
  images: {
    domains: ['res.cloudinary.com', 'lh3.googleusercontent.com', 'miro.medium.com'],
  },
  async rewrites() {
    if (process.env.NODE_ENV === 'production') {
      return [];
    }
    const base = NEST_DEV_TARGET.replace(/\/$/, '');
    return [
      {
        source: '/nest/:path*',
        destination: `${base}/:path*`,
      },
    ];
  },
};

export default nextConfig;
