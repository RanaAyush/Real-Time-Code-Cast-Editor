import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  devIndicators: false,
  reactStrictMode: false,

  eslint: {
    ignoreDuringBuilds: true, // ✅ Disables ESLint during builds
  },
};

export default nextConfig;
