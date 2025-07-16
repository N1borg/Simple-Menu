import type { NextConfig } from "next";
import withPWA from "next-pwa";

const isProduction = process.env.NODE_ENV === "production";

const pwa = withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
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
            { key: 'X-Frame-Options', value: 'DENY' },
            { key: 'X-Content-Type-Options', value: 'nosniff' },
            { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
            { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
            { key: 'X-XSS-Protection', value: '1; mode=block' },
            { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
          ],
        },
      ];
    },
  }),
};

export default pwa(nextConfig as any);
