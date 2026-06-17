/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: false, // Use Next.js image optimization unless explicitly needed
    domains: [
      "images.unsplash.com",
      "fvcxbtoiboxrlyncvjsr.supabase.co",
      "encrypted-tbn0.gstatic.com",
      "s3.ap-south-1.amazonaws.com",
      "donate.oxfamindia.org",
      "www.globalgiving.org",
      "media.istockphoto.com",
      "startup-template-sage.vercel.app"
    ], // Whitelisted image domains
    formats: ["image/avif", "image/webp"], // Modern formats
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
};

module.exports = nextConfig;
