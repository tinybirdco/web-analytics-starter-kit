/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['s2.googleusercontent.com'],
  },
}

module.exports = nextConfig
