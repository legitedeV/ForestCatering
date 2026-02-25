const path = require('path');

const standaloneCwd = path.resolve(__dirname, '.next/standalone/apps/web');

module.exports = {
  apps: [{
    name: 'forestcatering',
    cwd: standaloneCwd,
    script: path.resolve(standaloneCwd, 'server.js'),
    exec_mode: 'fork',
    instances: 1,
    autorestart: true,
    max_memory_restart: '500M',
    env_file: path.resolve(__dirname, '../../ops/.env'),
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      HOME_PAGE_SLUG: 'bar',
    },
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    error_file: path.resolve(__dirname, '../../ops/logs/pm2-error.log'),
    out_file: path.resolve(__dirname, '../../ops/logs/pm2-out.log'),
    merge_logs: true,
  }],
};
