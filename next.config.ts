import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  serverExternalPackages: ['@prisma/client', '@prisma/engines'],

  // Empty turbopack config to silence the warning
  turbopack: {},

  // CORS Configuration for API routes
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "*" // อนุญาตทุก origin (สำหรับ development)
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, POST, PUT, DELETE, PATCH, OPTIONS"
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type, Authorization, X-Requested-With"
          },
          {
            key: "Access-Control-Allow-Credentials",
            value: "true"
          },
          {
            key: "Access-Control-Max-Age",
            value: "86400" // 24 hours
          }
        ],
      },
    ];
  },
};

export default nextConfig;
