import type { MetadataRoute } from 'next'

const NO_INDEX = process.env.NO_INDEX === 'true'

export default function robots(): MetadataRoute.Robots {
  if (NO_INDEX) {
    return {
      rules: {
        userAgent: '*',
        disallow: '/',
      },
    }
  }

  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
  }
}
