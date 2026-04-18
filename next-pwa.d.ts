declare module "next-pwa" {
  import type { NextConfig } from "next";

  interface PwaOptions {
    dest?: string;
    disable?: boolean;
    register?: boolean;
    skipWaiting?: boolean;
  }

  type WithPwa = (config: NextConfig) => NextConfig;

  export default function withPWAInit(options?: PwaOptions): WithPwa;
}
