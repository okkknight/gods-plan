/** @type {import('next').NextConfig} */
const nextConfig = {
  typedRoutes: true,
  basePath: process.env.NEXT_PUBLIC_BASE_PATH ?? "",
  // Keep the hot-reload server isolated from production builds.
  distDir: process.env.NODE_ENV === "development" ? ".next-dev" : ".next",
};

module.exports = nextConfig;
