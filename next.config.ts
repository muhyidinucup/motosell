import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  
  // 1. Amunisi Utama Next.js 16 agar library sharp tidak crash di server
  serverExternalPackages: ['sharp'],

  // 2. Melonggarkan gerbang payload Server Actions agar muat banyak foto Base64 sekaligus
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;