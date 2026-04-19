declare module "next-pwa" {
  import type { NextConfig } from "next";

  interface PwaOptions {
    dest?: string;
    disable?: boolean;
    register?: boolean;
    skipWaiting?: boolean;
    /** Regexp patterns for entries to exclude from the precache manifest */
    buildExcludes?: Array<string | RegExp>;
    /** Regexp patterns for public files to exclude from the precache manifest */
    publicExcludes?: string[];
  }

  type WithPwa = (config: NextConfig) => NextConfig;

  export default function withPWAInit(options?: PwaOptions): WithPwa;
}
