import type { NextConfig } from "next";

const securityHeaders = [
  { key: 'X-Content-Type-Options',    value: 'nosniff' },
  { key: 'X-Frame-Options',           value: 'SAMEORIGIN' },
  { key: 'Referrer-Policy',           value: 'strict-origin-when-cross-origin' },
  { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
  { key: 'Permissions-Policy',        value: 'camera=(), microphone=(), geolocation=()' },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.getyourguide.com https://*.easyterra.com https://*.distribusion.com https://*.rentalcars.com https://*.book-online-transfers.com https://book-online-transfers.com https://*.loungepair.com https://*.googletagmanager.com https://*.google-analytics.com",
      "script-src-elem 'self' 'unsafe-inline' https://*.getyourguide.com https://*.easyterra.com https://*.distribusion.com https://*.rentalcars.com https://*.book-online-transfers.com https://book-online-transfers.com https://*.loungepair.com https://*.googletagmanager.com https://*.google-analytics.com",
      "connect-src 'self' https:",
      "img-src 'self' data: blob: https:",
      "style-src 'self' 'unsafe-inline' https:",
      "frame-src 'self' https://*.getyourguide.com https://*.easyterra.com https://*.distribusion.com https://*.rentalcars.com https://*.book-online-transfers.com https://book-online-transfers.com https://*.loungepair.com",
      "frame-ancestors 'self'",
    ].join('; '),
  },
]

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ]
  },
}

export default nextConfig;
