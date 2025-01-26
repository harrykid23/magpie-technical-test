import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    turbo: {
      root: "..",
      resolveAlias: {
        "@shared": "../shared",
      },
    },
  },
};

export default nextConfig;
