import type { NextConfig } from "next";
import { loadEnvConfig } from "@next/env";
import path from "path";

// Load `.env` from monorepo root (not only apps/web).
loadEnvConfig(path.resolve(__dirname, "../.."));

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;
