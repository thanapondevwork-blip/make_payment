import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['*.devtunnels.ms', '*.ngrok.io', '*.ngrok-free.app'],
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
      allowedOrigins: ['*.devtunnels.ms', '*.ngrok.io', '*.ngrok-free.app', 'localhost:3000'],
    },
  },
};

export default nextConfig;
