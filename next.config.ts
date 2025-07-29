import { NextConfig } from 'next';

const nextConfig: NextConfig = {
  webpack: (config, { nextRuntime }) => {
    if (nextRuntime === "nodejs") {
      config.resolve.alias.canvas = false;
    }

    // Prevent Webpack from bundling the native `canvas` module
    // config.resolve = config.resolve || {};
    // config.resolve.fallback = {
    //   ...(config.resolve.fallback || {}),
    //   canvas: false,
    //   fs: false,
    //   path: false,
    // };
    return config;
  },
};

export default nextConfig;