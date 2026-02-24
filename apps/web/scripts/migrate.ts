import { migrate } from 'payload'
import payloadConfig from '../payload.config'

async function run() {
  await migrate({ config: payloadConfig })
  console.log('✅ Payload migrations completed')
  process.exit(0)
}

run().catch((err) => {
  console.error('❌ Migration failed:', err)
  process.exit(1)
})
