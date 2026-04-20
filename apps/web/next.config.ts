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
};

export default withPWA(nextConfig);
