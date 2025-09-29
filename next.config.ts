import type { NextConfig } from "next";

const isProduction = process.env.NODE_ENV === "production";

// Import next-pwa without TypeScript types (it's a JS-only package)
const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  // Allow dev access from LAN and localhost for Next.js 15+ CORS warning
  ...(process.env.NODE_ENV !== 'production' && {
    allowedDevOrigins: [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      // Add your LAN IP(s) below as needed
      'http://192.168.1.22:3000',
    ],
  }),
  images: {
    unoptimized: !isProduction, // Optimize in production only
    ...(isProduction && {
      formats: ["image/webp", "image/avif"],
      deviceSizes: [640, 750, 828, 1080, 1200, 1920],
      imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
      remotePatterns: [
        {
          protocol: "https",
          hostname: "res.cloudinary.com",
          port: "",
          pathname: "/**",
        },
      ],
    }),
  },

  // Disable TypeScript type checking during build for faster builds
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Production-only optimizations
  ...(isProduction && {
    experimental: {
      optimizeCss: true,
    },

    // Bundle optimization for better performance
    webpack: (config, { isServer, dev }) => {
      if (!dev && !isServer) {
        config.optimization.splitChunks = {
          chunks: 'all',
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              priority: 10,
              reuseExistingChunk: true,
            },
          },
        };
      }
      return config;
    },
    
    // Security headers - maximum protection
    async headers() {
      return [
        {
          source: '/(.*)',
          headers: [
            { key: 'X-Frame-Options', value: 'SAMEORIGIN' }, // 'DENY' can break some integrations, 'SAMEORIGIN' is safer
            { key: 'X-Content-Type-Options', value: 'nosniff' },
            { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
            { key: 'Permissions-Policy', value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
            { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
            // X-XSS-Protection is deprecated in modern browsers, but harmless to keep
            { key: 'X-XSS-Protection', value: '1; mode=block' },
            // Content-Security-Policy is best set at the CDN/proxy, but you can add a basic one here if needed:
            // { key: 'Content-Security-Policy', value: "default-src 'self'; img-src * data:; script-src 'self'; style-src 'self' 'unsafe-inline'; object-src 'none';" },
          ],
        },
      ];
    },
  }),
};

export default withPWA(nextConfig as any);
