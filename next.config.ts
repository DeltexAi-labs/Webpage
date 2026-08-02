import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  // Emits .next/standalone with only the files the server needs, which keeps the image small.
  output: "standalone",
};

export default nextConfig;
