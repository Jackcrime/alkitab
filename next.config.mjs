import withPWA from "@ducanh2912/next-pwa";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

export default withPWA({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === "development",
  workboxOptions: {
    disableDevLogs: true,
    runtimeCaching: [
      {
        // Cache semua file JSON Alkitab (static data)
        urlPattern: /\/bible\/.*\.json$/,
        handler: "CacheFirst",
        options: {
          cacheName: "bible-data",
          expiration: { maxEntries: 250, maxAgeSeconds: 60 * 60 * 24 * 365 },
        },
      },
    ],
  },
})(nextConfig);
