import { execSync } from 'node:child_process'
import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'

const NO_INDEX = process.env.NO_INDEX === 'true'

const nextConfig: NextConfig = {
  output: 'standalone',
  // Next 15 requires generateBuildId to never return undefined
  generateBuildId: () => {
    try {
      const sha = execSync('git rev-parse HEAD', { encoding: 'utf-8' }).trim()

      if (sha) {
        return sha
      }
    } catch {}

    const envSha =
      process.env.GITHUB_SHA ?? process.env.VERCEL_GIT_COMMIT_SHA ?? process.env.COMMIT_SHA

    return envSha ?? null
  },

  async headers() {
    if (!NO_INDEX) {
      return []
    }

    return [
      {
        source: '/:path*',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      },
    ]
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'forestbar.pl' },
      { protocol: 'https', hostname: 'www.forestbar.pl' },
      { protocol: 'http', hostname: 'localhost' },
    ],
  },
}

export default withPayload(nextConfig)
