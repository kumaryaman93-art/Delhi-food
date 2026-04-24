/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com", // Google profile photos
      },
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com", // Firebase Storage
      },
      {
        protocol: "https",
        hostname: "*.googleusercontent.com", // Any Google user content
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com", // Menu item photos
      },
      {
        protocol: "https",
        hostname: "plus.unsplash.com", // Unsplash plus
      },
    ],
  },
  experimental: {
    serverComponentsExternalPackages: [
      "firebase-admin",
      "@google-cloud/firestore",
      "@opentelemetry/api",
    ],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Prevent webpack from trying to bundle native Node.js modules
      config.externals = [
        ...(Array.isArray(config.externals) ? config.externals : [config.externals].filter(Boolean)),
        "firebase-admin",
        "@google-cloud/firestore",
        "@opentelemetry/api",
      ];
    }
    return config;
  },
};

export default nextConfig;
