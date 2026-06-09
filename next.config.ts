import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  
  // 🔥 DI NEXT.JS 16, SHARP WAJIB DITARUH DI SINI (TINGKAT UTAMA CHIEF, BUKAN EXPERIMENTAL!)
  serverExternalPackages: ['sharp']
};

export default nextConfig;