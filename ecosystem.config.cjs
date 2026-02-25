const path = require('path')

const standaloneCwd = path.resolve(__dirname, 'apps/web/.next/standalone/apps/web')

module.exports = {
  apps: [
    {
      name: 'forestcatering',
      cwd: standaloneCwd,
      script: path.resolve(standaloneCwd, 'server.js'),
      exec_mode: 'cluster',
      instances: 'max',
      env: {
        NODE_ENV: 'production',
        PORT: process.env.PORT || '3000',
        HOSTNAME: '0.0.0.0',
        DATABASE_URL: process.env.DATABASE_URL || process.env.DATABASE_URI,
        DATABASE_URI: process.env.DATABASE_URI || process.env.DATABASE_URL,
        PAYLOAD_SECRET: process.env.PAYLOAD_SECRET,
        NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
        PAYLOAD_PREVIEW_SECRET: process.env.PAYLOAD_PREVIEW_SECRET,
        PAYLOAD_REVALIDATE_SECRET: process.env.PAYLOAD_REVALIDATE_SECRET,
        HOME_PAGE_SLUG: process.env.HOME_PAGE_SLUG || 'home',
      },
    },
  ],
}
