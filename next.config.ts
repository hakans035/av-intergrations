import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Bundle optimization
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },

  // Security headers
  async headers() {
    // Common security headers (without frame restrictions)
    const commonHeaders = [
      {
        key: 'X-DNS-Prefetch-Control',
        value: 'on',
      },
      {
        key: 'Strict-Transport-Security',
        value: 'max-age=63072000; includeSubDomains; preload',
      },
      {
        key: 'X-Content-Type-Options',
        value: 'nosniff',
      },
      {
        key: 'X-XSS-Protection',
        value: '1; mode=block',
      },
      {
        key: 'Referrer-Policy',
        value: 'strict-origin-when-cross-origin',
      },
      {
        key: 'Permissions-Policy',
        value: 'camera=(), microphone=(), geolocation=()',
      },
    ];

    // CSP for calculator pages (allow embedding from anywhere)
    const calculatorCSP = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://js.stripe.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https://www.google-analytics.com https://www.googletagmanager.com https://*.stripe.com",
      "font-src 'self'",
      "connect-src 'self' http://127.0.0.1:54321 http://localhost:54321 https://*.supabase.co https://www.google-analytics.com https://analytics.google.com https://*.google-analytics.com https://www.googletagmanager.com https://api.stripe.com",
      "frame-src 'self' https://js.stripe.com https://hooks.stripe.com",
      "frame-ancestors *",  // Allow embedding from any domain
      "form-action 'self'",
      "base-uri 'self'",
    ].join('; ');

    // CSP for other pages (restrict embedding)
    const defaultCSP = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://js.stripe.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https://www.google-analytics.com https://www.googletagmanager.com https://*.stripe.com",
      "font-src 'self'",
      "connect-src 'self' http://127.0.0.1:54321 http://localhost:54321 https://*.supabase.co https://www.google-analytics.com https://analytics.google.com https://*.google-analytics.com https://www.googletagmanager.com https://api.stripe.com",
      "frame-src 'self' https://js.stripe.com https://hooks.stripe.com",
      "frame-ancestors 'self'",
      "form-action 'self'",
      "base-uri 'self'",
    ].join('; ');

    return [
      // Calculator pages - allow iframe embedding
      {
        source: '/calculators/:path*',
        headers: [
          ...commonHeaders,
          {
            key: 'Content-Security-Policy',
            value: calculatorCSP,
          },
        ],
      },
      // All other pages - restrict iframe embedding
      {
        source: '/((?!calculators).*)',
        headers: [
          ...commonHeaders,
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'Content-Security-Policy',
            value: defaultCSP,
          },
        ],
      },
    ];
  },
};

export default nextConfig;
