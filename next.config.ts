import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    // Handle PDF.js worker and canvas issues
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        canvas: false,
        fs: false,
      };
    }

    // Configure PDF.js
    config.module.rules.push({
      test: /pdf\.worker\.(min\.)?js/,
      type: "asset/resource",
      generator: {
        filename: "static/worker/[hash][ext][query]",
      },
    });

    return config;
  },
  experimental: {
    turbo: {
      rules: {
        "*.worker.js": {
          loaders: ["file-loader"],
          as: "*.js",
        },
      },
    },
  },
};

export default nextConfig;
