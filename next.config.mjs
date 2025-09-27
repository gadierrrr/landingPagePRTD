/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['puertoricotraveldeals.com', 'localhost'],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 86400, // 24 hours
    dangerouslyAllowSVG: false, // Security: disable SVG optimization
    // Allow local images to be served without optimization on mobile if needed
    unoptimized: process.env.NODE_ENV === 'development',
  },
};
export default nextConfig;
