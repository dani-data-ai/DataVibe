/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  // Enable static export for Netlify
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  // Remove rewrites for static export
  // API calls will go directly to NEXT_PUBLIC_API_URL
}

module.exports = nextConfig