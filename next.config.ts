import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**", // permite qualquer host HTTPS (admin controla as URLs)
      },
    ],
  },
};

export default nextConfig;