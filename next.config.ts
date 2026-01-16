import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ['localhost', 'images.unsplash.com', 'files.edgestore.dev', 'picsum.photos', 'placehold.co'],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8001/api/:path*', // Proxy to Backend
      },
    ];
  },
};

export default nextConfig;
