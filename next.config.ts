import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        // 👇 ADD THIS BLOCK FOR YOUR SUPABASE IMAGES
        protocol: 'https',
        hostname: 'iqanclolgidycigjdicj.supabase.co', 
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;