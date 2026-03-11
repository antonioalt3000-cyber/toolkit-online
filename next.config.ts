import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: '/google1423c27583e4abe5.html',
          destination: '/api/google-verification',
        },
      ],
      afterFiles: [],
      fallback: [],
    };
  },
};

export default nextConfig;
