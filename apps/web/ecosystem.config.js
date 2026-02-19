module.exports = {
  apps: [{
    name: 'forestcatering',
    cwd: __dirname,
    script: 'node_modules/.bin/next',
    args: 'start',
    instances: 1,
    autorestart: true,
    max_memory_restart: '500M',
    env_production: { NODE_ENV: 'production', PORT: 3000 },
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    error_file: '../../ops/logs/pm2-error.log',
    out_file: '../../ops/logs/pm2-out.log',
    merge_logs: true,
  }],
};
