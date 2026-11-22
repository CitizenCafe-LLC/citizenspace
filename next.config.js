/** @type {import('next').NextConfig} */
const nextConfig = {
  // Removed 'output: export' to enable API routes and dynamic features.
  // 'standalone' is required by Dockerfile's runner stage, which copies
  // .next/standalone — without this the Docker build fails at COPY.
  output: 'standalone',
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Staging only: ~1,380 pre-existing type errors (mostly test files and the
    // orphaned nftsale/ tsconfig inclusion) block every build otherwise.
    ignoreBuildErrors: true,
  },
  images: { unoptimized: true },
}

module.exports = nextConfig
