const path = require('path');

module.exports = {
  apps: [{
    name: 'forestcatering',
    cwd: __dirname,
    script: path.resolve(__dirname, '.next/standalone/apps/web/server.js'),
    instances: 1,
    autorestart: true,
    max_memory_restart: '500M',
    env_file: path.resolve(__dirname, '../../ops/.env'),
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000,
    },
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    error_file: path.resolve(__dirname, '../../ops/logs/pm2-error.log'),
    out_file: path.resolve(__dirname, '../../ops/logs/pm2-out.log'),
    merge_logs: true,
  }],
};
