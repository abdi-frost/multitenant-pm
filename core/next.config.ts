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

  typescript: {
    ignoreBuildErrors: true,
  },

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
