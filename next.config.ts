import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compress: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**", // permite qualquer host HTTPS (admin controla as URLs)
      },
    ],
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;