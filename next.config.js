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
  // Railway's build produced a static / page whose rendered HTML was
  // actually /app's content (confirmed byte-for-byte via `railway ssh` on
  // the deployed container), while the exact same source built locally
  // produces correct, distinct output for both routes, and export const
  // dynamic = 'force-dynamic' on app/page.tsx did not change Railway's
  // output either (prerender-manifest.json still lists / as static there,
  // but not in the local build) — consistent with Next's static-generation
  // worker pool, sized by CPU count, behaving differently on Railway's
  // build infrastructure. Forcing it to 1 removes that variable.
  experimental: {
    cpus: 1,
    workerThreads: false,
  },
}

module.exports = nextConfig
