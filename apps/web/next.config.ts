import { withPayload } from '@payloadcms/next/withPayload';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.builder.io',
      },
      {
        protocol: 'https',
        hostname: 'forestbar.pl',
      },
    ],
  },
  webpack(config) {
    // GLSL shader support
    config.module.rules.push({
      test: /\.(glsl|vert|frag)$/,
      type: 'asset/source',
    });
    return config;
  },
};

export default withPayload(nextConfig);
