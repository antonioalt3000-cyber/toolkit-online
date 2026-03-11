import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.toolkitonline.vip' }],
        destination: 'https://toolkitonline.vip/:path*',
        permanent: true,
      },
    ];
  },
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
