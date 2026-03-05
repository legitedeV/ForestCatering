module.exports = {
  apps: [
    {
      name: 'forest-hub',
      cwd: './apps/web',
      script: '.next/standalone/apps/web/server.js',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        HOSTNAME: '0.0.0.0',
      },
      instances: 1,
      exec_mode: 'fork',
      max_memory_restart: '512M',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      error_file: './logs/error.log',
      out_file: './logs/out.log',
      merge_logs: true,
    },
  ],
};
