/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  eslint: {
    dirs: ['app', 'scripts', 'tests'],
  },
  trailingSlash: true,
}

export default nextConfig
