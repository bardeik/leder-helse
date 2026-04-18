import type { NextConfig } from "next";
import withPWAInit from "next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: false,
  skipWaiting: false
});

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: true
};

export default withPWA(nextConfig);
