import path from 'path'
import fs from 'fs'
import payload from 'payload'
import config from '../../payload.config'

const MEDIA_DIR = path.resolve(process.cwd(), 'public/media')
const COLLECTION = 'media'

async function main() {
  await payload.init({
    config,
    local: true,
  })

  const files = fs
    .readdirSync(MEDIA_DIR)
    .filter((f) => /\.(jpe?g|png|webp|gif|avif)$/i.test(f))

  console.log(`Found ${files.length} files`)

  for (const filename of files) {
    const filePath = path.join(MEDIA_DIR, filename)

    const existing = await payload.find({
      collection: COLLECTION,
      where: { filename: { equals: filename } },
      limit: 1,
    })

    if (existing.docs.length) {
      console.log(`skip: ${filename}`)
      continue
    }

    await payload.create({
      collection: COLLECTION,
      data: { alt: filename },
      filePath,
    } as any)

    console.log(`imported: ${filename}`)
  }

  console.log('DONE ✅')
  process.exit(0)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
