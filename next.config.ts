import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Enable system TLS certificates for Google Fonts and other external resources
    turbopack: {
      useSystemTlsCerts: true,
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.clerk.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
      },
    ],
  },
};

export default nextConfig;
