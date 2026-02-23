import { execSync } from 'child_process'
import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'standalone',
  generateBuildId: () => {
    try {
      return execSync('git rev-parse HEAD', { encoding: 'utf-8' }).trim()
    } catch (err) {
      console.warn('generateBuildId: git rev-parse HEAD failed, using Next.js default.', err)
      return undefined // fallback to Next.js default
    }
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
