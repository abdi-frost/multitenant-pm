import type { NextConfig } from "next";

/**
 * Next.js Configuration for Core API Module
 * 
 * This is the Core API that serves:
 * - Authentication (Better Auth)
 * - Tenant management
 * - User management
 * - Shared resources
 * 
 * Consumed by:
 * - Project Management App (localhost:3001)
 * - Admin Panel App (localhost:3002)
 */

const nextConfig: NextConfig = {
  // Enable CORS for multi-app architecture
  // async headers() {
  //   const otherOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : [];
  //   const allowedOrigins = otherOrigins.concat([
  //     process.env.PM_APP_URL || 'http://localhost:3001',
  //     process.env.ADMIN_APP_URL || 'http://localhost:3002',
  //   ]);

  //   return [
  //     {
  //       // Apply CORS headers to all API routes
  //       source: '/api/:path*',
  //       headers: [
  //         {
  //           key: 'Access-Control-Allow-Credentials',
  //           value: 'true',
  //         },
  //         {
  //           key: 'Access-Control-Allow-Origin',
  //           value: allowedOrigins.join(','),
  //         },
  //         {
  //           key: 'Access-Control-Allow-Methods',
  //           value: 'GET,DELETE,PATCH,POST,PUT,OPTIONS',
  //         },
  //         {
  //           key: 'Access-Control-Allow-Headers',
  //           value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization',
  //         },
  //       ],
  //     },
  //   ];
  // },

  // Experimental features
  experimental: {
    // Enable server actions if needed
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },

  // Logging
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
};

export default nextConfig;
