import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Ignora los errores de tipos durante la construcción en Vercel
    ignoreBuildErrors: true,
  },
  eslint: {
    // Ignora advertencias de código durante la construcción
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;