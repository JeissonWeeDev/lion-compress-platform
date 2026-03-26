import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  // Silence Next.js 16 Turbopack/Webpack conflict warning by providing an empty turbopack config.
  turbopack: {},

  // Handle WASM files used by @jsquash/oxipng in the image worker.
  //
  // DO NOT use asyncWebAssembly: true — it causes webpack's optimizer to deadlock
  // when a WASM file is reached through:
  //   Worker entry → dynamic import chunk → WebAssembly async module
  // That triple nesting creates a cycle in webpack 5's chunk graph.
  //
  // Instead, treat .wasm as a plain asset: webpack copies it to the output dir
  // and replaces new URL('*.wasm', import.meta.url) with the correct runtime URL.
  // Oxipng's fetch(url) + WebAssembly.instantiateStreaming() then loads it fine.
  // Turbopack (next dev) handles new URL(...) natively — no rule needed there.
  webpack(config, { isServer }) {
    if (!isServer) {
      config.module.rules.push({
        test: /\.wasm$/,
        type: "asset/resource",
      });
    }
    return config;
  },
};

export default nextConfig;
