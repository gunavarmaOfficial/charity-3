/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: false, // Use Next.js image optimization unless explicitly needed
    domains: ["images.unsplash.com"], // Whitelisted image domains
    formats: ["image/avif", "image/webp"], // Modern formats
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
};

module.exports = nextConfig;
