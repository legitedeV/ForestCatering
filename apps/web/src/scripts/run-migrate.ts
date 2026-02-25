import { spawnSync } from 'node:child_process'

const requiredVars = ['DATABASE_URI', 'PAYLOAD_SECRET'] as const
const missing = requiredVars.filter((name) => !process.env[name] || process.env[name]?.trim() === '')

if (missing.length > 0) {
  console.error(`❌ Missing required environment variable(s): ${missing.join(', ')}`)
  console.error('Tip: run `bash ops/scripts/gen-secrets.sh` and load env from `ops/.env` before migrations.')
  process.exit(1)
}

const result = spawnSync('payload', ['migrate'], {
  stdio: 'inherit',
  shell: true,
  env: process.env,
})

if (result.status !== 0) {
  process.exit(result.status ?? 1)
}
