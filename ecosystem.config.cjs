module.exports = {
  apps: [
    {
      name: "forestcatering",
      cwd: "/home/forest/ForestCatering",
      script: "apps/web/.next/standalone/apps/web/server.js",
      env: {
        NODE_ENV: "production",
        PORT: "3000",
        HOSTNAME: "0.0.0.0",

        DATABASE_URI: process.env.DATABASE_URI,
        PAYLOAD_SECRET: process.env.PAYLOAD_SECRET,
        NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
        PAYLOAD_PREVIEW_SECRET: process.env.PAYLOAD_PREVIEW_SECRET,
        PAYLOAD_REVALIDATE_SECRET: process.env.PAYLOAD_REVALIDATE_SECRET,
      },
    },
  ],
};
