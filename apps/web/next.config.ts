import { config as loadRootEnv } from "dotenv";
import type { NextConfig } from "next";
import { resolve } from "node:path";
import withPWAInit from "@ducanh2912/next-pwa";

loadRootEnv({ path: resolve(__dirname, "../../.env") });

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  workboxOptions: {
    runtimeCaching: [
      {
        urlPattern: /^https?:\/\/.*\/api\/.*/i,
        handler: "NetworkFirst",
        options: { cacheName: "api" },
      },
      {
        urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/i,
        handler: "CacheFirst",
        options: { cacheName: "images" },
      },
    ],
  },
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@lingoflow/shared-types"],
  /** Proxifica la API Nest bajo el mismo dominio que el front (un solo link público). Ver `getApiBase` en `src/lib/api.ts`. */
  async rewrites() {
    const upstream =
      process.env.API_UPSTREAM_URL?.replace(/\/$/, "") ??
      "http://127.0.0.1:3001";
    return [
      {
        source: "/api/nest/:path*",
        destination: `${upstream}/:path*`,
      },
    ];
  },
};

export default withPWA(nextConfig);
