import type { NextConfig } from "next";

const backendUrl = process.env.BACKEND_URL ?? "http://localhost:8000";

const nextConfig: NextConfig = {
  output: "standalone",
  async rewrites() {
    return [
      { source: "/health", destination: `${backendUrl}/health` },
      { source: "/api/tasks", destination: `${backendUrl}/api/tasks` },
      {
        source: "/api/tasks/:path*",
        destination: `${backendUrl}/api/tasks/:path*`,
      },
      { source: "/ai/breakdown", destination: `${backendUrl}/ai/breakdown` },
    ];
  },
};

export default nextConfig;
