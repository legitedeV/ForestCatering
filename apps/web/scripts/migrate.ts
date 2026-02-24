import { spawn } from 'node:child_process'
import path from 'node:path'

async function run() {
  const payloadBin = path.resolve(process.cwd(), '../../node_modules/payload/bin.js')

  await new Promise<void>((resolve, reject) => {
    const child = spawn(
      'node',
      [payloadBin, 'migrate', '--config', 'payload.config.ts', '--tsconfig', 'tsconfig.payload.json'],
      {
        stdio: 'inherit',
        env: {
          ...process.env,
          PAYLOAD_CONFIG_PATH: process.env.PAYLOAD_CONFIG_PATH || './payload.config.ts',
        },
      },
    )

    child.on('error', reject)
    child.on('exit', (code) => {
      if (code === 0) {
        resolve()
        return
      }
      reject(new Error(`Payload CLI exited with code ${code ?? 'unknown'}`))
    })
  })

  console.log('✅ Payload migrations completed')
}

run().catch((err) => {
  console.error('❌ Migration failed:', err)
  process.exit(1)
})
