import { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    // Handle canvas package for PDF.js
    if (isServer) {
      // Allow canvas to be bundled on the server side
      config.externals = config.externals || [];
      config.externals.push({
        canvas: "canvas",
      });
    } else {
      // Prevent canvas from being bundled on the client side
      config.resolve.alias = {
        ...config.resolve.alias,
        canvas: false,
      };
    }

    // Additional fallbacks for client-side
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      os: false,
    };

    return config;
  },
  // Add serverExternalPackages for better canvas handling
  serverExternalPackages: ["canvas"],
};

export default nextConfig;
