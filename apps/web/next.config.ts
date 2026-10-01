import type { NextConfig } from "next";
import { loadEnvConfig } from "@next/env";
import path from "path";

// Load `.env` from monorepo root (not only apps/web).
loadEnvConfig(path.resolve(__dirname, "../.."));

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
      {
        protocol: "https",
        hostname: "**.cdninstagram.com",
      },
      {
        protocol: "https",
        hostname: "**.fbcdn.net",
      },
    ],
  },
};

export default nextConfig;
