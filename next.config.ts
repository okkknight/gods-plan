import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typedRoutes: true,
  // Keep the hot-reload server isolated from production builds. Running
  // `next build` must not replace chunks used by an active dev server.
  distDir: process.env.NODE_ENV === "development" ? ".next-dev" : ".next",
};

export default nextConfig;
