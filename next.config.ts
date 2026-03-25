import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  // Silence Next.js 16 Turbopack/Webpack conflict warning by providing an empty turbopack config.
  turbopack: {},

  // Enable async WebAssembly for production builds (webpack).
  // Turbopack (used in `next dev`) handles WASM natively via new URL(..., import.meta.url).
  webpack(config) {
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
      layers: true,
    };
    return config;
  },
};

export default nextConfig;
