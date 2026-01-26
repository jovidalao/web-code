import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  experimental: {
    turbo: {
      resolveAlias: {
        tailwindcss: path.resolve("./node_modules/tailwindcss"),
        "tw-animate-css": path.resolve("./node_modules/tw-animate-css"),
      },
    },
  },
};

export default nextConfig;
